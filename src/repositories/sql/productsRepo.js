const { BaseRepo } = require('./baseRepo');

class ProductsRepo extends BaseRepo {
  constructor(table) {
    super();

    this.table = table;
  }

  async create(attrs) {
    const query = `
      INSERT INTO ${this.table} (title, price, image) 
      VALUES ($1, $2, $3) 
      RETURNING * 
    `;

    const { title, price, image } = attrs;

    const result = await this.dbQuery(query, title, price, image);

    return result.rows[0];
  }

  async getAll() {
    const query = `SELECT * FROM ${this.table} ORDER BY id`;

    const result = await this.dbQuery(query);

    return result.rows;
  }

  async update(id, updatedProduct) {
    const query = `UPDATE ${this.table} SET title = $1, price = $2, image = $3 WHERE id = $4`;

    const { title, price, image } = updatedProduct;

    await this.dbQuery(query, title, price, image, id);
  }

  async delete(id) {
    const query = `DELETE FROM ${this.table} WHERE id = $1`;

    await this.dbQuery(query, id);
  }
}

module.exports = {
  ProductsRepo,
};
