
const {listarUser,crearUser, actualizarUser, eliminarUsuario}=require("../models/usarioModel")

exports.getUser=async(req,res,next)=>{
    try {
        const users=await listarUser()
         res.status(200).json(users)
        
    } catch (error) {
        next(error)
    }
}

exports.createUser=async(req,res,next)=>{
    const {usuario,password}=req.body

     try {
            const response=await crearUser(usuario, password)
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
}

exports.updateUser=async(req,res,next)=>{
    const {id}=req.params
    const {usuario,password}=req.body
    try {
        const response= await  actualizarUser(usuario,password,id)
        res.status(202).json(response)
    } catch (error) {
        next(error)
    }
}
exports.deleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Verificar si el usuario logueado intenta eliminarse a sí mismo
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({ error: "No puedes eliminar tu propio usuario mientras estás logueado." });
        }

        const response = await eliminarUsuario(id);

        if (response.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(202).json({ message: "Usuario eliminado correctamente" });

    } catch (error) {
        next(error);
    }
};



