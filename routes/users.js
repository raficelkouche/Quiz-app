/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  // to see current users database - for dev
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // need the following routes

  // users POST - create new account
  router.post("/", (req, res) => {
    const user = req.body;
    // user.password = bycrypt.hashSync(user.password, #) // if we are encrypting
    db.addUser(user)
    .then(user => {
      // if user was not returned from db.addUser
      if (!user) {
        res.send({error: 'error'});
        return;
      }
      // if sucessful, user will be logged in and cookie assigned with user_id
      req.session.userID = user.id;
      // do we require a message here or redirect?
      res.redirect('../');
    })
    .catch(e => res.send(e));
  })

  // users/new GET - registration page
  // goes to the registration page
  router.get("/new", (req, res) =>  {
    // if user is already logged in
    if (req.session.user_id) {
      res.redirect('../'); // redirect to homepage?
    }
    const templateVars = {user_id: req.session.user_id};
    res.render("users_new", templateVars);
  })

  // users/:user_id  GET - get user page with their attempt history
  router.get("/:user_id", (req, res) => {
    // do we need access control for this?
    db.getUserWithID(user_id)
    .then(user => {
      const templateVars = {
        user_id: user.id,
        name: user.name,
        email: user.email,
        // dont think we need to show the password
      }
      // shows user_page with the user info based on templateVars
      res.render("user_page", templateVars);
    })
    .catch(e => res.send(e));
  })

  // users/:user_id DELETE - delete user
  router.get("/:user_id/delete", (req, res) => {
    // if the user is logged in as and is deleting own account
    if (db.getUserWithID(user_id) === req.session) {
      db.removeUser(user_id)
      .then(res => {
        // clear cookie
        req.session = null;
        // redirect to homepage
        return res.redirect('../');
      })
    }
  })

  // users/:user_id PUT - edit user
  // STRETCH
  router.put('/:user_id', (req, res) => {
    // check if correct user is logged in to edit
    if (db.getUserWithID(user_id) === req.session) {
      // need to save the form data as new info (will need to review
      // the req.body data structure)
      const new_info = req.body
      // editUser helper should take two parameters, user_id and new info
      // it then updates the db
      db.editUser(user_id, [new_info])
      .then ( newUser => {
        // with the new user info returned, cookie does not need to be updated
        // since user_id should remain the same
        // re-render the user_id page with new info
        res.redirect(`/${req.params.user_id}`)
      })
    }
  })

  // users/:user_id/edit GET - get user edit page
  router.get('/:user_id/edit', (req, res) => {
    // this line is for the nav bar with user logged in
    const templateVars = {user_id: req.session.user_id};
    // render the page with the fields for edit
    res.render('user_edit', templateVars)
  })

  // users/:user_id/quizzes GET - get all quizzes by the user
  router.get('/:user_id/quizzes', (req, res) => {
    db.getQuizzesStats(user_id)
    .then (quizzes => {
      // quizzes should be all the quiz that belogs to the user_id
      // depending on the structure, may have to manipulate to work

      const templateVars = {user_id: req.session.user_id, quizzes: quizzes};

      // render page that will show all quizzes into table
      res.render("user_quizzes", templateVars);
    })
    .catch(e => res.send(e));
  })

  // users/:users_id/quizzes/:quiz_id GET - view quiz with creator access
  router.get('/:user_id/quizzes/:quiz_id', (req, res) => {
    // get the quiz info
    db.getQuizWithId(quiz_id)
    .then (quiz => {
      // check if the cookie user = quiz user id (creator looking at the quiz)
      if (quiz.owner_id === req.session.user_id) {
        // quiz info here to render
        const templateVars = {
          title: quiz.title,
          photo_url: quiz.photo_url,
          quiz_url: quiz.quiz_url,
          category: quiz.category
        }
        // need the creator name
        db.getUserWithID(quiz.owner_id)
        .then (creator => {
          templateVars.creator = creator.name
          // page rendering for quiz to be viewed by creator
          res.render('user_quiz', templateVars)
        })
      }
    })
  })

  return router;
};
