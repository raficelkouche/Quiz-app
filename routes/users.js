/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

// trying to get access to db helper functions
const hdb = require('../helper')
// to call the hlepr functions call dhp - since the methods already call on the db


module.exports = (db) => {

  // to see current users database - for dev
  router.get("/", (req, res) => {
    hdb.getAllUsers(`SELECT * FROM users;`)
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

  // ---- NEW USER ------------------

  // users/new GET - goes to registration page
  router.get("/new", (req, res) =>  {
    // if user is already logged in
    if (req.session.user_id) {
      // redirect to homepage
      res.redirect('../');
    }
    const templateVars = {user_id: req.session.user_id};
    res.render("user_new", templateVars);
  })

  // users/:user_id/login GET - get login page - temp, will update to be more dynamci
  // this is for validation purposes
  router.get("/login", (req, res) =>  {
    // if user is already logged in
    if (req.session.user_id) {
      res.redirect('../'); // redirect to homepage?
    }
    const templateVars = {user_id: req.session.user_id};
    res.render("user_login", templateVars);
  })

  // users POST - create new account, add to users db, redirect to homepage
  router.post("/", (req, res) => {
    const user = req.body;
    // user.password = bycrypt.hashSync(user.password, #) // if we are encrypting
    hdb.addUser(user)
    .then(user => {
      // if user was not returned from db.addUser
      if (!user) {
        res.send({error: 'error: user not found / password incorrect'});
        return;
      }
      // if sucessful, user will be logged in and cookie assigned with user_id
      req.session.user_id = user.id;
      // console.log('new user added, id:', req.session.user_id)
      // will redirect to user_page with new info rendered
      res.redirect(`/users/${user.id}`);
    })
    .catch(e => res.send(e));

  })

  // ---- USER INFO AND MANAGEMENT (USER, LOGIN, LOGOUT, DELETE & EDIT) --------

  // users/:user_id  GET - get user page with their info and attempt history
  router.get("/:user_id", (req, res) => {
    const user_id = Number(req.params.user_id);
    // check if the user has access to this page
    if (user_id === req.session.user_id) {
      hdb.getUserWithId(user_id)
      .then(user => {
        const templateVars = {
            // this user object will have all info from users db
          user: user
        }
        // shows user_page with the user info based on templateVars
        res.render("user_page", templateVars);
      })
      .catch(e => res.send(e));

    } else {
      res.send('you dont have access to this page!')
    }

  })

  // users/:user_id/quizzes/new GET - if logged in, take to new quizzes page
  router.get("/:user_id/quizzes/new", (req, res) => {
    const user_id = req.session.user_id;
    const templateVars = {user_id};

    if (req.params.user_id == user_id) { //case where the user_id in the URL belongs to the logged in user
      res.render("new_quiz", templateVars)
    }
    else if (user_id) { //case where the user is logged in but wants to access another user's route
      res.render("error", {user_id, error: "Access Denied!"})
    }
    else { //case where the user is not logged in
      res.render("user_login")
    }
  });

  // users/:user_id DELETE - delete user by removing from users db and redirect to homepage
  router.delete("/:user_id/delete", (req, res) => {
    const user_id = Number(req.params.user_id);
    // check if logged user is trying to delete owns page
    if (user_id === req.session.user_id) {
      // remove user from users db
      hdb.removeUser(user_id)
      .then(removedUser => {
        // resets cookie session
        req.session = null;
        // redirect to homepage
        res.redirect('/')
      })
      .catch(e => {res.send(e)})
    } else {
      res.send("user not logged in!")
    }

  })

  // users/:user_id/login POST - verify login field with user db, update session cookie if info correct
  router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    hdb.login(email, password)
      // login function to return user info if creds correct
      .then( user => {
        // if creds not correct, null is returned from login
        if (!user) {
          res.send({error: 'error'});
          return;
        }
        // on success, cookie assigned with user_id
        req.session.user_id = user.id;
        // console.log(req.session.user_id)
        // redirects to user page
        res.redirect(`/users/${user.id}`)
      })
      .catch(e => res.send(e));

  })

  // users/:user_id/logout POST - logout user by erasing session cookie
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("../");
  })

  // users/:user_id/edit GET - goes to user edit page
  // STRETCH
  router.get('/:user_id/edit', (req, res) => {
    const user_id = Number(req.params.user_id);
    // check if the user has access to this page
    if (user_id === req.session.user_id) {
      // render the page with the fields for edit
      res.render('user_edit')
    } else {
      res.send('you dont have access!')
    }
  })

  // users/:user_id PUT - edit user info by update user db and refresh page to show updated user info
  // STRETCH
  router.put('/:user_id', (req, res) => {
    const user_id = Number(req.params.user_id);
    // check if logged user is trying to edit owns page
    if (user_id === req.session.user_id) {
      // need to save the form data as new info (will need to review
      // the req.body data structure)
      const new_info = req.body
      // editUser helper should take two parameters, user_id and new info
      // it then updates the db
      hdb.editUser(new_info)
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
    const user_id = Number(req.params.user_id);
    if (user_id === req.session.user_id) {
      hdb.getQuizzesByUserId(user_id)
      .then (quizzes => {
        // quizzes should be all the quiz that belongs to the user_id
        // given back as an array of objects
        const templateVars = {user_id: req.session.user_id, quizzes: quizzes};
        // render page that will show all quizzes into table
        res.render("user_quizzes", templateVars);
      })
      .catch(e => res.send(e));
    } else {
      res.send('you dont have access!')
    }
  })

  // users/:user_id/quizzes/:quiz_id GET - goes to quiz page with creator access
  router.get('/:user_id/quizzes/:quiz_id', (req, res) => {
    const user_id = Number(req.params.user_id);
    if (user_id === req.session.user_id) {
      // get the quiz info
      const quiz_id = (req.params.quiz_id);
      hdb.getQuizWithQuizId(quiz_id)
      .then (quiz => {
        // const quiz = res.quizzes.quiz[0];
        // check if the cookie user = quiz user id (creator looking at the quiz)
        if (Number(quiz.creator_id) === req.session.user_id) {
          // quiz info here to render
          const templateVars = { quiz: quiz, user_id: req.params.user_id };
          // page rendering for quiz to be viewed by creator
          res.render('user_quiz', templateVars);

        } else {
            // need to get the owner_id not name
          res.send('you dont have access!')
        }

      })
      .catch(e => res.send(e));

    }
  })

  // ROUTES TO BE ADDED - JAN 11

  // users/:user_id/quizzes/:quiz_id/edit GET - goes to quiz edit page with creator access
  router.get('/:user_id/quizzes/:quiz_id/edit', (req, res) => {
    const user_id = Number(req.params.user_id);
    if (user_id === req.session.user_id) {
      const quiz_id = (req.params.quiz_id);
      hdb.getQuizWithQuizId(quiz_id)
      .then (quiz => {
        if (Number(quiz.creator_id) === req.session.user_id) {
          // quiz info here to render
          const templateVars = { quiz: quiz };
        // render the page with the fields for edit
        res.render('user_quiz_edit', templateVars)

      } else {
        res.send('you dont have access!')
      }
    })
      .catch(e => res.send(e));
   }
  })

  // users/:user_id/quizzes/:quiz_id PUT - update quiz info from edit page
  // note: editQuiz function not yet defined
  // STRETCH
  router.put('/:user_id/quizzes/:quiz_id', (req, res) => {
    // check if the cookie user = quiz user id (creator looking at the quiz)
    const user_id = Number(req.params.user_id);
    if (user_id === req.session.user_id) {
      const quiz_id = Number(req.params.quiz_id);
      hdb.getQuizWithQuizId(quiz_id)
      .then (quiz => {
        if (quiz.creator_id === req.session.user_id) {
          // store new quiz info
          const newQuizInfo = req.body;
          // updates quiz info in db
          hdb.editQuiz(newQuizInfo)
          .then( quiz => {
            // on success, redirect to quiz page
            res.redirect(`/${req.params.user_id}/quizzes/${quiz.id}`)
          })
          .catch(e => res.send(e))
        }
      })
    } else {
      res.send('you dont have access!')
    }
  })

  // users/:user_id/quizzies/:quiz_id/delete - deletes quiz from quizzes db
  router.delete('/:user_id/quizzes/:quiz_id/delete', (req, res) => {
    // check if the cookie user = quiz creator id
    const user_id = Number(req.params.user_id);
    if (user_id === req.session.user_id) {
      const quiz_id = Number(req.params.quiz_id);
      hdb.getQuizWithQuizId(quiz_id)
      .then (quiz => {
        // console.log(quiz)
          hdb.removeQuiz(quiz.quiz_id)
          .then ( result => {
            // redirect to user's quizzes page
            res.redirect(`../`)
          })
          .catch(e => res.send(e));
        // }
      })

    } else {
      res.send('you dont have access!')
    }
  })

  return router;
};
