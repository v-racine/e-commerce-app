const { Config } = require('../../config/config');
const { Client } = require('pg');

const isProduction = Config.Get().nodeEnv === 'prod';

const CONNECTION = {
  connectionString: `${Config.Get().dbServerAddress}/${Config.Get().db}`,
  //ssl: isProduction,  // See note below
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};

class BaseRepo {
  async dbQuery(statement, ...parameters) {
    let client = new Client(CONNECTION);

    try {
      await client.connect();

      return await client.query(statement, parameters);
    } catch (err) {
      console.log('something is broken:', err);
      //TODO: rethrow?
    } finally {
      client.end();
    }
  }

  async getOne(id) {
    const query = `SELECT * FROM ${this.table} WHERE id = $1`;

    let result = await this.dbQuery(query, id);

    return result.rows[0];
  }

  async getOneBy(filters) {
    let query = `SELECT * FROM ${this.table} WHERE `;

    const params = [];

    let count = 1;

    const entries = Object.entries(filters);

    const len = entries.length;

    for (const [key, value] of entries) {
      if (count === len) {
        query += `${key} = $${count}`;
      } else {
        query += `${key} = $${count} AND`;
      }

      params.push(value);

      count++;
    }

    const result = await this.dbQuery(query, ...params);

    return result.rows[0];
  }
}

module.exports = {
  BaseRepo,
};
