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
const { CartsService } = require('./services/cartsService');
const { CreateUserController } = require('./controllers/createUserController');
const { SignInController } = require('./controllers/signInController');

const signupTemplate = require('./views/admin/auth/signup');
const signinTemplate = require('./views/admin/auth/signin');
const productsNewTemplate = require('./views/admin/products/new');
const productsIndexTemplate = require('./views/admin/products/index');
const productsEditTemplate = require('./views/admin/products/edit');
const productIndexTemplate = require('./views/usersProducts/index');
const cartShowTemplate = require('./views/carts/show');

const {
  parseEmail,
  parsePassword,
  parsePasswordConfirmation,
  parseTitle,
  parsePrice,
  requireImage,
} = require('./middlewares/parsers');
const { requireAuth } = require('./middlewares/authenticator');
const cartsRepo = require('./repositories/cartsRepo');

const AppFactory = (args) => {
  // repos
  const usersRepo = args.usersRepo;
  const productsRepo = args.productsRepo;

  // services (business logic layer)
  const healthService = new HealthService({ usersRepo });
  const usersService = new UsersService({ usersRepo });
  const productsService = new ProductsService({ productsRepo });
  const cartsService = new CartsService({ cartsRepo });

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

  //admin products route handlers
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
      product = await productsService.retrieveProduct(req.params.id);
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

  app.post(
    '/admin/products/:id/edit',
    requireAuth,
    upload.single('image'),
    [parseTitle, parsePrice],
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const product = await productsService.retrieveProduct(req.params.id);
        return res.send(productsEditTemplate({ errors, product }));
      }

      const changes = req.body;

      if (req.file) {
        changes.image = req.file.buffer.toString('base64');
      }

      try {
        await productsService.updateProduct(req.params.id, changes);
      } catch (err) {
        if (err instanceof ErrProductNotFound) {
          return res.send(`${err.message}`);
        } else {
          console.log(`failed to update new product: ${err}`);
          return res.send('Internal server error');
        }
      }

      res.redirect('/admin/products');
    },
  );

  app.post('/admin/products/:id/delete', requireAuth, async (req, res) => {
    try {
      await productsService.deleteProduct(req.params.id);
    } catch (err) {
      console.log(`failed to delete product ${req.params.id}: ${err}`);
      return res.status(500).send('Internal server error');
    }

    res.redirect('/admin/products');
  });

  //users products route handlers
  app.get('/', async (req, res) => {
    const products = await productsService.listAllProducts();
    res.send(productIndexTemplate({ products }));
  });

  //carts route handlers

  //handler for "add to cart" feature =>
  app.post('/cart/products', async (req, res) => {
    let cart;

    //figure out if user has a cart OR we need to create one
    if (!req.session.cartId) {
      //user does not have a cart, so we need to create one AND store the cart id on the user's cookie (i.e. on the `req.session.cardId` property)
      cart = await cartsService.createCart();
      req.session.cartId = cart.id;
    } else {
      //user has a cart! we need to retrieve it from the repo
      cart = await cartsService.retrieveCart(req.session.cartId);
    }

    //increment quantity of an exisiting product in user's cart OR add a new product to `items` array in user's cart
    const existingItem = cart.items.find((item) => item.id === req.body.productId);
    if (existingItem) {
      //increment quantity and save cart
      existingItem.quantity += 1;
    } else {
      //add new product id to the `items` array
      cart.items.push({ id: req.body.productId, quantity: 1 });
    }

    await cartsService.updateCart(cart.id, { items: cart.items });

    res.redirect('/cart');
  });

  //handler for "view all items in shopping cart" feature =>
  app.get('/cart', async (req, res) => {
    //if user does NOT have a cart, redirect
    if (!req.session.cartId) {
      return res.redirect('/');
    }
    //if user has a cart, retrieve it
    const cart = await cartsService.retrieveCart(req.session.cartId);

    for (let item of cart.items) {
      //item === {id: ..., quantity: ...}
      const product = await productsService.retrieveProduct(item.id);
      item.product = product;
    }
    res.send(cartShowTemplate({ items: cart.items }));
  });

  //handler for "remove an item from shopping cart" feature
  app.post('/cart/products/delete', async (req, res) => {
    const { itemId } = req.body;
    const cart = await cartsService.retrieveCart(req.session.cartId);

    //filtering out the item that is to be deleted from the `items` array
    const items = cart.items.filter((item) => item.id !== itemId);

    await cartsService.updateCart(req.session.cartId, { items: items });

    res.redirect('/cart');
  });

  return app;
};

module.exports = AppFactory;
