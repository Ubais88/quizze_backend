const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const database = require("./config/database");
const userRoutes = require("./routes/User");


const PORT = process.env.PORT || 4000;
database.dbconnect();
app.use(express.json());

// routes
app.use("/api/v1/auth", userRoutes);



app.listen(PORT , () => { 
    console.log("App listening on port" ,PORT)
})
app.get('/', (req , res) => {
    res.send("<h1>Quizzie Is Working Fine</h1>")
})

