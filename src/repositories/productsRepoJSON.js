const Repository = require('./repository');

class ProductsRepositoryJSON extends Repository {}

//Instead of exporting the entire class, we'll instead export an instance of a class
module.exports = new ProductsRepositoryJSON('products.json');
// To import in another file
// `const repo = require("./usersJSON")`
// `repo.getAll();`
