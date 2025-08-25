require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require('cors');
const userRoutes = require("./routes/userRoutes");
const marcaRoutes = require("./routes/marcaRoutes");
const tipoRoutes = require("./routes/tipoRoutes");
const productoRoutes = require("./routes/productoRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const path = require('path');
const fs = require('fs');

// Importar la inicialización de la BD
const initDatabase = require("./config/init");
const pool = require("./config/db");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging de requests (útil para debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Configuración de Cloudinary
const { cloudinary } = require('./config/cloudinary');
console.log('✅ Cloudinary configurado correctamente');

// Ruta de salud para verificar que funciona
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la BD
    await pool.query('SELECT 1');
    
    // Verificar conexión a Cloudinary
    await cloudinary.api.ping();
    
    res.json({ 
      status: 'OK', 
      message: 'API, Base de Datos y Cloudinary funcionando correctamente',
      timestamp: new Date().toISOString(),
      services: {
        database: 'conectado',
        cloudinary: 'conectado'
      }
    });
  } catch (error) {
    console.error('Error en health check:', error);
    
    let errorMessage = 'Error en health check';
    let serviceStatus = {
      database: 'error',
      cloudinary: 'error'
    };
    
    // Intentar determinar qué servicio falla
    try {
      await pool.query('SELECT 1');
      serviceStatus.database = 'conectado';
    } catch (dbError) {
      errorMessage += ', problema con la base de datos';
    }
    
    res.status(500).json({ 
      status: 'ERROR', 
      message: errorMessage,
      services: serviceStatus,
      error: error.message 
    });
  }
});

// Rutas de la API
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes);
app.use("/api/marca", marcaRoutes);
app.use("/api/tipo", tipoRoutes);
app.use("/api/producto", productoRoutes);

// Ruta para verificar el estado de Cloudinary
app.get('/api/cloudinary-status', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'motocicletas',
      max_results: 1
    });
    
    res.json({
      status: 'success',
      message: 'Cloudinary conectado correctamente',
      resources_count: result.resources.length,
      folder: 'motocicletas'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error conectando con Cloudinary',
      error: error.message
    });
  }
});

// Ruta para subir una imagen de prueba a Cloudinary
app.post('/api/test-upload', async (req, res) => {
  try {
    // Esto es solo para testing - en producción usarías multer
    const result = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      { folder: 'motos/test' }
    );
    
    res.json({
      status: 'success',
      message: 'Imagen de prueba subida correctamente',
      image: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error en prueba de subida',
      error: error.message
    });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo de errores global
app.use(errorHandler);

// Función para iniciar el servidor con inicialización de BD
const startServer = async () => {
  try {
    console.log('🔄 Iniciando aplicación...');
    
    // 1. Conectar a la base de datos
    await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    
    // 2. Inicializar tablas (si no existen)
    await initDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    
    // 3. Verificar configuración de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️  Advertencia: Variables de entorno de Cloudinary no configuradas');
      console.warn('   Las funcionalidades de imagen no funcionarán correctamente');
    } else {
      console.log('✅ Cloudinary configurado correctamente');
    }
    
    // 4. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
      console.log(`🌐 Health check disponible en http://localhost:${PORT}/health`);
      console.log(`📸 Ruta de estado Cloudinary: http://localhost:${PORT}/api/cloudinary-status`);
      console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar la aplicación:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔻 Recibida señal de interrupción, cerrando servidor...');
  try {
    await pool.end();
    console.log('✅ Conexiones de base de datos cerradas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔻 Recibida señal de terminación, cerrando servidor...');
  try {
    await pool.end();
    console.log('✅ Conexiones de base de datos cerradas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error);
    process.exit(1);
  }
});

// Iniciar la aplicación
startServer();