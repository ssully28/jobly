const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Job {
  static async find({ search = '', min_salary=0, min_equity=0, handle_search='' } = {}) {
    const jobs = await db.query(`
      SELECT
        id, title, salary, equity, company_handle, date_posted
      FROM
        jobs
      WHERE
        title like $1 AND
        salary >= $2 AND
        equity >= $3 AND
        company_handle like $4
      `,
      ['%' + search + '%', min_salary, min_equity, '%'+handle_search+'%']
    );

    if (jobs.rows.length === 0 && handle_search === '') {

      throw new ExpressError(`There are no jobs with search terms`, 404);
    }
    return jobs.rows;
  }

  static async findAJob(id) {
    const job = await db.query(`
    SELECT
        id, title, salary, equity, company_handle, date_posted
      FROM
        jobs
      WHERE
        id = $1
    `, [id]);
    if (job.rows.length === 0) {
      throw new ExpressError(`There are no jobs with that id: ${id}`, 404);
    }
    return job.rows[0];
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

  static async update(id, data) {
    let {query, values} = sqlForPartialUpdate('jobs', data, 'id', id);

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ExpressError(`There are no jobs with that id: ${id}`, 404);
    }

    return result.rows[0];
  }

  static async remove(id) {
    const result = await db.query(`
      DELETE FROM jobs
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no company with id ${id}`, 404);
    }

    return;
  }

}


module.exports = Job;