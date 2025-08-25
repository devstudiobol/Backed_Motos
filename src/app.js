require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const helmet = require("helmet")
const cors = require('cors')
const userRoutes = require("./routes/userRoutes")
const marcaRoutes = require("./routes/marcaRoutes")
const tipoRoutes = require("./routes/tipoRoutes")
const productoRoutes = require("./routes/productoRoutes")
const authRoutes = require("./routes/authRoutes")
const errorHandler = require("./middleware/errorHandler")
const path = require('path');
const fs = require('fs');

// Importar la inicialización de la BD
const initDatabase = require("../src/config/init"); // ← AÑADE ESTO
const pool = require("../src/config/db"); // ← AÑADE ESTO

const app = express()
app.use(cors())
const PORT = process.env.PORT || 3000 // ← USA process.env.PORT

app.use(helmet());
app.use(bodyParser.json())

// DEBUG: Verificar rutas
const uploadsPath = path.join(__dirname, '..', 'uploads');
console.log('📁 Ruta actual de __dirname:', __dirname);
console.log('📁 Ruta corregida de uploads:', uploadsPath);
console.log('✅ ¿Existe la carpeta uploads?', fs.existsSync(uploadsPath));

// Servir archivos estáticos con la ruta corregida
app.use('/uploads', express.static(uploadsPath));

// Ruta alternativa para imágenes
app.get('/uploads/:imageName', (req, res) => {
    try {
        const imageName = req.params.imageName;
        const imagePath = path.join(__dirname, '..', 'uploads', imageName);
        
        console.log('🔍 Buscando imagen:', imagePath);
        
        if (fs.existsSync(imagePath)) {
            res.sendFile(imagePath);
        } else {
            res.status(404).json({ 
                error: 'Imagen no encontrada',
                path: imagePath
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar la imagen' });
    }
});

// Rutas de la API
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes)
app.use("/api/marca", marcaRoutes)
app.use("/api/tipo", tipoRoutes)
app.use("/api/producto", productoRoutes)

// Ruta de salud para verificar que funciona
app.get('/health', async (req, res) => {
    try {
        // Verificar conexión a la BD
        await pool.query('SELECT 1');
        res.json({ 
            status: 'OK', 
            message: 'API y Base de Datos funcionando correctamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'Error conectando a la base de datos',
            error: error.message 
        });
    }
});

app.use(errorHandler)

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
        
        // 3. Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
            console.log(`🌐 Health check disponible en http://localhost:${PORT}/health`);
        });
        
    } catch (error) {
        console.error('❌ Error crítico al iniciar la aplicación:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1); // Salir con error
    }
};

// Iniciar la aplicación
startServer(); // ← REEMPLAZA app.listen() con esto