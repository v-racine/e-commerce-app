class UsersProductsService {
  constructor(args) {
    this.productsRepo = args.productsRepo;
  }

  async listAllProducts() {
    return await this.productsRepo.getAll();
  }
}

module.exports = { UsersProductsService };
