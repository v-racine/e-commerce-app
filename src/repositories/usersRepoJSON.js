const fs = require('fs');
const crypto = require('crypto');

class UsersRepositoryJSON {
  constructor(filename) {
    if (!filename) {
      throw new Error('Creating a repository requires a filename');
    }

    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async getAll() {
    //opens the file called this.filename
    const contents = await fs.promises.readFile(this.filename, { encoding: 'utf8' });
    //parse the contents
    const data = JSON.parse(contents);
    //return the parsed data
    return data;
  }

  async create(attrs) {
    attrs.id = this.randomId();

    const records = await this.getAll();

    records.push(attrs);

    //write the updated "records" array back to this.filename
    await this.writeAll(records);

    return record;
  }

  async writeAll(records) {
    await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }
  }
}

// //test function
// const test = async () => {
//   const repo = new UsersRepositoryJSON("users.json");
//   const user = await repo.getOneBy({ email: "test@test.com" });
//   console.log(user);
// }
// test();

//Instead of exporting the entire class, we'll instead export an instance of a class
module.exports = new UsersRepositoryJSON('users.json');
// //To import in another file
// const repo = require("./usersJSON")
// repo.getAll();
