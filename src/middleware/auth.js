const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura';

// Verificar token
exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido.' });
    }
};

// Middleware para requerir autenticación (solo logged in)
exports.requireAuth = exports.verifyToken;

// Middleware para requerir permisos de administrador (editar/eliminar)
exports.requireAdmin = (req, res, next) => {
    exports.verifyToken(req, res, () => {
        // Aquí puedes agregar lógica de roles si tu sistema tiene diferentes niveles
        // Por ahora, cualquier usuario logueado puede editar/eliminar
        next();
    });
};

// Generar token
exports.generateToken = (userId, usuario) => {
    return jwt.sign({ id: userId, usuario }, JWT_SECRET, { expiresIn: '24h' });
};