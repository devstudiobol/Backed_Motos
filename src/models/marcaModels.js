const pool=require("../config/db")

exports.crearMarca=async(descripcion)=>{
    const estado="activo"
    const {rows}= await pool.query("INSERT INTO marca (descripcion,estado) VALUES($1,$2)",[descripcion,estado])
    return rows[0]
}

exports.listarMarca=async()=>{
    const {rows}=await pool.query("SELECT* FROM marca ")
    return rows
}
exports.actualizarMarca=async(descripcion, id)=>{
    const  {rows}=await pool.query("UPDATE marca SET descripcion=$1 where id=$2 RETURNING *",[descripcion,id])
    return rows[0]
}
exports.eliminarMarca=async(id)=>{
    const estado="Inactivo"
    const {rows}=await pool.query("UPDATE marca SET estado=$1 where id=$2 RETURNING *",[estado,id])
    return rows[0]
}