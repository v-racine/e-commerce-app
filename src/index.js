const { Config } = require('./config/config');

Config.Get(process.env);

const AppFactory = require('./app');
// const usersRepo = require('./repositories/json/usersRepoJSON');
const { UsersRepo } = require('./repositories/sql/usersRepo');
// const productsRepo = require('./repositories/productsRepoJSON');
const { ProductsRepo } = require('./repositories/sql/productsRepo');
//const cartsRepo = require('./repositories/json/cartsRepo');
const { CartsRepo } = require('./repositories/sql/cartsRepo');
//const bodyParser = require("body-parser");

const app = AppFactory({
  usersRepo: new UsersRepo('admin_users'),
  productsRepo: new ProductsRepo('products'),
  cartsRepo: new CartsRepo('carts', 'products_carts'),
});

//listener
app.listen(3000, () => {
  console.log('Listening on port 3000...');
});

//`npm run dev` to run the program
