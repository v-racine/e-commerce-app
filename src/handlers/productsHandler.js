const { BaseHandler } = require('./baseHandler');
const productsIndexTemplate = require('../views/admin/products/index');

class ProductsHandler extends BaseHandler {
  constructor(args) {
    super();

    this.productsService = args.productsService;

    this.get = this.get.bind(this);
  }

  async get(req, res) {
    const products = await this.productsService.listAllProducts();
    res.send(productsIndexTemplate({ products }));
  }
}

module.exports = {
  ProductsHandler,
};
