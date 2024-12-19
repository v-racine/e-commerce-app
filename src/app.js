const express = require('express');
const cookieSession = require('cookie-session'); //middleware library
const { validationResult } = require('express-validator'); //middleware library
const multer = require('multer');

const { HealthService } = require('./services/healthService');
const { HealthController } = require('./controllers/healthController');
const { UsersService } = require('./services/usersService');
const {
  ProductsService,
  ErrProductIsNotNew,
  ErrProductNotFound,
} = require('./services/productsService');
const { CreateUserController } = require('./controllers/createUserController');
const { SignInController } = require('./controllers/signInController');

const signupTemplate = require('./views/admin/auth/signup');
const signinTemplate = require('./views/admin/auth/signin');
const productsNewTemplate = require('./views/admin/products/new');
const productsIndexTemplate = require('./views/admin/products/index');
const productsEditTemplate = require('./views/admin/products/edit');

const {
  parseEmail,
  parsePassword,
  parsePasswordConfirmation,
  parseTitle,
  parsePrice,
  requireImage,
} = require('./middlewares/parsers');
const { requireAuth } = require('./middlewares/authenticator');

const AppFactory = (args) => {
  // repos
  const usersRepo = args.usersRepo;
  const productsRepo = args.productsRepo;

  // services (business logic layer)
  const healthService = new HealthService({ usersRepo });
  const usersService = new UsersService({ usersRepo });
  const productsService = new ProductsService({ productsRepo });

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

  // create controllers
  const healthController = new HealthController({ healthService });
  const createUserController = new CreateUserController({ usersService });
  const signInController = new SignInController({ usersService });

  // create routers
  // TODO

  app.get('/health', async (req, res) => {
    return healthController.execute(req, res);
  });

  // admin route handlers
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
    res.send(signinTemplate({}));
  });

  app.post('/signin', [parseEmail], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send(signinTemplate({ errors }));
    }

    return signInController.execute(req, res);
  });

  //products route handlers
  app.get('/admin/products', requireAuth, async (req, res) => {
    const products = await productsService.listAllProducts();
    res.send(productsIndexTemplate({ products }));
  });

  app.get('/admin/products/new', requireAuth, async (req, res) => {
    res.send(productsNewTemplate({}));
  });

  app.post(
    '/admin/products/new',
    requireAuth,
    upload.single('image'),
    [parseTitle, parsePrice, requireImage],
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.send(productsNewTemplate({ errors }));
      }

      //
      const image = req.file.buffer.toString('base64');
      const { title, price } = req.body;

      let product;

      try {
        product = await productsService.createNewProduct(title, price, image);
      } catch (err) {
        if (err instanceof ErrProductIsNotNew) {
          return res.send(productsNewTemplate({ submitError: err.message }));
        } else {
          console.log(`failed to create new product: ${err}`);
          return res.send('Internal server error');
        }
      }

      //return res.send(`Submitted ${product.id}`);
      res.redirect('/admin/products');
    },
  );

  app.get('/admin/products/:id/edit', requireAuth, async (req, res) => {
    let product;

    try {
      product = await productsService.editProduct(req.params.id);
    } catch (err) {
      if (err instanceof ErrProductNotFound) {
        return res.send(`${err.message}`);
      } else {
        console.log(`failed to create new product: ${err}`);
        return res.send('Internal server error');
      }
    }

    return res.send(productsEditTemplate({ product }));
  });

  app.post('/admin/products/:id/edit', requireAuth, async (req, res) => {});

  return app;
};

module.exports = AppFactory;
