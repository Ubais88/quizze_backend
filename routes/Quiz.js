// Import the required modules
const express = require("express");
const router = express.Router();


// Import the required controllers and middleware functions
const { createQuiz, getAllQuiz, getDashboardStats, updateQuiz, deleteQuiz, playQuiz, quizAnalysis, getQuiz } = require("../controllers/Quiz");
const { authMiddleware } = require('../middlewares/authMiddleware')

// Route for user createQuiz 
router.post("/create",authMiddleware , createQuiz)
router.get("/getallquiz",authMiddleware, getAllQuiz)
router.get('/play/:quizId', playQuiz)
router.get('/getquiz/:quizId', getQuiz)
router.get('/getstats', authMiddleware , getDashboardStats)
router.put('/updatequiz/:quizId', updateQuiz)
router.delete('/delete/:quizId', authMiddleware , deleteQuiz)
router.get('/analysis/:quizId', authMiddleware , quizAnalysis)



 
// Export the router for use in the main application
module.exports = router;

