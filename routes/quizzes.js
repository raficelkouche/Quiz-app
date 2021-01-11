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
  // test once db helper methods are available
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
  /*
  this will have the form, pre-filled with all the current Q&A and can be editted
  submitting this form will send a PUT request to /quizzes/:quiz_id
  */
  router.get("/:quiz_id/edit", (req, res) => {
    const userID = req.session.userID
    /*check if this user is the owner of the quiz:
    call checkQuizOwner(userID, quizID)*/
    const queryString = `
        SELECT quizzes.owner_id, quizzes.id
        FROM quizzes
        JOIN users ON quizzes.owner_id = users.id
        WHERE quizzes.owner_id = ${userID} AND quizzes.id = ${req.params.quiz_id};
        `
    db.query(queryString)
      .then(result => {
        if (result.length > 0) {
          //render the edit page now
          //query the db to get the current questions and answers of that quiz
          //call getQuizWithID() here
          const queryString = `
            SELECT *
            FROM quizzes
            WHERE id = ${req.params.quiz_id};
          `
          db.query(queryString)
            .then(result => {
              const quizData = result.rows
              res.render("edit_quiz", { userID, quizData });
            })
            .catch(err => {
              console.log("query error", err.stack);
              res.statusCode = 404;
              res.render("error", {error: "Operation Failed!"});
            });
        } else {
          res.statusCode = 403;
          res.render("error", { error: "Access Denied!" });
        }
      })
      .catch(err => {
        console.log("query error", err.stack);
        res.statusCode = 404;
        res.render("error", { error: "Operation Failed!" });
      });
  });

  //could be either quiz_id or quiz_URL for consistency ...to be discussed
  router.put("/:quiz_id", (req, res) => {
      const userID = req.session.userID
      /*check if this user is the owner of the quiz:
      call checkQuizOwner(userID, quizID)*/
      const queryString = `
        SELECT quizzes.owner_id, quizzes.id
        FROM quizzes
        JOIN users ON quizzes.owner_id = users.id
        WHERE quizzes.owner_id = ${userID} AND quizzes.id = ${req.params.quiz_id};
        `
      db.query(queryString)
        .then(result => {
          if (result.length > 0) {
            //call the alter query now editQuiz(quizInfo)

          } else {
            res.statusCode = 403;
            res.render("error", {error: "Access Denied!"});
          }
        })
        .catch (err => {
          console.log("query error", err.stack);
          res.statusCode = 404;
          res.render("error", {error: "Operation Failed!"});
        });
  });

  router.delete("/:quiz_id", (req, res) => {
    const userID = req.session.userID;
    /*check if this user is the owner of the quiz:
      call checkQuizOwner(userID, quizID)*/
    const queryString = `
        SELECT quizzes.owner_id, quizzes.id
        FROM quizzes
        JOIN users ON quizzes.owner_id = users.id
        WHERE quizzes.owner_id = ${userID} AND quizzes.id = ${req.params.quiz_id};
        `
    db.query(queryString)
      .then(result => {
        if (result.length > 0) {
          /*
          confirm if the user wants to delete (optional) if yes then call removeQuiz(quizID).
          After deletion, redirect to user's quizzes page
          */
         //call getQuizzesByUserID() and pass the results to user_quizzes.ejs
         res.render("user_quizzes", templateVars)
        } else {
          res.statusCode = 403;
          res.render("error", { error: "Access Denied!" });
        }
      })
      .catch(err => {
        console.log("query error", err.stack);
        res.statusCode = 404;
        res.render("error", { error: "Operation Failed!" });
      });
  })



  return router;
};
