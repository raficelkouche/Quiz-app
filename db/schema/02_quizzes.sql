-- Drop and recreate Quizzes table

DROP TABLE IF EXISTS quizzes CASCADE;
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users.id ON DELETE CASCADE
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  visibility BOOLEAN DEFAULT TRUE,
  photo_url TEXT NOT NULL,
  quiz_url TEXT NOT NULL,
  category VARCHAR(255)
);
