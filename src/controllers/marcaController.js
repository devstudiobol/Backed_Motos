const {crearMarca, listarMarca, actualizarMarca, eliminarMarca}=require('../models/marcaModels')

exports.createMarca=async(req,res,next)=>{
    const {descripcion}=req.body
    try {
        const response=await crearMarca(descripcion)
        res.status(202).json(response)
    } catch (error) {
        next(error)
        
    }

}


exports.getMarca=async(req,res,next)=>{
    try {
        const response=await listarMarca()
        res.status(202).json(response)
    } catch (error) {
        next(error)
        
    }
}
exports.updateMarca=async(req,res,next)=>{
    const {id}=req.params
    const{descripcion}=req.body
    try {
        const response=await actualizarMarca(descripcion,id)
        res.status(202).json(response)
    } catch (error) {
        next(error)
    }
}
exports.deactivateMarca = async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await eliminarMarca(id);
        res.status(200).json(response); // 200 OK es más apropiado que 202 Accepted
    } catch (error) {
        next(error);
    }
};