const express = require('express');
const cookieSession = require('cookie-session'); //middleware library
const multer = require('multer');
const {
  parseEmail,
  parsePassword,
  parsePasswordConfirmation,
  parseTitle,
  parsePrice,
  requireImage,
} = require('./middlewares/parsers');
const { requireAuth } = require('./middlewares/authenticator');

const { HealthService } = require('./services/healthService');
const { UsersService } = require('./services/usersService');
const { ProductsService } = require('./services/productsService');
const { CartsService } = require('./services/cartsService');

const { HealthHandler } = require('./handlers/healthHandler');
const { SignupHandler } = require('./handlers/signupHandler');
const { SigninHandler } = require('./handlers/signinHandler');
const { SignoutHandler } = require('./handlers/signoutHandler');
const { ProductsHandler } = require('./handlers/productsHandler');
const { ProductsNewHandler } = require('./handlers/productsNewHandler');
const { ProductsEditHandler } = require('./handlers/productsEditHandler');
const { HomeHandler } = require('./handlers/homeHandler');
const { CartHandler } = require('./handlers/cartHandler');
const { CartItemsHandler } = require('./handlers/cartItemsHandler');

const AppFactory = (args) => {
  // repos
  const usersRepo = args.usersRepo;
  const productsRepo = args.productsRepo;
  const cartsRepo = args.cartsRepo;

  // services (business logic layer)
  const healthService = new HealthService({ usersRepo });
  const usersService = new UsersService({ usersRepo });
  const productsService = new ProductsService({ productsRepo });
  const cartsService = new CartsService({ cartsRepo, productsRepo });

  // create server + middlewares
  const upload = multer({ storage: multer.memoryStorage() });
  const app = express();
  app.use(express.static('public'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cookieSession({
      keys: ['hgiojnlvjhoienfvmf'],
      secure: false,
    }),
  );

  // create handlers
  const healthHandler = new HealthHandler({ healthService });
  const signupHandler = new SignupHandler({ usersService });
  const signinHandler = new SigninHandler({ usersService });
  const signoutHandler = new SignoutHandler();
  const productsHandler = new ProductsHandler({ productsService });
  const productsNewHandler = new ProductsNewHandler({ productsService });
  const productsEditHandler = new ProductsEditHandler({ productsService });
  const homeHandler = new HomeHandler({ productsService });
  const cartHandler = new CartHandler({ cartsService });
  const cartItemsHandler = new CartItemsHandler({ cartsService });

  // register handlers to routes
  app.get('/health', healthHandler.get);

  app.get('/signup', signupHandler.get);

  app.post('/signup', [parseEmail, parsePassword, parsePasswordConfirmation], signupHandler.post);

  app.get('/signin', signinHandler.get);

  app.post('/signin', [parseEmail], signinHandler.post);

  app.get('/signout', signoutHandler.get);

  app.get('/admin/products', requireAuth, productsHandler.get);

  app.get('/admin/products/new', requireAuth, productsNewHandler.get);

  app.post(
    '/admin/products/new',
    requireAuth,
    upload.single('image'),
    [parseTitle, parsePrice, requireImage],
    productsNewHandler.post,
  );

  app.get('/admin/products/:id/edit', requireAuth, productsEditHandler.get);

  app.post(
    '/admin/products/:id/edit',
    requireAuth,
    upload.single('image'),
    [parseTitle, parsePrice],
    productsEditHandler.post,
  );

  app.post('/admin/products/:id/delete', requireAuth, productsEditHandler.delete);

  app.get('/', homeHandler.get);

  app.get('/cart', cartHandler.get);

  app.post('/cart', cartHandler.post);

  app.post('/cart/products', cartItemsHandler.post);

  app.post('/cart/products/delete', cartItemsHandler.delete);

  return app;
};

module.exports = AppFactory;
