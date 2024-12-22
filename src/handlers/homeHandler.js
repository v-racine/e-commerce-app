const { BaseHandler } = require('./baseHandler');
const productIndexTemplate = require('../views/usersProducts/index');

class HomeHandler extends BaseHandler {
  constructor(args) {
    super();

    this.productsService = args.productsService;

    this.get = this.get.bind(this);
  }

  async get(req, res) {
    const products = await this.productsService.listAllProducts();
    res.send(productIndexTemplate({ products }));
  }
}

module.exports = {
  HomeHandler,
};
