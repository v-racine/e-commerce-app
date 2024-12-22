const { BaseHandler } = require('./baseHandler');
const cartShowTemplate = require('../views/carts/show');

class CartHandler extends BaseHandler {
  constructor(args) {
    super();

    this.cartsService = args.cartsService;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
  }

  async get(req, res) {
    //if user does NOT have a cart, redirect
    if (!req.session.cartId) {
      return res.redirect('/');
    }

    //retrieve cart
    const cart = await this.cartsService.showCart(req.session.cartId);

    res.send(cartShowTemplate({ items: cart.items }));
  }

  async post(req, res) {
    const cart = await this.cartsService.createCart();

    req.session.cartId = cart.id;

    res.status(201).send('cart created');
  }
}

module.exports = {
  CartHandler,
};
