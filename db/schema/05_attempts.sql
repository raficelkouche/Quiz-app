-- Drop and recreate Quiz Attempts Table

DROP TABLE IF EXISTS attempts CASCADE;
CREATE TABLE attempts (
  id SERIAL PRIMARY KEY NOT NULL,
  attempt_on TIMESTAMP DEFAULT NOW(),
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER
);
