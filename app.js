require("dotenv").config();
require('./models/connection');
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var profileRouter = require("./routes/profile");
var gameRouter = require("./routes/games");
var ratingRouter = require("./routes/ratings");

var app = express();

const cors = require("cors");
app.use(cors({
    origin: 'https://gamecho-frontend.vercel.app', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));


const fileUpload = require("express-fileupload");
app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/profile", profileRouter);
app.use("/games", gameRouter);
app.use("/ratings", ratingRouter);

module.exports = app;
