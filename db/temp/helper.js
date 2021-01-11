const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'midterm'
});

const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT * FROM users
  WHERE LOWER(email) = LOWER('$1');
  `, [email])
  .then(res => res.rows[0] ? res.rows[0] : null);
} // will return Object of 1 user with all info, return null if not found. Object Key [id, name, email, password]
exports.getUserWithEmail = getUserWithEmail;

const getUserWithId = function(id) {
  return pool.query(`
  SELECT * FROM users
  WHERE id = $1;
  `, [id])
  .then(res => res.rows[0] ? res.rows[0] : null);
} // will return Object of 1 user with all info, return null if not found.  Object Key [id, name, email, password]
exports.getUserWithId = getUserWithId;

const addUser = function(user) {
  return pool.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, '$2', '$3')
  RETURNING *;
  `, [user.name, user.email, user.password])
  .then(res => res.rows[0]);
} // will return Object of the newly added user with all info, Info shall be check if valid before using this function.  Object Key [id, name, email, password]
exports.addUser = addUser;

const editUser =  function(user) { //user shall be object contain id, email, password and password
  return pool.query(`UPDATE users
  SET name = '$1', email = '$2', password = '$3'
  WHERE id = $4
  RETURNING *;`, [user.name, user.email, user.password, user.id])
  .then(res => res.rows[0]);
} // will return Object of the edited user with all info, Info shall be check if valid before using this function.  Object Key [id, name, email, password]
exports.editUser = editUser;

const removeUser =  function(id) { // user id shall be pass
  return pool.query(`
  DELETE FROM users CASCADE
  WHERE id = $1
  RETURNING *;
  `, [id])
  .then(res => res.rows[0]);
} // will return Object of the removed user with all info
exports.removeUser = removeUser;

const getQuizzes = function(count = 0, category) { // count shall be the number of time this been call in the same page, it shall start at 0, default 0
  // category is not implement yet.
  let queryString = `
  SELECT quizzes.*, COUNT(attempts.*) AS total_attempt
  FROM quizzes
  LEFT JOIN attempts ON quiz_id = quizzes.id`
  if(category) { // get quizzes in this cate only, might break, not tested
    queryString += `WHERE category LIKE '%${category}%'`;
  }
  queryString += `GROUP BY quizzes.id
  ORDER BY total_attempt DESC
  LIMIT 3
  OFFSET $1;
  `
  return pool.query(queryString, [count*3])
  .then(res => res.rows);
} // will return array of 3 object sort by popularity(attempt), as the count increment, it will the next 3.
exports.getQuizzes = getQuizzes;

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
exports.getQuizzesByUserId = getQuizzesByUserId;

const getQuizWithQuizId = function(quizId) { // get a quiz by id
  return pool.query(`
  SELECT users.name AS creator, quizzes.title, quizzes.description, quizzes.photo_url, quizzes.category, questions.question, questions.id AS questionNumber, answers.value as answers, answers.is_correct
  FROM quizzes
  JOIN questions ON quiz_id = quizzes.id
  JOIN answers ON question_id = questions.id
  JOIN users ON users.id = owner_id
  WHERE quizzes.id = 14
  ;`, [quizId])
  .then(res => res.rows);
} //return creator, title, des, photo_url, categotu, questions, questionsNumber, answers and is_correct
exports.getQuizWithQuizId = getQuizWithQuizId;

const addQuiz = function(quiz) {
  let queryString = `
  WITH quiz AS (
    INSERT INTO quizzes (owner_id, title, description, visibility, photo_url, category)
    VALUES ($1, '$2', '$3', $4, '$5', '$6')
    RETURNING id
    )
    `;
  let queryParams = [ quiz.owner_id, quiz.title, quiz.description, quiz.visibility, quiz.photo_url, quiz.category ]
  for (const question in quiz.questions) {
    queryParams.push(quiz.questions[question].text);
    queryString += `, q${question} AS(
      INSERT INTO questions (quiz_id, question)
      SELECT quiz.id, '$${queryParams.length}'
      FROM   quiz
      RETURNING id
      )
      `;
    for (const answer in quiz.questions[question].answers) {
      queryParams.push(quiz.questions[question].answers[answer][0]);
      if (!(quiz.questions[Number(question) + 1]) && !(quiz.questions[question].answers[Number(answer) + 1])) {
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
  .then(res => true); //return true
}
exports.addQuiz = addQuiz;

const removeQuiz =  function(quizId) { // user id shall be pass
  return pool.query(`
  DELETE FROM quizzes CASCADE
  WHERE id = $1
  RETURNING *;
  `, [quizId])
  .then(res => res.rows[0]);
} // will return Object of the removed user with all info
exports.removeQuiz = removeQuiz;

const getAttempt =  function(attemptId) { //get the attempt result with id
  return pool.query(`
  SELECT attempts.id, attempts.score, users.name AS user, quizzes.title AS quiz_title, quizzes.id as quiz_id
  FROM attempts
  LEFT JOIN users ON user_id = users.id
  JOIN quizzes ON quiz_id = quizzes.id
  WHERE attempts.id = $1
  RETURNING *;
  `, [attemptId])
  .then(res => res.rows[0]);
} // will return Object of the attempt.  Object Key [id, score, user (undefined if play as guest), quiz_title]
exports.getAttempt = getAttempt;


/*
editQuiz(newQuizInfo)
 - should pass all question / answer even when they are the same
 - will provide (res): all info from quiz
addAttemp(attempInfo)
 - will provide (res): all info of attemp
*/
