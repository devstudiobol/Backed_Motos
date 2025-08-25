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
    console.log('📦 Body recibido:', req.body);
    console.log('🖼️ Archivo recibido:', req.file);
    
    const { idmarca, idtipo, detalle, cilindrada, precio, titulo } = req.body;
    
    try {
        // Verificar si se subió una imagen
        if (!req.file) {
            console.log('❌ No se recibió archivo');
            return res.status(400).json({ error: 'Debe subir una imagen' });
        }

        console.log('✅ Archivo procesado por Multer:', req.file);

        // Verificar que Cloudinary devolvió la URL
        if (!req.file.path || !req.file.path.startsWith('http')) {
            console.error('❌ URL de Cloudinary inválida:', req.file.path);
            return res.status(500).json({ 
                error: 'Error al subir la imagen a Cloudinary',
                details: 'URL inválida recibida'
            });
        }

        const imagenUrl = req.file.path;
        const imagenPublicId = req.file.filename;

        console.log('🌐 URL de Cloudinary:', imagenUrl);
        console.log('🔑 Public ID:', imagenPublicId);

        const response = await crearProducto(
            parseInt(idmarca), 
            parseInt(idtipo), 
            imagenUrl,
            detalle, 
            cilindrada, 
            parseFloat(precio), 
            titulo
        );
        
        console.log('✅ Producto creado en BD:', response);
        
        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: response
        });
    } catch (error) {
        console.error('❌ Error en createProducto:', error);
        
        // Manejo específico de errores de base de datos
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({ 
                error: 'Marca o tipo inválido',
                details: 'Verifica que la marca y tipo existan'
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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