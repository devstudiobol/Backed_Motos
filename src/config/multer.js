const multer = require('multer');
const { storage } = require('./cloudinary'); // Importamos el storage configurado

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const upload = multer({
  storage: storage, // Usamos Cloudinary en lugar de diskStorage
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // Límite de 5MB
  }
});

module.exports = upload;