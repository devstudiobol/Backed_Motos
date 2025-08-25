const { Pool } = require("pg")
require('dotenv').config()

// Mejor práctica: usa DATABASE_URL si existe, sino variables individuales
const connectionConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    }

const pool = new Pool(connectionConfig)

// Manejo de errores mejorado
pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL')
})

pool.on('error', (err) => {
  console.error('Error inesperado en la pool de conexiones:', err)
  process.exit(-1)
})

module.exports = pool