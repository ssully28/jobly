const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const Job = require("./job");

class Company {

  static async findACompany(handle) {

    const companyRes = await db.query(`
      SELECT
        handle, name, num_employees, description, logo_url
      FROM
        companies
      WHERE
        handle = $1
      `,
      [handle]
    );

    if (companyRes.rows.length === 0) {
      
      throw new ExpressError(`There is no company with handle ${handle}`, 404);
    }

    const jobs = await Job.find({"handle_search":handle});
    companyRes.rows[0].jobs = jobs;

    return companyRes.rows[0];
  }

  static async find({search='', min_employees=0, max_employees=287000000} = {}) {

    const companies = await db.query(`
      SELECT
        handle, name
      FROM
        companies
      WHERE
        (name like $1 OR handle like $1) AND
        num_employees >= $2 AND
        num_employees <= $3
      ORDER BY
        handle
      `,
      ['%'+search+'%', parseInt(min_employees), parseInt(max_employees)]
    );
    return companies.rows;
  }

  static async create(data) {
    const result = await db.query(`
      INSERT INTO companies (
        handle, name, num_employees, description, logo_url
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle, name, num_employees, description, logo_url
    `, [ data.handle, data.name, data.num_employees, data.description, data.logo_url]);

    return result.rows[0];
  }

  static async update(handle, data) {
    let {query, values} = sqlForPartialUpdate('companies', data, 'handle', handle);

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no company with handle ${handle}`, 404);
    }

    return result.rows[0];
  }

  static async remove(handle) {
    const result = await db.query(`
      DELETE FROM companies 
      WHERE handle = $1
      RETURNING handle
    `, [handle]);

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no company with handle ${handle}`, 404);
    }

    return;
  }
}


module.exports = Company;