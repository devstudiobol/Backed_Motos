require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const helmet = require("helmet")
const cors = require('cors')
const userRoutes = require("./routes/userRoutes")
const marcaRoutes = require("./routes/marcaRoutes")
const tipoRoutes = require("./routes/tipoRoutes")
const productoRoutes = require("./routes/productoRoutes")
const authRoutes=require("./routes/authRoutes")
const errorHandler = require("./middleware/errorHandler")
const path = require('path');
const fs = require('fs');

const app = express()
app.use(cors())
const PORT = 3000

app.use(helmet());
app.use(bodyParser.json())

// DEBUG: Verificar rutas
const uploadsPath = path.join(__dirname, '..', 'uploads'); // ← CAMBIA ESTO
console.log('📁 Ruta actual de __dirname:', __dirname);
console.log('📁 Ruta corregida de uploads:', uploadsPath);
console.log('✅ ¿Existe la carpeta uploads?', fs.existsSync(uploadsPath));

// Servir archivos estáticos con la ruta corregida
app.use('/uploads', express.static(uploadsPath));

// Ruta alternativa para imágenes
app.get('/uploads/:imageName', (req, res) => {
    try {
        const imageName = req.params.imageName;
        const imagePath = path.join(__dirname, '..', 'uploads', imageName); // ← CAMBIA ESTO
        
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

app.use(errorHandler)
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes)
app.use("/api/marca", marcaRoutes)
app.use("/api/tipo", tipoRoutes)
app.use("/api/producto", productoRoutes)

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`)
})