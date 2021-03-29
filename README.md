QuizApp
=========
A web application that allows users to take public quizzes or create and share their own. On the client side, EJS, SASS and jQuery were used. The server was implemented using ExpressJS and NodeJS. As for the database, PostgreSQL was used.


## Getting Started

1. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`.
2. Update the .env file with your correct local information (for the database connection).
3. Install the dependencies: `npm install`.
4. Fix binaries for sass: `npm rebuild node-sass`.
5. Reset the database: `npm run db:reset`.
6. Run the server: `npm run local`.

## Dependencies
- Node 10.x or above
- NPM 5.x or above
- PG 6.x
- bcrypt
- cookie-session
- ejs
- express
- method-override
- node-sass-middleware

