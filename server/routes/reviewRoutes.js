const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Reviews
router.post("/", reviewController.createReview);
router.get("/movie/:movieId", reviewController.getReviewsByMovie);
router.get("/movie/:movieId/stats", reviewController.getMovieStats);
router.get("/user/me", reviewController.getMyReviews);
router.get("/:reviewId", reviewController.getReviewById);
router.put("/:reviewId", reviewController.updateReview);
router.delete("/:reviewId", reviewController.deleteReview);
router.post("/:reviewId/like", reviewController.likeReview);
router.post("/:reviewId/dislike", reviewController.dislikeReview);
router.get("/:reviewId/reaction", reviewController.getReactionStatus);

// Comments (Instagram-style: replies attach to root comment only)
router.get("/:reviewId/comments", reviewController.getComments);
router.post("/:reviewId/comments", reviewController.addComment);
router.put("/:reviewId/comments/:commentId", reviewController.updateComment);
router.delete("/:reviewId/comments/:commentId", reviewController.deleteComment);
router.get("/:reviewId/comments/:commentId/reaction", reviewController.getCommentReactionStatus);
router.post("/:reviewId/comments/:commentId/react", reviewController.reactToComment);

module.exports = router;

