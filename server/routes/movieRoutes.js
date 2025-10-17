const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

// Specific routes first to avoid ":id" capturing them
router.get("/search", movieController.searchMovies);
router.get("/:id/videos", movieController.getMovieVideos);
router.get("/:id/credits", movieController.getMovieCredits);
router.get("/:id/similar", movieController.getSimilarMovies);
router.get("/:id", movieController.getMovieDetails);
router.get("/", movieController.getMovies);

module.exports = router;
