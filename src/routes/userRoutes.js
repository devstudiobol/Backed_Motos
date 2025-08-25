const express= require('express')
const router=express.Router();
const {createUser, getUser, updateUser,deleteUser}=require("../controllers/usuarioController");

router.get("/",getUser)
router.post("/",createUser)
router.put("/:id",updateUser)
router.delete("/:id",deleteUser)

module.exports=router