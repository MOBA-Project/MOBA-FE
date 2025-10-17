const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bookmarkController");

router.post("/", ctrl.create);
router.get("/", ctrl.findAll);
router.get("/watched", ctrl.watched);
router.get("/tags", ctrl.tags);
router.get("/status/:movieId", ctrl.status);
router.get("/status", ctrl.bulkStatus);
router.get("/:id", ctrl.findOne);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
