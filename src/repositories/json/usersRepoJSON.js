const fs = require('fs');
const crypto = require('crypto');
const Repository = require('./repository');

class UsersRepositoryJSON extends Repository {
  async create(attrs) {
    attrs.id = this.randomId();

    const records = await this.getAll();

    records.push(attrs);

    //write the updated "records" array back to this.filename
    await this.writeAll(records);

    return attrs;
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
// To import in another file
// `const repo = require("./usersJSON")`
// `repo.getAll();`
