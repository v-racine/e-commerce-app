const { Config } = require('./config/config');

const config = Config.Get(process.env);

const AppFactory = require('./app');
const usersRepo = require('./repositories/usersJSON');
//const bodyParser = require("body-parser");

const app = AppFactory({
  config: config,
  usersRepo: usersRepo,
});

//listener
app.listen(3000, () => {
  console.log('Listening on port 3000...');
});

//`npm run dev` to run the program
