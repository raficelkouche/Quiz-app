## Quiz App
An app that lets you create quizzes and share them between friends. The creator of the quiz can view and share all the results at the end of the quiz.

# Requirements:
users can create quizzes
users can make their quiz unlisted (make them private and not available on the home page, but if someone knows the quiz URL they can visit and take the quiz)
users can share a link to a single quiz
users can see a list of public quizzes
users can see a list of public quizzes on the home page
users can attempt a quiz
users can see the results of their recent attempt
users can share a link to the result of their attempt
/
# Stack Requirements
ES6 for server-side (NodeJS) code
NodeJS
Express
RESTful routes
One or more CSS or UI "framework"s:
jQuery
A CSS preprocessor such as SASS, Stylus, or PostCSS for styling -- or CSS Custom properties and no CSS preprocessor
PostgreSQL and pg (with promises) for DBMS
git for version control

## Project Planning

# Users Stories

  As a user
  I want to make Quizes and have options : public or unlisted 
  so that I can share it with the world
  
  As a user
  I want to take quizes
  so that I can see the result

  As a user
  I want to send my result to other people
  so that I can show-off

  As a user
  I want to use the site on my phones
  so that I can take quizes anywhere

  Stretch
  As a user
  I want to see the quizes that I have taken
  So I can share it with friends

# Data - ERD


|    users    |
|-------------|
| id          | PK
| name        |
| email       |
| password    |



|   quizzes   |
|-------------|
| id          | PK
| owner_id    | FK JOIN users(id)
| title       |
| des         |
| photo_url   | TEXT
| public      | Boolean To show if public or not



| questions   |
|-------------|
| id          | PK
| quiz_id     | FK
| question    | TEXT



| answers     |
|-------------|
| id          | PK
| question_id | FK
| is_correct  | Boolean DEFAULT FALSE
| value       | TEXT


// submission to quiz? what about submission per question

|   attemps   |
|-------------|
| id          | PK
| quiz_id     | FK
| user_id     | FK
| score       | COUNT()


# Wireframes
Navbar
 - Logo (link to Homepage)
 - Link to user profile (login, logout, register)
 - Link to Build a quiz (only when login)
 - MyQuizes

Home page
 - to see all public quiz
 - link to create a quiz by logging in first
 - Set limit to quiz shown

Registration Page
 - form to create new account
 - link to login field if user already has account

MyQuizzes 
 - Show user created quizes (list)
 - Link to share quiz
 - Remove quiz
 - indicate if quiz is public or unlisted
 - (stretch) Edit quiz

Individual quiz page (info) - public anyone can take
 - description, title, creator, category
 - actual quiz with submit button to redirect to results page
 - time limit (stretch, option for creator)
 - link to share quiz
 - Remove quiz if owner

Results page for submitted quiz
 - show score and answers
 - additional quiz stats (attempts, avg score)
 - link to share results

Make a Quiz page
 - mulitple choice type
 - title, description
 - question box
 - number of multiple choice answers
 - individual choice answer
 - add question button 
 - create quiz button - redirect to MyQuizzes

View Quiz Page
 - only for creator access
 - see all details and question on load
 - edit function available

Error Page
 - redirect page for all errors
 - specific error message

View all Quizzes page
 - show all quizzes that are public
 - public access
 - from homepage to show all quizzes

# Creating routes

| Route                                   | HTTP Verb          | Description|
| ----------------------------------------|:------------------:| ---------: |
| /                                       | GET                | HomePage   |
| /quizzes                                | GET                | LoadQuizzes  |
| /quizzes                                | POST               | create a quiz  |
| /quizzes/:quiz_id                       | GET                | get quiz to take |
| /quizzes/:quiz_id/attempts              | GET                | Results for the attempt |
| /quizzes/:quiz_id/attempts              | POST               | add results for the attempts table |
| /quizzes/:quiz_id/attempts/:attempt_id  | GET                | Results for the attempt |
| /users                                  | GET                | get the users collection data |
| /users                                  | POST               | make new account |
| /users/new                              | GET                | register page |
| /users/login                            | POST               | login user |
| /users/logout                           | POST               | logout user |
| /users/:user_id                         | GET                | get user, and their attempted history |
| /users/:user_id                         | DELET              | delete user |
| /users/:user_id                         | PUT                | edit user |
| /users/:user_id/edit                    | GET                | edit user page |
| /users/:user_id/quizzes                 | GET                | get all quizzes status make by user |
| /users/:user_id/quizzes/:quiz_id        | GET                | view quiz page with creator access|
| /users/:user_id/quizzes/:quiz_id        | PUT                | edit quiz submit with creator access  |
| /users/:user_id/quizzes/:quiz_id/edit   | GET                | edit quiz page with creator access  |
| /users/:user_id/quizzes/:quiz_id/delete | DELETE             | delete a quiz with creator access|


# Database Helper
getUserWithEmail(userEmail)
 - will provide (res): Object of 1 user with all info, return null if not found. Object Key [id, name, email, password]
getUserWithId(userId)
 - will provide (res): Object of 1 user with all info, return null if not found.  Object Key [id, name, email, password]
addUser(userInfo)
 - will provide (res): Object of the newly added user with all info, Info shall be check if valid before using this function.  Object Key [id, name, email, password]
editUser(newInfo)
 - will provide (res): all info from users
 - newInfo should include userID 
removeUser(userId)
 - will provide (res): boolean(True)
getQuizzes(requestCounter)
 - requestCounter tracks how many times you have requested to get quizzes
 - requestCounter should be an integer
 - will provide (res): 3 rows of quizzes title, des, photoUrl, id, ownersName, date  where the quizzes are set to visible
getQuizzesByUserID(userId)
 - will provide (res): all quizzes that is made by that userID
getQuizWithQuizId(quizId)
 - will provide (res): quiz assigned to that id
addQuiz(quizInfo)
 - will provide (res): all info from quiz
 - {
    title: ...
    desc: ...
    questions: {
      questionA : {
        text: what is ..?
        answers: {
          answerA: ['javaScript', true]
          answerB: ['PYTHON', false]
        }
      }
  }
editQuiz(newQuizInfo)
 - should pass all question / answer even when they are the same
 - will provide (res): all info from quiz
removeQuiz(quizId)
 - will provide (res): boolean(True)
addAttempt(attemptInfo)
 - will provide (res): all info of attempt
getAttempt(attemptID)
 - will provide (res): all info of attempt
checkQuizOwner(quiz_id,user_id)
 - return boolean if user is the owner

Dividing Tasks
Communication and teamwork
Project Setup - Git repo set up and access - WIP 
Database Setup 


JS
QuizInfo
db.addQuiz (given quiz parameters => quiz body)
INSERT INTO QUIZ
.then(quiz => {
  for ( count how many questions are on page loop)
  db.addQuestion(quiz.id, quuestion body)
  .then (question => {
    db.addAnswer(question.id, answer body)
  })
})

{
  title: ...
  desc: ...
  questions: {
    questionA : {
      text: what is ..?
      answers: {
        answerA: ['javaScript', true]
        answerB: ['PYTHON', false]
      }
    }
}

addQuiz(Quiz_info)


