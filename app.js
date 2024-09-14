const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./movies.js')

const app = express()

// desactivar el header x-powered-by que funciona para mostrar la version del express y es para seguridad.
app.disable('x-powered-by')

// usar el middleware json para parsear los datos enviados en el body del request.
app.use(express.json())

// usar el middleware cors para permitir el acceso a la api desde diferentes dominios.
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:3000',
      'http://localhost:1234',
      'http://localhost:59508']

    if (ACCEPTED_ORIGINS.includes(origin)) { callback(null, true) }
    if (!origin) { callback(null, true) }

    callback(new Error('Not allowed by CORS'))
  }
}))

// Obtener los datos de las movies.
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    return res.json(filteredMovies)
  }
  return res.json(movies)
})

// Crear una nueva movie
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result) return res.status(400).json({ error: JSON.parse(result.error.message) })

  const newMovie = {
    id: crypto.randomUUID(),
    ...result
  }

  movies.push(newMovie)

  // enviamos un status 201 por que este es el de "Creación"
  res.status(201).json(newMovie)
})

// Actualizar una movie.
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result) return res.status(400).json({ error: JSON.parse(result.error.message) })

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = updateMovie
  return res.json(updateMovie)
})

// Eliminar una movie.
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

// Obtener una movie segun su id.
app.get('/movies/:id', (req, res) => {
  const id = req.params.id

  const movie = movies.find(movie => movie.id === id)

  if (movie) return res.json(movie)

  if (!movie) return res.status(404).json({ message: 'Not found movies' })
})

// Escuchar el puerto.
const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
