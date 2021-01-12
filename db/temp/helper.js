const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'midterm'
});

const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT * FROM users
  WHERE LOWER(email) = LOWER($1);
  `, [`${email}`])
  .then(res => res.rows);
} // will return Object of 1 user with all info, return null if not found. Object Key [id, name, email, password]
exports.getUserWithEmail = getUserWithEmail; //checked, if not found will return []

const getUserWithId = function(id) {
  return pool.query(`
  SELECT * FROM users
  WHERE id = $1;
  `, [id])
  .then(res => res.rows[0] ? res.rows[0] : null);
} // will return Object of 1 user with all info, return null if not found.  Object Key [id, name, email, password]
exports.getUserWithId = getUserWithId; //checked , working, will sent null if not found

const addUser = function(user) {
  return pool.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `, [user.name, user.email, user.password])
  .then(res => res.rows[0]);
} // will return Object of the newly added user with all info, Info shall be check if valid before using this function.  Object Key [id, name, email, password]
exports.addUser = addUser; // checked normal case

const editUser =  function(user) { //user shall be object contain id, email, password and password
  return pool.query(`UPDATE users
  SET name = $1, email = $2, password = $3
  WHERE id = $4
  RETURNING *;`, [user.name, user.email, user.password, user.id])
  .then(res => res.rows[0]);
} // will return Object of the edited user with all info, Info shall be check if valid before using this function.  Object Key [id, name, email, password]
exports.editUser = editUser; // checked normal case

const removeUser =  function(id) { // user id shall be pass
  return pool.query(`
  DELETE FROM users CASCADE
  WHERE id = $1
  RETURNING *;
  `, [id])
  .then(res => res.rows[0]);
} // will return Object of the removed user with all info
exports.removeUser = removeUser; //checked normal case, should add security

const getQuizzes = function(count = 0, category) { // count shall be the number of time this been call in the same page, it shall start at 0, default 0
  // category is not implement yet.
  let queryString = `
  SELECT quizzes.*, COUNT(attempts.*) AS total_attempt
  FROM quizzes
  LEFT JOIN attempts ON quiz_id = quizzes.id`
  if(category) { // get quizzes in this cate only, might break, not tested
    queryString += `WHERE category LIKE '%${category}%'`;
  }
  queryString += `
  GROUP BY quizzes.id
  ORDER BY total_attempt DESC
  LIMIT 3
  OFFSET $1;
  `
  return pool.query(queryString, [count*3])
  .then(res => res.rows);
} // will return array of 3 object sort by popularity(attempt), as the count increment, it will the next 3.
exports.getQuizzes = getQuizzes; //checked normal case

const getQuizzesByUserId = function(userId) { // get all quiz from a certain user
  return pool.query(`
  SELECT quizzes.id, users.name AS creator, quizzes.title, quizzes.description, quizzes.visibility, quizzes.photo_url, quizzes.category, COUNT(attempts.*) AS total_attempts, ROUND(AVG(attempts.score), 1) AS average_score
  FROM quizzes
  JOIN users ON owner_id = users.id
  LEFT JOIN attempts ON quiz_id = quizzes.id
  WHERE owner_id = $1
  GROUP BY quizzes.id, users.name
  ORDER BY quizzes.id DESC;
  `, [userId]) // this will shown newest first as default
  .then(res => res.rows);
} // will return array of Object containing all info from quiz table. Object Key [id, creator, title, description, visibilty, photo_url, category, total_attempts, average_score]
exports.getQuizzesByUserId = getQuizzesByUserId; //checked normal case

const getQuizWithQuizId = function(quizId) { // get a quiz by id
  return pool.query(`
  SELECT users.name AS creator, quizzes.title, quizzes.description, quizzes.photo_url, quizzes.category, questions.question, questions.id AS questionNumber, answers.value as answers, answers.is_correct
  FROM quizzes
  JOIN questions ON quiz_id = quizzes.id
  JOIN answers ON question_id = questions.id
  JOIN users ON users.id = owner_id
  WHERE quizzes.id = $1
  ;`, [quizId])
  .then(res => res.rows);
} //return creator, title, des, photo_url, categotu, questions, questionsNumber, answers and is_correct
exports.getQuizWithQuizId = getQuizWithQuizId; // checked normal case, might wanna try to get itt close to JSON format

const addQuiz = function(quiz) {
  let queryString = `
  WITH quiz AS (
    INSERT INTO quizzes (owner_id, title, description, visibility, photo_url, category)
    VALUES ($1, '$2', '$3', $4, '$5', '$6')
    RETURNING id
    )
    `; // use with to pass quizID for questions insert
  let queryParams = [ quiz.owner_id, quiz.title, quiz.description, quiz.visibility, quiz.photo_url, quiz.category ]
  for (const question in quiz.questions) {
    queryParams.push(quiz.questions[question].text);
    queryString += `, q${question} AS(
      INSERT INTO questions (quiz_id, question)
      SELECT quiz.id, '$${queryParams.length}'
      FROM   quiz
      RETURNING id
      )
      `; // pass questionID for answer insert
    for (const answer in quiz.questions[question].answers) {
      queryParams.push(quiz.questions[question].answers[answer][0]);
      if (!(quiz.questions[Number(question) + 1]) && !(quiz.questions[question].answers[Number(answer) + 1])) { //if last question and answer, end chain
        queryString += `
          INSERT INTO answers (question_id, value, is_correct)
          SELECT q${question}.id, '$${queryParams.length}', ${queryParams.length + 1}
          FROM   q${question};
          `;
        queryParams.push(quiz.questions[question].answers[answer][1]);
      }
      else {
      queryString += `, q${question}a${answer} AS(
        INSERT INTO answers (question_id, value, is_correct)
        SELECT q${question}.id, '$${queryParams.length}', ${queryParams.length + 1}
        FROM   q${question}
        )
        `;
      queryParams.push(quiz.questions[question].answers[answer][1]);
      }
    }
  }
  return pool.query(queryString, queryParams)
  .then(() => true); //return true, because if .then, there is no error
}
exports.addQuiz = addQuiz;

const editQuiz =  function(newQuiz) {
  let queryString = ``;
  let queryParams = [];
  for (const question in newQuiz.questions) {
    queryParams.push(newQuiz.questions[question].text);
    queryString += `
    UPDATE questions
    SET question = '$${queryParams.length}'
    WHERE id = ${question};
      `; // pass questionID for answer insert
    for (const answer in newQuiz.questions[question].answers) {
      queryParams.push(newQuiz.questions[question].answers[answer][0]);
      queryString += `
        UPDATE answers
        SET value = '$${queryParams.length}', is_correct = ${queryParams.length + 1}
        WHERE id = ${answer};
        `;
      queryParams.push(newQuiz.questions[question].answers[answer][1]);
    }
  }
  queryString += `
  UPDATE quizzes
  SET title = '$${queryParams.length + 1}', description = '$${queryParams.length + 2}', visibility = $${queryParams.length + 3}, photo_url = '$${queryParams.length + 4}', category = '$${queryParams.length + 5}'
  WHERE id = $${queryParams.length + 6}'
  RETURNING *;
  `;
  queryParams.push( newQuiz.title, newQuiz.description, newQuiz.visibility, newQuiz.photo_url, newQuiz.category, newQuiz.quizId )
  return pool.query(queryString, queryParams)
  .then(res => getQuizWithQuizId(res.rows[0].id));
} // will automatically call getQuizWithQuizId, so it should return the updated quiz. NOT TESTED YET
exports.editQuiz = editQuiz;

const removeQuiz =  function(quizId) { // user id shall be pass
  return pool.query(`
  DELETE FROM quizzes CASCADE
  WHERE id = $1
  RETURNING *;
  `, [quizId])
  .then(res => res.rows[0]);
} // will return Object of the removed user with all info
exports.removeQuiz = removeQuiz; // checked normal case

const addAttempt = function(attempt) {
  let queryString = `INSERT INTO attempts (quiz_id, `;
  let queryParams = [attempt.quizId];
  if (attempt.userId) { // check if there is a userId
    queryString += `user_id, `;
    queryParams.push(attempt.userId); //yes then add
  }
  queryString += `score)
  VALUES ($1, $2`
  if (attempt.userId) { queryString += `, $3`;
  }
  queryString +=`)
  RETURNING *;`;
  queryParams.push(attempt.score);
  return pool.query(queryString, queryParams)
  .then(res => res.rows[0]);
} // will return Object of the newly added user with all info, Info shall be check if valid before using this function.  Object Key [id, name, email, password]
exports.addAttempt = addAttempt; //checked no userId and with userId

const getAttempt =  function(attemptId) { //get the attempt result with id
  return pool.query(`
  SELECT attempts.id, attempts.score, users.name AS user, quizzes.title AS quiz_title, quizzes.id as quiz_id
  FROM attempts
  LEFT JOIN users ON user_id = users.id
  JOIN quizzes ON quiz_id = quizzes.id
  WHERE attempts.id = $1;
  `, [attemptId])
  .then(res => res.rows);
} // will return Object of the attempt.  Object Key [id, score, user (undefined if play as guest), quiz_title]
exports.getAttempt = getAttempt; //checked normal case
