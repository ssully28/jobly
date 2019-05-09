DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;

CREATE TABLE users (
username TEXT PRIMARY KEY,
password TEXT NOT NULL,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
photo_url TEXT,
is_admin BOOLEAN NOT NULL DEFAULT 'f'
);

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INT,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL,
    check(equity >= 0 and equity <= 1),
  company_handle TEXT NOT NULL REFERENCES companies(handle) ON DELETE CASCADE,
  date_posted timestamp
);