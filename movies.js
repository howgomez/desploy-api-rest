// Zod es una libreria de validación de datos para Node.js que permite definir esquemas de datos y validar objetos con ellos.
const z = require('zod')

const moviesSheme = z.object({
  title: z.string({
    required_error: 'El título es obligatorio y no debe ser un número'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().positive().max(10).min(0).default(1),
  poster: z.string().url(),
  genre: z.array(
    z.enum(['Comedy', 'Drama', 'Action', 'Thriller', 'Horror', 'Romance', 'Sci-fi', 'Documentary', 'Animation', 'Musical', 'Crime']),
    {
      required_error: 'Movie genre is required',
      invalidad_type_error: 'Movie genre must be an array of strings'
    }
  )
})

// Esto es parte de Zod, sirve para recibir la data o un error de validación.
function validateMovie (object) {
  return moviesSheme.safeParse(object)
}

// Partial es para validar partes de un objeto o no hacerlo. Por ejemplo, si el usuario no envia algunso datos no importa.
// Estos metodos sirve para PATCH Y PUT.

function validatePartialMovie (object) {
  return moviesSheme.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
