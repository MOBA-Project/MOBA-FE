const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieDetails);
router.get("/:id/videos", movieController.getMovieVideos);

module.exports = router;
