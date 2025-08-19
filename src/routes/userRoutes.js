const express= require('express')
const router=express.Router();
const {createUser, getUser, updateUser}=require("../controllers/usuarioController");

router.get("/",getUser)
router.post("/",createUser)
router.put("/:id",updateUser)


module.exports=router