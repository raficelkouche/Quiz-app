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

  // users/new GET - registration page

  // users/:user_id  GET - get user page with their attempt history

  // users/:user_id DELETE - delete user

  // users/:user_id PUT - edit user

  // users/:user_id/edit GET - get user edit page

  // users/:users_id/quizzes GET - get all quizzes by the user

  // users/:users_id/quizzes/:quiz_id GET - view quiz with creator access



  return router;
};
