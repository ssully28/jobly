process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("../../app");
const db = require("../../db");

beforeAll(async () => {
  await db.query(`
    DROP TABLE IF EXISTS users;
    
    CREATE TABLE users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      photo_url TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT 'f'
    );

    INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
    VALUES ('bezos','mistress', 'jeff','bezos','amazon.com','sanchez','t');
    `
  )
});

beforeEach(async () => {
  await db.query(`
    DELETE FROM users;

    INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
    VALUES ('bezos','mistress', 'jeff','bezos','amazon.com','sanchez','t');
   `
  );
});


describe('READ', () => {
  test('GET /users returns all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toEqual('bezos');
    expect(res.body.users[0].first_name).toEqual('jeff');
    expect(res.body.users[0].last_name).toEqual('bezos');
    expect(res.body.users[0].email).toEqual('amazon.com');
  });
  test('GET /users/username returns a user', async () => {
    const res = await request(app).get('/users/bezos');
    expect(res.statusCode).toBe(200);
    expect(res.body.user.username).toEqual('bezos');
    expect(res.body.user.first_name).toEqual('jeff');
    expect(res.body.user.last_name).toEqual('bezos');
    expect(res.body.user.email).toEqual('amazon.com');
    expect(res.body.user.photo_url).toEqual('sanchez');
  });
  test('GET /users/id 404 for bad user', async () => {
    const res = await request(app).get('/users/taco');
    expect(res.statusCode).toBe(404);
  });
});


describe('CREATE', () => {
  test('POST /users creates a new user', async () => {
    const response = await request(app).post('/users').send({
        "user": {
          "username":"mckenzie",
          "first_name":"forgot",
          "last_name":"bezos",
          "email":"amazon.com/exwife",
          "photo_url":"3 kids",
          "password":"billionaire",
          "is_admin":false
        }
    });
    expect(response.statusCode).toBe(201);

    // Check that we actually created the user:
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[1].username).toEqual("mckenzie");
  });
});

describe('UPDATE', () => {
  test('PATCH /users updates an existing user', async () => {

    // Check BEFORE Patch:
    const beforeRes = await request(app).get('/users/bezos');
    expect(beforeRes.body.user.first_name).toEqual('jeff');
    
    // Run Patch:
    const res = await request(app).patch('/users/bezos').send({
      "user": {
        "first_name": "joffrey",
        "password":"mistress",
        "username":"bezos"
      }
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.first_name).toEqual('joffrey');

    // Check AFTER Patch:
    const afterRes = await request(app).get('/users/bezos');
    expect(afterRes.body.user.first_name).toEqual('joffrey');
    
  });
});

describe('DELETE', () => {
  test('DELETE deletes a record from the database', async () => {
    
    // Check Before DELETE:
    const beforeRes = await request(app).get('/users');
    expect(beforeRes.statusCode).toBe(200);
    expect(beforeRes.body.users).toHaveLength(1); 
    
    // Do the DELETE:
    const res = await request(app).delete('/users/bezos');
    expect(res.statusCode).toBe(200);

    // Check After DELETE:
    const afterRes = await request(app).get('/users');
    expect(afterRes.statusCode).toBe(200);
    expect(afterRes.body.users).toHaveLength(0); 
  });
});

afterAll(() => {
  db.end();
});