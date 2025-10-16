const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Mirror endpoints expected by FE's /auth/* calls
router.get("/protected", userController.authProtected);
router.put("/update", userController.authUpdate);
router.post("/check-id", userController.checkId); // reuse

// Optional no-op endpoints for compatibility
router.post("/logout", (req, res) => res.status(200).json({ ok: true }));
router.delete("/delete", userController.deleteAccount || ((req, res)=>res.status(501).json({ message: 'not implemented' })));
router.post("/refresh", (req, res) => res.status(200).json({ accessToken: null }));

module.exports = router;

