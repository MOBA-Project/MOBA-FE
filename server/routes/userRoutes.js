const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/check-id", userController.checkId);
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/protected", userController.protected);
router.put("/update", userController.update);

module.exports = router;
