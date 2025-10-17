const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Auth endpoints per Swagger
router.post("/signup", userController.authSignup);
router.post("/login", userController.authLogin);
router.get("/protected", userController.authProtected);
router.post("/check-id", userController.checkId); // reuse check-id
router.put("/update", userController.authUpdate);
router.post("/refresh", userController.authRefresh);
router.delete("/delete", userController.authDelete || ((req, res)=>res.status(200).json({ ok: true })));
router.post("/logout", userController.authLogout);

module.exports = router;
