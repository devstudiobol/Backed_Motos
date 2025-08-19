const express= require('express')
const router=express.Router();
const { createTipo,updateTipo,deactivateTipo,getTipo}=require("../controllers/tipoController");

router.get("/",getTipo)
router.post("/",createTipo)
router.put("/:id",updateTipo)
// Usar DELETE pero aclarar que es un soft delete
router.delete("/:id", deactivateTipo);
module.exports=router