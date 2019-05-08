
CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INT,
  description TEXT,
  logo_url TEXT
);