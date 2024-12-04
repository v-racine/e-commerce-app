const express = require('express');
const HealthService = require('./services/healthService');
const HealthController = require('./controllers/healthController');
const UsersService = require('./services/usersService');
const CreateUserController = require('./controllers/createUserController');

const AppFactory = (args) => {
  // repos
  const usersRepo = args.usersRepo;

  // services (business logic layer)
  const healthService = new HealthService({ usersRepo });
  const usersService = new UsersService({ usersRepo });

  // create server + middlewares
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //Middleware: Functions that does some kind of processing on the `req` and `res` objects before we actually call our route handlers.
  //`next()`: callback function provided by Express framework that runs the actual route handler callback when our middlewars is done doing its business.

  // const bodyParser = (req, res, next) => {
  //   // get access to email, password, passwordConfirmation
  //   if (req.method === "POST") {
  //     req.on("data", data => {
  //       const parsed = data.toString("utf8").split("&");
  //       const formData = {};

  //       for(let pair of parsed) {
  //         const [key, value] = pair.split("=");
  //         formData[key] = value;
  //       }
  //       req.body = formData;
  //       next();
  //     });
  //   } else {
  //     next();
  //   }
  // };

  // create controllers
  const healthController = new HealthController({ healthService });
  const createUserController = new CreateUserController({ usersService });

  // create routers
  // TODO

  // register routes
  app.get('/health', async (req, res) => {
    return healthController.execute(req, res);
  });

  // TODO: refactor and make new views directory?
  app.get('/', (req, res) => {
    res.send(`
    <div>
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <input name= "passwordConfirmation" placeholder="password confirmation" />
        <button>Sign Up</button>
      </form>
    </div>
  `);
  });

  app.post('/', async (req, res) => {
    return createUserController.execute(req, res);
  });

  return app;
};

module.exports = AppFactory;
