const { BaseHandler } = require('./baseHandler');
const productsEditTemplate = require('../views/admin/products/edit');
const { ErrProductNotFound } = require('../services/productsService');
const { validationResult } = require('express-validator'); //middleware library

class ProductsEditHandler extends BaseHandler {
  constructor(args) {
    super();

    this.productsService = args.productsService;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res) {
    let product;

    try {
      product = await this.productsService.retrieveProduct(req.params.id);
    } catch (err) {
      if (err instanceof ErrProductNotFound) {
        return res.send(`${err.message}`);
      } else {
        console.log(`failed to create new product: ${err}`);
        return res.send('Internal server error');
      }
    }

    return res.send(productsEditTemplate({ product }));
  }

  async post(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const product = await this.productsService.retrieveProduct(req.params.id);
      return res.send(productsEditTemplate({ errors, product }));
    }

    const changes = req.body;

    if (req.file) {
      changes.image = req.file.buffer.toString('base64');
    }

    try {
      await this.productsService.updateProduct(req.params.id, changes);
    } catch (err) {
      if (err instanceof ErrProductNotFound) {
        return res.send(`${err.message}`);
      } else {
        console.log(`failed to update new product: ${err}`);
        return res.send('Internal server error');
      }
    }

    res.redirect('/admin/products');
  }

  async delete(req, res) {
    try {
      await this.productsService.deleteProduct(req.params.id);
    } catch (err) {
      console.log(`failed to delete product ${req.params.id}: ${err}`);
      return res.status(500).send('Internal server error');
    }

    res.redirect('/admin/products');
  }
}

module.exports = {
  ProductsEditHandler,
};
