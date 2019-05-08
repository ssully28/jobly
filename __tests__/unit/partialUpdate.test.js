const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      let items = {
        'username': 'user1',
      }

      let sql = sqlForPartialUpdate('test_table', items, 'user_id', 1);

      expect(sql).toHaveProperty('query');
      expect(sql).toHaveProperty('values');
      expect(sql.values).toContain('user1');
      expect(sql.values).toContain(1);
      expect(sql.query).toEqual('UPDATE test_table SET username=$1 WHERE user_id=$2 RETURNING *');

    });
});
