// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const { signup, login } = require("../controllers/Auth");


// Route for user signup
router.post("/signup", signup)
// Route for user login
router.post("/login", login)

// Export the router for use in the main application
module.exports = router;

