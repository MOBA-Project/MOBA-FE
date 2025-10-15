const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

// Specific routes first to avoid ":id" capturing them
router.get("/search", movieController.searchMovies);
router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieDetails);
router.get("/:id/videos", movieController.getMovieVideos);

module.exports = router;
