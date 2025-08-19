const express= require('express')
const router=express.Router();
const { createMarca, getMarca, updateMarca,deactivateMarca}=require("../controllers/marcaController");

router.get("/",getMarca)
router.post("/",createMarca)
router.put("/:id",updateMarca)
router.delete("/:id",deactivateMarca)



module.exports=router