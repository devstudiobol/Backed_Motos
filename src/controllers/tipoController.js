const {crearTipo, listarTipo, actualizarTipo, softDeleteTipo}=require("../models/tipoModels")

exports.createTipo=async(req,res,next)=>{
    const {descripcion}=req.body
    try {
        const response=await crearTipo(descripcion)
        res.status(202).json(response)
    } catch (error) {
        next(error)
        
    }
}

exports.getTipo=async(req,res,next)=>{
    try {
        const response=await listarTipo()
        res.status(202).json(response)
    } catch (error) {
        next(error)
        
    }
}
exports.updateTipo=async(req,res,next)=>{
    const {id}=req.params
    const{descripcion}=req.body
    try {
        const response=await actualizarTipo(descripcion,id)
        res.status(202).json(response)
    } catch (error) {
        next(error)
    }
}
exports.deactivateTipo = async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await softDeleteTipo(id);
        res.status(200).json(response); // 200 OK es más apropiado que 202 Accepted
    } catch (error) {
        next(error);
    }
};