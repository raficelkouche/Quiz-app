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
      // editUser helper should take two parameters, user_id and new info
      // it then updates the db
      db.editUser(user_id, [new_nfo])
      .then ( newUser => {
        // with the new user info returned, cookie does not need to be updated
        // since user_id should remain the same
        // re-render the user_id page with new info
        res.redirect(`/${req.params.user_id}`)


      })
    }
  })

  // users/:user_id/edit GET - get user edit page

  // users/:users_id/quizzes GET - get all quizzes by the user

  // users/:users_id/quizzes/:quiz_id GET - view quiz with creator access



  return router;
};
