const express = require('express');
const cookieSession = require('cookie-session'); //middleware library
const { check, body, validationResult } = require('express-validator'); //middleware library
const { HealthService } = require('./services/healthService');
const { HealthController } = require('./controllers/healthController');
const { UsersService } = require('./services/usersService');
const { CreateUserController } = require('./controllers/createUserController');
const { SignInController } = require('./controllers/signInController');
const signupTemplate = require('./views/admin/auth/signup');
const signinTemplate = require('./views/admin/auth/signin');
const { parseEmail, parsePassword, parsePasswordConfirmation } = require('./parsers');

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
      secure: false,
    }),
  );

  // create controllers
  const healthController = new HealthController({ healthService });
  const createUserController = new CreateUserController({ usersService });
  const signInController = new SignInController({ usersService });

  // create routers
  // TODO

  // register routes
  app.get('/health', async (req, res) => {
    return healthController.execute(req, res);
  });

  app.get('/', (req, res) => {
    res.redirect('/signup');
  });

  app.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
  });

  app.post('/signup', [parseEmail, parsePassword, parsePasswordConfirmation], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send(signupTemplate({ req, errors }));
    }

    return createUserController.execute(req, res);
  });

  app.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are logged out.');
    //res.redirect('/signup');
  });

  app.get('/signin', (req, res) => {
    res.send(signinTemplate());
  });

  app.post('/signin', async (req, res) => {
    return signInController.execute(req, res);
  });

  return app;
};

module.exports = AppFactory;
