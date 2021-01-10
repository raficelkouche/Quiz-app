/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // returns a json object containing all the quizzes
  router.get("/", (req, res) => {
    //call getQuizzes(range) here
    const queryString = `SELECT * FROM quizzes;`;
    console.log(queryString);
    db.query(queryString)
      .then(data => {
        const quizzes = data.rows;
        res.json({ quizzes });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  // inserts a new quiz and redirects to "my quizzes" page
  router.post("/", (req, res) => {
    const userID = req.session.userID;
    if (userID) {
      //all the information will be passed from the html form except the userID and quiz_url
      addQuiz({ userID, title, description, visibility, photo_url, quiz_url, category })
      res.render("user_quizzes", {userID});
    } else {
      //redirecting is not necessary since this case won't occur in a browser
      res.status(403).send('Forbidden');
    }
  })


  return router;
};
