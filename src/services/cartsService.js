class CartsService {
  constructor(args) {
    this.cartsRepo = args.cartsRepo;
  }

  async createCart() {
    return await this.cartsRepo.create({ items: [] });
  }

  async retrieveCart(id) {
    return await this.cartsRepo.getOne(id);
  }

  async updateCart(id, newObj) {
    return await this.cartsRepo.update(id, newObj);
  }
}

module.exports = {
  CartsService,
};
