const { BaseRepo } = require('./baseRepo');

class UsersRepo extends BaseRepo {
  constructor(table) {
    super();

    this.table = table;
  }

  async create(attrs) {
    const query = `
      INSERT INTO ${this.table} (email, password) 
      VALUES ($1, $2) 
      RETURNING * 
    `;

    const { email, password } = attrs;

    const result = await this.dbQuery(query, email, password);

    return result.rows[0];
  }
}

module.exports = { UsersRepo };
