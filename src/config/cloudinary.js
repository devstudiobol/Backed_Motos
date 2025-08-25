const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Verificar que las variables de entorno estén presentes
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Faltan variables de entorno de Cloudinary');
  console.error('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');
  console.error('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅' : '❌');
  console.error('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅' : '❌');
}

// Configurar Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configurado correctamente');
} catch (error) {
  console.error('❌ Error configurando Cloudinary:', error.message);
}

// Configurar el almacenamiento para Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'motos', // ← ¡AQUÍ! Usa 'motos' en lugar de 'motocicletas'
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 600, crop: 'limit' }]
    };
  },
});

// Manejar errores de Cloudinary
storage._handleFile = function _handleFile(req, file, cb) {
  this.cloudinary.uploader.upload_stream(
    { 
      folder: 'motos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 600, crop: 'limit' }]
    },
    (error, result) => {
      if (error) {
        console.error('❌ Error subiendo a Cloudinary:', error);
        return cb(error);
      }
      if (!result) {
        return cb(new Error('Cloudinary no devolvió resultado'));
      }
      cb(null, {
        path: result.secure_url,
        filename: result.public_id,
        size: result.bytes
      });
    }
  ).end(file.stream);
};

module.exports = {
  cloudinary,
  storage
};