// Import the required modules
const express = require("express");
const router = express.Router();


// Import the required controllers and middleware functions
const { createQuiz, getQuiz, getAllQuiz, getDashboardStats, updateQuiz } = require("../controllers/Quiz");


// Route for user createQuiz 
router.post("/create/:userId", createQuiz)
router.post("/getallquiz/:userId", getAllQuiz)
router.get('/play/:quizId', getQuiz)
router.get('/getstats', getDashboardStats)
router.post('/updatequiz/:quizId', updateQuiz)


// Export the router for use in the main application
module.exports = router;

