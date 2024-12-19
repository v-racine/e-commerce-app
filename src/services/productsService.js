class ErrProductIsNotNew extends Error {
  constructor() {
    super('Product already exists');
  }
}

class ErrProductNotFound extends Error {
  constructor() {
    super('Product not found');
  }
}

class ProductsService {
  constructor(args) {
    this.productsRepo = args.productsRepo;
  }

  async createNewProduct(title, price, image) {
    const existingProduct = await this.productsRepo.getOneBy({ title });
    if (existingProduct) {
      throw new ErrProductIsNotNew();
    }

    const product = await this.productsRepo.create({
      title,
      price,
      image,
    });

    return product;
  }

  async listAllProducts() {
    return await this.productsRepo.getAll();
  }

  async retrieveProduct(id) {
    const existingProduct = await this.productsRepo.getOne(id);
    if (!existingProduct) {
      throw new ErrProductNotFound();
    }

    return existingProduct;
  }

  async updateProduct(id, attrs) {
    const existingProduct = await this.retrieveProduct(id);

    Object.assign(existingProduct, attrs);

    await this.productsRepo.update(id, existingProduct);
  }
}

module.exports = {
  ProductsService,
  ErrProductIsNotNew,
  ErrProductNotFound,
};
