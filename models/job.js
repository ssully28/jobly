const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Job {
  static async find({ search = '', min_salary=0, min_equity=0 } = {}) {
    const jobs = await db.query(`
      SELECT
        id, title, salary, equity, company_handle, date_posted
      FROM
        jobs
      WHERE
        title like $1 AND
        salary >= $2 AND
        equity >= $3
      `,
      ['%' + search + '%', min_salary, min_equity]
    );

    if (jobs.rows.length === 0) {

      throw new ExpressError(`There are no job with search terms`, 404);
    }
    return jobs.rows[0];
  }

  static async create(data) {
    const result = await db.query(`
      INSERT INTO jobs (
        title, salary, equity, company_handle, date_posted
      )
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING id, title, salary, equity, company_handle, date_posted
    `, [data.title, data.salary, data.equity, data.company_handle]);

    return result.rows[0];
  }



}


module.exports = Job;