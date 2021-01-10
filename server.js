// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT           = process.env.PORT || 8080;
const ENV            = process.env.ENV || "development";
const express        = require("express");
const bodyParser     = require("body-parser");
const sass           = require("node-sass-middleware");
const cookieSession  = require("cookie-session");
const methodOverride = require("method-override");
const app            = express();
const morgan         = require('morgan');

//Temp files
const { getQuizzes } = require('./testFiles/database');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

//setup cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(methodOverride('_method'));

// Separated Routes for each Resource
const usersRoutes = require("./routes/users");
const quizzesRoutes = require("./routes/quizzes");

// Mount all resource routes
app.use("/users", usersRoutes(db));
app.use("/quizzes", quizzesRoutes(db));

// Home page
app.get("/", (req, res) => {
  const templateVars = {
    quizzes: getQuizzes(),
    userID: req.session.userID
  };
  res.render("index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
