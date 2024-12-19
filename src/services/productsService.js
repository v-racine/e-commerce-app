class ErrProductIsNotNew extends Error {
  constructor() {
    super('Product already exists');
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

  async editProduct(id) {
    return await this.productsRepo.getOne(id);
  }
}

module.exports = {
  ProductsService,
  ErrProductIsNotNew,
};
