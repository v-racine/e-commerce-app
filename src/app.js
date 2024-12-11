const express = require('express');
const cookieSession = require('cookie-session'); //middleware library
const { HealthService } = require('./services/healthService');
const { HealthController } = require('./controllers/healthController');
const { UsersService } = require('./services/usersService');
const { CreateUserController } = require('./controllers/createUserController');
const { SignInController } = require('./controllers/signInController');
const signupTemplate = require('../views/admin/auth/signup');
const signinTemplate = require('../views/admin/auth/signin');

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

  // TODO: refactor and make new views directory?
  app.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
  });

  app.post('/signup', async (req, res) => {
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
