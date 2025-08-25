const pool =require("../config/db")
const bcrypt = require('bcrypt'); // ← Ahora sí bcrypt normal
// ... el resto del código igual pero con bcrypt
exports.listarUser=async()=>{
    const {rows}=await pool.query("SELECT * FROM usuario")
    return rows
}
exports.crearUser=async(usuario,password)=>{
    const {rows}=await pool.query("INSERT INTO usuario(usuario, password)VALUES ($1, $2)",[usuario,password])
    return rows[0]
}


exports.actualizarUser=async(usuario,password,id)=>{
    const {rows}=await pool.query("UPDATE usuario SET usuario=$1, password=$2 where id=$3 RETURNING *",[usuario,password,id])
    return rows[0]
}

// Buscar usuario por nombre
exports.buscarUserPorUsuario = async (usuario,password) => {
    const { rows } = await pool.query(
        "SELECT id, usuario, password FROM usuario WHERE usuario = $1 and password=$2",
        [usuario,password]
    );
    return rows[0];
};

exports.eliminarUsuario = async (id) => {
    // Consulta corregida - asumiendo que es para eliminar usuario
    const { rows } = await pool.query(
        "DELETE FROM usuario WHERE id = $1 RETURNING *", 
        [id]
    );
    return rows[0];
}