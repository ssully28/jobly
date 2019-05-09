process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("../../app");
const db = require("../../db");

let jobId;

beforeAll(async () => {
  await db.query(`
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

    INSERT INTO companies (handle, name, num_employees, description, logo_url)
    VALUES ('goog', 'Google', 50000, 'Don''t Be Evil', 'http://www.google.com/logo.jpg');
    
    INSERT INTO jobs (title, salary, equity, company_handle, date_posted) 
    VALUES ('Software engineer', 115500, 0.0001,'goog', CURRENT_DATE);
    `
  )
});

beforeEach(async () => {
  let result = await db.query(`
    DELETE FROM jobs;

    INSERT INTO jobs (title, salary, equity, company_handle, date_posted) 
    VALUES ('Software engineer', 115500, 0.0001,'goog', CURRENT_DATE)
    RETURNING id;
    `
  );
  // result returns array of two results (one result from delete, one from insert).
  // each result returns an array of rows, within each row of our insert, we have an id key.
  jobId = result[1].rows[0].id;
})


describe('READ', () => {
  test('GET /jobs returns all jobs', async () => {
    const res = await request(app).get('/jobs');
    expect(res.statusCode).toBe(200);
    console.log(res.body.jobs);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].title).toEqual('Software engineer');
    expect(res.body.jobs[0].salary).toEqual(115500);
    expect(res.body.jobs[0].equity).toEqual(0.0001);
    expect(res.body.jobs[0].company_handle).toEqual('goog');
  });
  test('GET /jobs with software in the job title', async () => {
    const res = await request(app).get('/jobs?search=Software');
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
  });
  test('GET /jobs with min. salary of 50000', async () => {
    const res = await request(app).get('/jobs?min_salary=50000');
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
  });
  test('GET /jobs with multiple query parameters returns correct jobs', async () => {
    const res = await request(app).get('/jobs?search=goog&min_salary=500000');
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs).toHaveLength(0);
  });
  test('GET /jobs/id returns a job', async () => {
    const res = await request(app).get(`/jobs/${jobId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.job.salary).toEqual(115500);
  });
  test('GET /jobs/id 404 for bad job', async () => {
    const res = await request(app).get('/jobs/taco');
    expect(res.statusCode).toBe(404);
  });
});


describe('CREATE', () => {
  test('POST /jobs creates a new job', async () => {
    const response = await request(app).post('/jobs').send({
        "job": {
          "title": "Senior Software Engineer",
          "salary": 200000,
          "equity": .0002,
          "company_handle": "goog"
        }
    });
    expect(response.statusCode).toBe(201);

    // Check that we actually created the company:
    const res = await request(app).get('/jobs');
    expect(res.statusCode).toBe(200);
    expect(res.body.jobs).toHaveLength(2);
    expect(res.body.jobs[1].salary).toEqual(200000);
  });
});

describe('UPDATE', () => {
  test('PATCH /jobs updates an existing job', async () => {

    // Check BEFORE Patch:
    const beforeRes = await request(app).get(`/jobs/${jobId}`);
    expect(beforeRes.body.job.salary).toEqual(115500);
    
    // Run Patch:
    const res = await request(app).patch(`/jobs/${jobId}`).send({
      "job": {
        "salary": 116500
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.job.salary).toEqual(116500);

    // Check AFTER Patch:
    const afterRes = await request(app).get(`/jobs/${jobId}`);
    expect(afterRes.body.job.salary).toEqual(116500);
    
  });
});

describe('DELETE', () => {
  test('DELETE deletes a record from the database', async () => {
    
    // Check Before DELETE:
    const beforeRes = await request(app).get('/jobs');
    expect(beforeRes.statusCode).toBe(200);
    expect(beforeRes.body.jobs).toHaveLength(1); 
    
    // Do the DELETE:
    const res = await request(app).delete(`/jobs/${jobId}`);
    expect(res.statusCode).toBe(200);

    // Check After DELETE:
    const afterRes = await request(app).get('/jobs');
    expect(afterRes.statusCode).toBe(200);
    expect(afterRes.body.jobs).toHaveLength(0); 
  });
});

afterAll(() => {
  db.end();
});