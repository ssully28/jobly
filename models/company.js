const db = require("../db");


class Company {
  static async find({search='', min_employees=0, max_employees=287000000} = {}) {
    console.log("SEARCH", search);
    console.log("min_employees", min_employees);
    console.log("max_employees", max_employees);


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
}


module.exports = Company;