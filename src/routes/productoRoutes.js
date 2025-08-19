const express = require('express');
const router = express.Router();
const {
    getProducto,
    getProductoById,
    createProducto,
    updateProducto,
    deactivateProducto,
    uploadImage
} = require('../controllers/productoController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET - Obtener todos los productos (público)
router.get('/', getProducto);

// GET - Obtener producto por ID (público)
router.get('/:id', getProductoById);

// POST - Crear producto (requiere login y admin)
router.post('/', requireAdmin, uploadImage, createProducto);

// PUT - Actualizar producto (requiere login y admin)
router.put('/:id', requireAdmin, uploadImage, updateProducto);

// DELETE - Eliminar producto (requiere login y admin)
router.delete('/:id', requireAdmin, deactivateProducto);

module.exports = router;