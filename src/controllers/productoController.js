const {crearProducto, listarProducto, actualizarProducto, softDeleteProducto, obtenerProductoPorId} = require("../models/producto")
const upload = require('../config/multer');
const { cloudinary } = require('../config/cloudinary');

// Middleware para subir una sola imagen (se mantiene igual)
exports.uploadImage = upload.single('imagen');

exports.getProductoById = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const response = await obtenerProductoPorId(id);
        
        if (!response) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Ya no necesitamos construir la URL manualmente
        // Cloudinary nos devuelve la URL completa en la respuesta
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.createProducto = async (req, res, next) => {
    const { idmarca, idtipo, detalle, cilindrada, precio, titulo } = req.body;
    
    try {
        // Verificar si se subió una imagen
        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir una imagen' });
        }

        // Con Cloudinary, req.file ya tiene la información completa
        const imagenUrl = req.file.path; // URL completa de Cloudinary
        const imagenPublicId = req.file.filename; // public_id de Cloudinary

        const response = await crearProducto(
            idmarca, 
            idtipo, 
            imagenUrl, // Guardamos la URL completa
            detalle, 
            cilindrada, 
            precio, 
            titulo
        );
        
        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: response
        });
    } catch (error) {
        next(error);
    }
};

exports.getProducto = async (req, res, next) => {
    try {
        const response = await listarProducto();
        
        // Ya no necesitamos mapear para construir URLs
        // Las URLs ya vienen completas desde la base de datos
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.updateProducto = async (req, res, next) => {
    const { id } = req.params;
    const { idmarca, idtipo, detalle, cilindrada, precio, titulo } = req.body;
    
    try {
        let imagenUrl = req.body.imagen; // Mantener la imagen actual por defecto

        // Si se subió una nueva imagen
        if (req.file) {
            imagenUrl = req.file.path; // Nueva URL de Cloudinary
            
            // Opcional: Eliminar la imagen anterior de Cloudinary
            const productoActual = await obtenerProductoPorId(id);
            if (productoActual && productoActual.imagen) {
                try {
                    // Extraer public_id de la URL (asumiendo que guardaste el public_id)
                    // Si no guardaste el public_id, puedes omitir esta parte
                    const urlParts = productoActual.imagen.split('/');
                    const publicIdWithExtension = urlParts[urlParts.length - 1];
                    const publicId = publicIdWithExtension.split('.')[0];
                    
                    await cloudinary.uploader.destroy(`motocicletas/${publicId}`);
                } catch (error) {
                    console.error('Error al eliminar imagen anterior de Cloudinary:', error);
                    // No fallamos la operación principal por esto
                }
            }
        }

        const response = await actualizarProducto(
            idmarca, 
            idtipo, 
            imagenUrl, // Usamos la URL completa
            detalle, 
            cilindrada, 
            precio, 
            titulo, 
            id
        );
        
        res.status(200).json({
            message: 'Producto actualizado exitosamente',
            producto: response
        });
    } catch (error) {
        next(error);
    }
};

exports.deactivateProducto = async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await softDeleteProducto(id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};