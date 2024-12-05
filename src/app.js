const express = require('express');
const cookieSession = require('cookie-session'); //middleware library
const HealthService = require('./services/healthService');
const HealthController = require('./controllers/healthController');
const { UsersService } = require('./services/usersService');
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
  app.use(
    cookieSession({
      keys: ['hgiojnlvjhoienfvmf'],
    }),
  );

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
      Your id is: ${req.session.userId}
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
