process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("../../app");
const db = require("../../db");

beforeAll(async () => {
  await db.query(`
    DROP TABLE IF EXISTS companies;
    
    CREATE TABLE companies (
      handle TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      num_employees INT,
      description TEXT,
      logo_url TEXT
    );
    `
  )
});

beforeEach(async () => {
  await db.query(`
    TRUNCATE TABLE companies;

    INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ('goog', 'Google', 50000, 'Don''t Be Evil', 'http://www.google.com/logo.jpg');
    `
  );
})


describe('READ', () => {
  test('GET /companies returns all companies', async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toHaveLength(1);
    expect(res.body.companies[0].handle).toEqual('goog');
    expect(res.body.companies[0].name).toEqual('Google');
  });
  test('GET /companies with query string returns correct companies', async () => {
    const res = await request(app).get('/companies?search=goog');
    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toHaveLength(1);
  });
  test('GET /companies with multiple query string returns correct companies', async () => {
    const res = await request(app).get('/companies?search=goog&min_employees=50000');
    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toHaveLength(1);
  });
  test('GET /companies with multiple query string returns correct companies', async () => {
    const res = await request(app).get('/companies?search=goog&max_employees=500');
    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toHaveLength(0);
  });
  test('GET /companies/handle returns a company', async () => {
    const res = await request(app).get('/companies/goog');
    expect(res.statusCode).toBe(200);
    expect(res.body.company.name).toEqual('Google');
  });
  test('GET /companies/handle 404 for bad company', async () => {
    const res = await request(app).get('/companies/taco');
    expect(res.statusCode).toBe(404);
  });
});


describe('CREATE', () => {
  test('POST /companies creates a new company', async () => {
    const response = await request(app).post('/companies').send({
        "company": {
          "handle": "CL",
          "name": "Craigslist",
          "num_employees": 200,
          "description": "Newspaper Killer",
          "logo_url": "http://www.craigslist.org/img/logo.jpg"
        }
    });
    expect(response.statusCode).toBe(201);

    // Check that we actually created the company:
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toHaveLength(2);
    expect(res.body.companies).toContainEqual({"handle": "CL", "name": "Craigslist"});
  });
});

describe('UPDATE', () => {
  test('PATCH /companies updates an existing company', async () => {

    // Check BEFORE Patch:
    const beforeRes = await request(app).get('/companies/goog');
    expect(beforeRes.body.company.name).toEqual('Google');
    expect(beforeRes.body.company.num_employees).toEqual(50000);
    
    // Run Patch:
    const res = await request(app).patch('/companies/goog').send({
      "company": {
        "handle": "alphabet",
        "name": "Google One",
        "num_employees": 5000
      }
    });
    expect(res.statusCode).toBe(202);
    expect(res.body.company.handle).toEqual('alphabet');

    // Check AFTER Patch:
    const afterRes = await request(app).get('/companies/alphabet');
    expect(afterRes.body.company.name).toEqual('Google One');
    expect(afterRes.body.company.num_employees).toEqual(5000);

    // Check original handle return 404
    const afterAlt = await request(app).get('/companies/goog');
    expect(afterAlt.statusCode).toEqual(404);
  });
});

describe('DELETE', () => {
  test('DELETE deletes a record from the database', async () => {
    
    // Check Before DELETE:
    const beforeRes = await request(app).get('/companies');
    expect(beforeRes.statusCode).toBe(200);
    expect(beforeRes.body.companies).toHaveLength(1); 
    
    // Do the DELETE:
    const res = await request(app).delete('/companies/goog');
    expect(res.statusCode).toBe(200);

    // Check After DELETE:
    const afterRes = await request(app).get('/companies');
    expect(afterRes.statusCode).toBe(200);
    expect(afterRes.body.companies).toHaveLength(0); 
  });
});

afterAll(() => {
  db.end();
});