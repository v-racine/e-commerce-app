const { Config } = require('./config/config');

Config.Get(process.env);

const AppFactory = require('./app');
const usersRepo = require('./repositories/usersRepoJSON');
const productsRepo = require('./repositories/productsRepoJSON');
const cartsRepo = require('./repositories/cartsRepo');
//const bodyParser = require("body-parser");

const app = AppFactory({
  usersRepo: usersRepo,
  productsRepo: productsRepo,
  cartsRepo: cartsRepo,
});

//listener
app.listen(3000, () => {
  console.log('Listening on port 3000...');
});

//`npm run dev` to run the program
