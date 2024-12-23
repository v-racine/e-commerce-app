const { BaseRepo } = require('./baseRepo');

class ProductsRepo extends BaseRepo {
  constructor(table) {
    super();

    this.table = table;
  }

  async getAll() {
    const query = `SELECT * FROM ${this.table};`;

    const result = await this.dbQuery(query);

    return result.rows;
  }
}

module.exports = {
  ProductsRepo,
};
