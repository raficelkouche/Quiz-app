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

***************
|    users    |
***************
| id          | PK
| name        |
| email       |
| password    |
***************

***************
|   quizes    |
***************
| id          | PK
| owner_id    | FK JOIN users(id)
| title       |
| des         |
| photo_url   | TEXT
| public      | Boolean To show if public or not
***************

***************
| questions   |
***************
| id          | PK
| quiz_id     | FK
| question    | TEXT
***************

***************
| answers     |
***************
| id          | PK
| question_id | FK
| is_correct  | Boolean DEFAULT FALSE
| value       | TEXT
***************

// submission to quiz? what about submission per question
***************
|   attemps   |
***************
| id          | PK
| quiz_id     | FK
| user_id     | FK
| score       | COUNT()
***************

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

Error Page
 - redirect page for all errors
 - specific error message

# Creating routes

  - /


Dividing Tasks
Communication and teamwork
Project Setup - Git repo set up and access - WIP 
Database Setup 
