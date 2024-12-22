const { BaseHandler } = require('./baseHandler');
const productsNewTemplate = require('../views/admin/products/new');
const { validationResult } = require('express-validator'); //middleware library
const { ErrProductIsNotNew } = require('../services/productsService');

class ProductsNewHandler extends BaseHandler {
  constructor(args) {
    super();

    this.productsService = args.productsService;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
  }

  async get(req, res) {
    res.send(productsNewTemplate({}));
  }

  async post(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send(productsNewTemplate({ errors }));
    }

    const image = req.file.buffer.toString('base64');
    const { title, price } = req.body;

    let product;

    try {
      product = await this.productsService.createNewProduct(title, price, image);
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
  }
}

module.exports = {
  ProductsNewHandler,
};
