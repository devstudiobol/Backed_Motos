const { crearProducto, listarProducto, actualizarProducto, softDeleteProducto, obtenerProductoPorId } = require("../models/producto");
const upload = require('../config/upload'); // Cambia la ruta al nuevo middleware
const { cloudinary } = require('../config/cloudinary');

// Middleware para subir una sola imagen (ahora con Cloudinary)
exports.uploadImage = upload.single('imagen');

exports.getProductoById = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const response = await obtenerProductoPorId(id);
        
        if (!response) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Ya no necesitamos construir la URL manualmente
        // Cloudinary ya nos proporciona una URL completa
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

        // Guardar la URL de Cloudinary y el public_id en la base de datos
        const imagenUrl = req.file.path;
        const imagenPublicId = req.file.filename; // Este es el public_id de Cloudinary

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
            producto: response,
            imagen: imagenUrl
        });
    } catch (error) {
        next(error);
    }
};

exports.getProducto = async (req, res, next) => {
    try {
        const response = await listarProducto();
        
        // Ya no necesitamos construir URLs manualmente
        // Cloudinary ya nos proporciona URLs completas
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
        let imagenPublicId = req.body.imagenPublicId;

        // Si se subió una nueva imagen
        if (req.file) {
            imagenUrl = req.file.path;
            imagenPublicId = req.file.filename;
            
            // Eliminar la imagen anterior de Cloudinary si existe
            const productoActual = await obtenerProductoPorId(id);
            if (productoActual && productoActual.imagenPublicId) {
                try {
                    await cloudinary.uploader.destroy(productoActual.imagenPublicId);
                } catch (error) {
                    console.error("Error al eliminar imagen anterior de Cloudinary:", error);
                    // No fallamos la operación principal por esto
                }
            }
        }

        const response = await actualizarProducto(
            idmarca, 
            idtipo, 
            imagenUrl, 
            detalle, 
            cilindrada, 
            precio, 
            titulo, 
            id
        );
        
        res.status(200).json({
            message: 'Producto actualizado exitosamente',
            producto: response,
            imagen: imagenUrl
        });
    } catch (error) {
        next(error);
    }
};

// Agregar esta función para eliminar imágenes cuando se elimine un producto
exports.deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error);
    }
};

exports.deactivateProducto = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Opcional: eliminar la imagen de Cloudinary al desactivar el producto
        const producto = await obtenerProductoPorId(id);
        if (producto && producto.imagenPublicId) {
            await exports.deleteImage(producto.imagenPublicId);
        }
        
        const response = await softDeleteProducto(id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};