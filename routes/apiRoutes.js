const express = require('express');
const db = require('../helper');
const router = express.Router();

module.exports = () => {
  //returns a json of some public quizzes. Request counter will be used to load more quizzes
  router.get("/quizzes/:request_counter", (req, res) => {
    db.getQuizzes(3,req.params.request_counter)
      .then(results => {
        res.json(results);
      })
  })
  return router;
}
