const { BaseHandler } = require('./baseHandler');

class CartItemsHandler extends BaseHandler {
  constructor(args) {
    super();

    this.cartsService = args.cartsService;

    this.post = this.post.bind(this);
    this.delete = this.delete.bind(this);
  }

  async post(req, res) {
    const cartId = req.session.cartId;

    const productId = req.body.productId;

    const cart = await this.cartsService.upsertCart(cartId, productId);

    req.session.cartId = cart.id;

    res.redirect('/cart');
  }

  async delete(req, res) {
    const { itemId } = req.body;

    const cartId = req.session.cartId;

    await this.cartsService.deleteFromCart(cartId, itemId);

    res.redirect('/cart');
  }
}

module.exports = {
  CartItemsHandler,
};
