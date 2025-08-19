const {crearProducto, listarProducto, actualizarProducto, softDeleteProducto,obtenerProductoPorId}=require("../models/producto")
const upload = require('../config/multer'); // Ajusta la ruta según tu estructura

// Middleware para subir una sola imagen
exports.uploadImage = upload.single('imagen');

exports.getProductoById = async (req, res, next) => {
    const { id } = req.params; // ← Obtener el ID de los parámetros
    
    try {
        const response = await obtenerProductoPorId(id); // ← Pasar el ID
        
        if (!response) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Agregar la URL completa de la imagen
        const productoConImagenUrl = {
            ...response,
            imagenUrl: response.imagen ? `${req.protocol}://${req.get('host')}/uploads/${response.imagen}` : null
        };
        
        res.status(200).json(productoConImagenUrl);
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

        // Guardar solo el nombre del archivo en la base de datos
        const imagenNombre = req.file.filename;

        const response = await crearProducto(
            idmarca, 
            idtipo, 
            imagenNombre, // Solo el nombre del archivo
            detalle, 
            cilindrada, 
            precio, 
            titulo
        );
        
        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: response,
            imagen: imagenNombre
        });
    } catch (error) {
        next(error);
    }
};

exports.getProducto = async (req, res, next) => {
    try {
        const response = await listarProducto();
        
        // Agregar la URL completa de la imagen a cada producto
        const productosConImagenUrl = response.map(producto => ({
            ...producto,
            imagenUrl: producto.imagen ? `${req.protocol}://${req.get('host')}/uploads/${producto.imagen}` : null
        }));
        
        res.status(200).json(productosConImagenUrl);
    } catch (error) {
        next(error);
    }
};

exports.updateProducto = async (req, res, next) => {
    const { id } = req.params;
    const { idmarca, idtipo, detalle, cilindrada, precio, titulo } = req.body;
    
    try {
        let imagenNombre = req.body.imagen; // Mantener la imagen actual por defecto

        // Si se subió una nueva imagen
        if (req.file) {
            imagenNombre = req.file.filename;
            
            // Opcional: Eliminar la imagen anterior si existe
            const productoActual = await obtenerProductoPorId(id);
            if (productoActual && productoActual.imagen) {
                const fs = require('fs');
                const path = require('path');
                const imagePath = path.join(__dirname, '../uploads', productoActual.imagen);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        const response = await actualizarProducto(
            idmarca, 
            idtipo, 
            imagenNombre, 
            detalle, 
            cilindrada, 
            precio, 
            titulo, 
            id
        );
        
        res.status(200).json({
            message: 'Producto actualizado exitosamente',
            producto: response,
            imagen: imagenNombre
        });
    } catch (error) {
        next(error);
    }
};
exports.deactivateProducto = async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await softDeleteProducto(id);
        res.status(200).json(response); // 200 OK es más apropiado que 202 Accepted
    } catch (error) {
        next(error);
    }
};