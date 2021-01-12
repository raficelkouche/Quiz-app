-- Drop and recreate Quizzes table

DROP TABLE IF EXISTS quizzes CASCADE;
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  create_on TIMESTAMP DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  visibility BOOLEAN DEFAULT TRUE,
  photo_url TEXT,
  category VARCHAR(255)
);
