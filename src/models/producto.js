const pool=require("../config/db")

exports.listarProducto=async()=>{
    const {rows}=await pool.query("SELECT * FROM producto Where estado='Activo'")
    return rows 
}
// Agrega esta función al modelo
exports.obtenerProductoPorId = async (id) => {
    const { rows } = await pool.query("SELECT * FROM producto WHERE id = $1", [id]);
    return rows[0];
};

exports.crearProducto = async (idmarca, idtipo, imagen, detalle, cilindrada, precio, titulo) => {
    const estado = "Activo";
    const { rows } = await pool.query(
        "INSERT INTO producto (idmarca, idtipo, imagen, detalle, cilindrada, precio, estado, titulo) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [idmarca, idtipo, imagen, detalle, cilindrada, precio, estado, titulo]
    );
    return rows[0];
};
exports.actualizarProducto=async(idmarca,idtipo,imagen,detalle,cilindrada,precio,titulo,id)=>{
    const {rows}=await pool.query("UPDATE producto SET idmarca=$1, idtipo=$2, imagen=$3, detalle=$4, cilindrada=$5, precio=$6, titulo=$7 where id=$8 RETURNING *",[idmarca,idtipo,imagen,detalle,cilindrada,precio,titulo,id])
    return rows[0]
}

exports.softDeleteProducto = async (id) => {
    const estado = "Inactivo";
    const { rows } = await pool.query(
        "UPDATE producto SET estado = $1 WHERE id = $2 RETURNING *",
        [estado, id]
    );
    return rows[0];
};
