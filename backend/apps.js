const express = require('express');
const app = express();
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const connectDB = require('./config/db')
const authRoute = require("./routes/auth");
const tutorRoute = require("./routes/tutor");
const studentsRoute = require("./routes/students");

dotenv.config();

// database connection
connectDB();


app.use(bodyParser.json());

app.use("/api/auth", authRoute);

app.use("/api/tutor", tutorRoute);

app.use("/api/students", studentsRoute);



const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

