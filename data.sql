
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;


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
