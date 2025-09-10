const express = require('express');
const router = express.Router();
const { createUser, getUser, updateUser, deleteUser } = require("../controllers/usuarioController");
const { verifyToken } = require("../middleware/auth");

// Rutas
router.get("/", verifyToken, getUser);        // protegida, solo usuarios logueados
router.post("/", createUser);                 // crear usuario puede estar libre (registro)
router.put("/:id", verifyToken, updateUser);  // solo logueados pueden actualizar
router.delete("/:id", verifyToken, deleteUser); // ✅ aquí protegemos deleteUser

module.exports = router;
