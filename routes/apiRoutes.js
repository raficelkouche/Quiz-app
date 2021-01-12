const express = require('express');
const db = require('../testFiles/database');
const router = express.Router();
let request_counter = 0;

module.exports = () => {
  //returns a json of all the public quizzes
  router.get("/quizzes", (req, res) => {
    db.getQuizzes(requestCounter)
      .then(results => {
        requestCounter++;
        console.log(results);
        res.json(results);
      })
  })
}
