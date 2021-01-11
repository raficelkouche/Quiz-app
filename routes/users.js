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

  // PROJECT: need the following routes:
  // update Jan 9: routes made, to be tested for functionaility, test helper functions, test req.session calls and db query results
  // re-organized routes by groups

  // ---- NEW USER ------------------

  // users/new GET - goes to registration page
  router.get("/new", (req, res) =>  {
    // if user is already logged in
    if (req.session.user_id) {
      res.redirect('../'); // redirect to homepage?
    }
    const templateVars = {user_id: req.session.user_id};
    res.render("users_new", templateVars);
  })

  // users POST - create new account, add to users db, redirect to homepage
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

  // ---- USER INFO AND MANAGEMENT (USER, LOGIN, LOGOUT, DELETE & EDIT) --------

  // users/:user_id  GET - get user page with their info and attempt history
  router.get("/:user_id", (req, res) => {
    // do we need access control for this? -- this will affect how we declare the nav bar user logged in and the templateVars for the user info rendered
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

  // users/:user_id DELETE - delete user by removing from users db and redirect to homepage
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

  // users/:user_id/login POST - verify login field with user db, update session cookie if info correct
  router.post("/login", (req, res) => {
    // collect login info
    const email = req.body.email;
    const password = req.body.password;
    // get user id based on email provided
    db.getUserWithEmail(email)
    .then(user => {
      // verify if password entered matches user db
      if (user.password === password) {
        // on successful login, session cookie updated with user info
        req.session.user_id = user;
        res.redirect('../'); // redirect to homepage
      }
    })
  })

  // users/:user_id/logout POST - logout user by erasing session cookie
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("../");
  })

  // users/:user_id/edit GET - goes to user edit page
  // STRETCH
  router.get('/:user_id/edit', (req, res) => {
    // this line is for the nav bar with user logged in
    const templateVars = {user_id: req.session.user_id};
    // render the page with the fields for edit
    res.render('user_edit', templateVars)
  })

  // users/:user_id PUT - edit user info by update user db and refresh page to show updated user info
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

  // ----- USER QUIZ ACCESS (ALL QUIZ LIST OR SINGLE QUIZ INFO) -------

  // users/:user_id/quizzes GET - goes to user all quizzes page, have all quizzes displayed in table
  router.get('/:user_id/quizzes', (req, res) => {
    db.getQuizzesByUserID(user_id)
    .then (quizzes => {
      // quizzes should be all the quiz that belongs to the user_id
      // depending on the structure, may have to manipulate to work

      const templateVars = {user_id: req.session.user_id, quizzes: quizzes};

      // render page that will show all quizzes into table
      res.render("user_quizzes", templateVars);
    })
    .catch(e => res.send(e));
  })

  // users/:user_id/quizzes/:quiz_id GET - goes to quiz page with creator access
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

  // ROUTES TO BE ADDED - JAN 11

  // users/:user_id/quizzes/:quiz_id/edit GET - goes to quiz edit page with creator access
  router.get('/:user_id/quizzes/:quiz_id/edit', (req, res) => {
    // this line is for the nav bar with user logged in
    const templateVars = {user_id: req.session.user_id};
    // render the page with the fields for edit
    res.render('user_quiz_edit', templateVars)
  })

  // users/:user_id/quizzes/:quiz_id PUT - update quiz info from edit page
  router.put('/:user_id/quizzes/:quiz_id', (req, res) => {
    // check if the cookie user = quiz user id (creator looking at the quiz)
    db.getQuizWithQuizId(quiz_id)
    .then (quiz => {
      if (quiz.owner_id === req.session.user_id) {
        // store new quiz info
        const newQuizInfo = req.body;
        // updates quiz info in db
        db.editQuiz(newQuizInfo)
        .then( quiz => {
          // on success, redirect to quiz page
          res.redirect(`/${req.params.user_id}/quizzes/${quiz.id}`)
        })
      }
    })
  })

  // users/:user_id/quizzies/:quiz_id/delete - deletes quiz from quizzes db
  router.get('/:user_id/quizzes/:quiz_id/delete', (req, res) => {
    // check if the cookie user = quiz creator id
    db.getQuizWithQuizId(quiz_id)
    .then (quiz => {
      if (quiz.owner_id === req.session.user_id) {
        // remove the quiz from quizzes db
        db.removeQuiz(quiz.id)
        .then ( result => {
          // redirect to user's quizzes page
          res.redirect(`/${req.params.user_id}/quizzes`)
        })
      }
    })
  })

  return router;
};
