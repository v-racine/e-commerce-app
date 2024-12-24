const { BaseRepo } = require('./baseRepo');

class CartsRepo extends BaseRepo {
  constructor(table, joinTable) {
    super();

    this.table = table;
    this.joinTable = joinTable;
  }

  async create() {
    const query = `
      INSERT INTO ${this.table} 
      DEFAULT VALUES
      RETURNING *;
    `;

    const result = await this.dbQuery(query);

    const cart = result.rows[0];

    cart.items = [];

    return cart;
  }

  async getOne(id) {
    const query = `
      SELECT count(*), product_id 
      FROM ${this.table}
      INNER JOIN ${this.joinTable}
      ON ${this.joinTable}.cart_id = ${this.table}.id
      WHERE ${this.table}.id = $1
      GROUP BY product_id
    `;

    let result = await this.dbQuery(query, id);

    const cart = { id: id, items: [] };

    for (const { product_id, count } of result.rows) {
      cart.items.push({ id: String(product_id), quantity: Number(count) });
    }

    return cart;
  }

  async update(cartId, updatedCart) {
    const { items } = updatedCart;

    const query = `
        SELECT count(*), product_id
        FROM ${this.joinTable}
        WHERE cart_id = $1
        GROUP BY product_id
      `;

    const result = await this.dbQuery(query, cartId);

    // do we need to update quantities?
    let productToFoundForUpdate = {};

    for (const item of items) {
      const product = result.rows.find((row) => {
        return Number(item.id) === row.product_id;
      });

      if (product) {
        productToFoundForUpdate[item.id] = { quantity: item.quantity, count: product.count };
      } else {
        productToFoundForUpdate[item.id] = { quantity: item.quantity, count: 0 };
      }
    }

    for (const [productId, found] of Object.entries(productToFoundForUpdate)) {
      if (found.quantity <= found.count) {
        continue;
      }

      for (let i = 0; i < found.quantity - found.count; i++) {
        const query = `
            INSERT INTO ${this.joinTable} (cart_id, product_id)
            VALUES ($1, $2)
          `;

        await this.dbQuery(query, cartId, productId);
      }
    }

    // do we need to delete?
    let productIdsToDelete = [];

    for (const product of result.rows) {
      const item = items.find((i) => {
        return Number(i.id) === product.product_id;
      });

      if (!item) {
        productIdsToDelete.push(product.product_id);
      }
    }

    for (const productId of productIdsToDelete) {
      const query = `
        DELETE FROM ${this.joinTable}
        WHERE cart_id = $1 AND product_id = $2
      `;

      await this.dbQuery(query, cartId, productId);
    }
  }
}

module.exports = { CartsRepo };
