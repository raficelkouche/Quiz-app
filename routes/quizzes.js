/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  //displays all the publicly available quizzes
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

  //inserts a new quiz and redirects to "my quizzes" page
  router.post("/", (req, res) => {
    const userID = req.session.userID;
    if (userID) {
      //all the information will be passed from the html form except the userID and quiz_url
      addQuiz({ userID, title, description, visibility, photo_url, quiz_url, category })
      //redirect to the owner's page showing all the created quizzes
      res.render("user_quizzes", {userID});
    } else {
      //redirecting is not necessary since this case won't occur in a browser
      res.status(403).send('Forbidden');
    }
  });

  //loads a quiz to be taken by any user/guest
  router.get("/:quiz_URL", (req, res) => {
    //quiz can be taken by anyone as long as they have the URL
    //call getQuizWithURL(quizURL) here, should return quiz details, questions and answers
    const queryString = `SELECT * FROM quizzes WHERE quiz_url = '${req.params.quiz_URL}';`
    db.query(queryString)
      .then(result => {
        res.render("../testFiles/take_quiz", {quizData: result.rows})
      })
      .catch(err => {
        console.log("query failed: ", err.stack);
        res.statusCode = 404
        res.render("error", {error: "couldn't retrieve quiz"});
      })
  });

  //load all the attempts for a given quiz
  /*router.get("/:quiz_id/attempts", (req, res) => {

  });*/

  //load the results for a given quiz-attempt
  /*router.get("/:quiz_id/attempts/:attempt_id", (req, res) => {
    //call getAttempt()
    const queryString = `
      SELECT *
      FROM attempts
      WHERE attempts.id = ${req.params.attempt_id};
    `;
    db.query(queryString)
      .then(result => {

      })
  });*/

  return router;
};
