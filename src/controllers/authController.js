const { buscarUserPorUsuario, verificarPassword } = require('../models/usarioModel');
const { generateToken } = require('../middleware/auth');

exports.login = async (req, res, next) => {
    const { usuario, password } = req.body;

    try {
        // Validar campos
        if (!usuario || !password) {
            return res.status(400).json({ error: 'Usuario y password son requeridos' });
        }

        // Buscar usuario
        const user = await buscarUserPorUsuario(usuario,password);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas user' });
        }

   
        // Generar token
        const token = generateToken(user.id, user.usuario);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                usuario: user.usuario
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.verify = async (req, res) => {
    res.json({
        message: 'Token válido',
        user: req.user
    });
};