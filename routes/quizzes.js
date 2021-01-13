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
    const userID = req.session.userID;
    db.getQuizzes(10)
      .then(data => {
        const templateVars = {
          userID,
          quizzes: data
        }
        res.render("view_quizzes", templateVars)
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
    const userID = 2; //will be taken from session cookies

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
        res.render("index", {userID});
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
  router.get("/:quiz_id", (req, res) => {
    const userID = req.session.userID;

    db.getQuizWithQuizId(req.params.quiz_id)
      .then(result => {
        res.render("take_quiz", {quizData: result[0], userID})
      })
      .catch(err => {
        console.log("query failed: ", err.stack);
        res.statusCode = 404
        res.render("error", {error: "couldn't retrieve quiz"});
      });
  });

  //load all the attempts for a given quiz
  //test again with the new function getAllAttempts(QuizID)
  router.get("/:quiz_id/attempts", (req, res) => {
    const userID = req.session.quizID;
    //REPLACE function with db.getAllAttempts(QuizID)
    db.getAttempt(req.params.quiz_id)
      .then(results => {
        console.log(results);
        const templateVars = {
          userID,
          results
        }
        res.render("quiz_results", templateVars)
      })
      .catch(err => {
        console.log("query error", err.stack)
        res.statusCode = "500"
        res.render("error", {error: "Failed to load results", userID})
      })
  });

  router.post("/:quiz_id/attempts", (req, res) => {
    const userID = req.session.userID;

    db.getCorrectAnswer(req.params.quiz_id)
      .then(results => {
        console.log(results)
        let score = 0;
        const numOfQuestions = results.length;

        for (const question of results) {
          if (req.body[question.question_id] == question.answer_id) {
            score++
          }
        }
        //add attempt to the attempts table
        const attempt = {
          quizId: req.params.quiz_id,
          score
        };
        console.log(attempt);
        if (userID) {
          attempt[userID] = userID;
        }
        db.addAttempt(attempt)
          .then(result => {
            const attempt = result;
            res.render("quiz_result", { score, numOfQuestions, attempt });
          })
          .catch(err => {
            console.log("failed to add attempt", err.stack);
          })
      })
      .catch(err => {
        console.log("query error", err.stack)
      })
  });
  //load the results for a given quiz-attempt
  router.get("/:quiz_id/attempts/:attempt_id", (req, res) => {
    const userID = req.session.userID;
    db.getAttempt(req.params.attempt_id)
      .then(results => {
        console.log(results);
        results = results[0];
        res.render("view_result", {results, userID})
      })
  });

  return router;
};
