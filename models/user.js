const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const bcrypt = require("bcrypt");

class User {

  static async findAUser(username) {
    const userRes = await db.query(`
      SELECT
        username, first_name, last_name, email, photo_url
      FROM
        users
      WHERE
        username = $1
      `,
    [username]
    );

    if (userRes.rows.length === 0) {

      throw new ExpressError(`There is no user with username: ${username}`, 404);
    }

    return userRes.rows[0];
  }

  static async findAll() {
    const users = await db.query(`
      SELECT
        username, first_name, last_name, email
      FROM
        users
      `
    );
    return users.rows;
  }

  static async create(data, password) {

    let hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(`
      INSERT INTO users (
       username, password, first_name, last_name, email, photo_url, is_admin
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, first_name, last_name, email, photo_url, is_admin
    `, [data.username, hashedPassword, data.first_name, data.last_name, data.email, data.photo_url, data.is_admin]);

    return result.rows[0];
  }

  static async update(username, data) {
    let { query, values } = sqlForPartialUpdate('users', data, 'username', username);

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no user with username ${username}`, 404);
    }

    return result.rows[0];
  }

  static async remove(username) {
    const result = await db.query(`
      DELETE FROM users
      WHERE username = $1
      RETURNING username
    `, [username]);

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no user with username ${username}`, 404);
    }

    return;
  }

  static async authenticate(username, password) {
    const result = await db.query(
      `
      SELECT password
      FROM users
      WHERE username = $1
      `
      , [username]
    );

    let user = result.rows[0];

    return user && await bcrypt.compare(password, user.password);
  }
}


module.exports = User;