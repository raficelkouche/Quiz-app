/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const db = require('../testFiles/database')

module.exports = () => {
  //displays all the publicly available quizzes
  router.get("/", (req, res) => {
    //call getAllPublicQuizzes()
    const queryString = `SELECT * FROM quizzes;`;
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
  /*
  this has to be moved to users route
  /users/:user_id/quizzes/new
  */
  router.get("/new", (req, res) => {
    const userID = req.session.userID;
    //res.render((userID) ? "../testFiles/new_quiz" : "../testFiles/login")
    res.render("new_quiz");
  })



  //inserts a new quiz and redirects to "my quizzes" page
  router.post("/", (req, res) => {
    const userID = 2; //will be taken from session

    const quizInfo = {
     owner_id: userID,
     questions: {}
    };
    let questionCounter = 1;
    let answerCounter = 1;
    const regex = /q\d/;

    for (key in req.body) {
      if (regex.test(key)) { //if it passes means it is in the form q1..etc
        quizInfo.questions[questionCounter] = {
          text: req.body[key][0],
          answers: {}
        };
        //create and add the answer arrays
        const lengthOfAnswerArray = req.body[key].length
        let isCorrect;
        for (let i = 1; i < lengthOfAnswerArray - 1; i++) {
          //return true only when the index of the current answer matches the last element of the array
          isCorrect = (i === Number(req.body[key][lengthOfAnswerArray - 1])) ? true : false;
          quizInfo.questions[questionCounter].answers[`answer${answerCounter}`] = [req.body[key][i], isCorrect];
          answerCounter++;
        }
        questionCounter++;
      } else {
        quizInfo[key] = req.body[key];
      }
    };

    db.addQuiz(quizInfo)
      .then(result => {
        console.log(result);
        res.json(quizInfo);
      })
      .catch(err => {
        console.log("query error", err.stack);
      })
    //enable after session integration
    /*
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
    */

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
