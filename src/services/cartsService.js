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

  async upsertCart(cartId, productId) {
    let cart;

    //figure out if user has a cart OR we need to create one
    if (!cartId) {
      //user does not have a cart, so we need to create one AND store the cart id on the user's cookie (i.e. on the `req.session.cardId` property)
      cart = await this.createCart();
    } else {
      //user has a cart! we need to retrieve it from the repo
      cart = await this.retrieveCart(cartId);
    }

    //increment quantity of an exisiting product in user's cart OR add a new product to `items` array in user's cart
    const existingItem = cart.items.find((item) => item.id === productId);
    if (existingItem) {
      //increment quantity and save cart
      existingItem.quantity += 1;
    } else {
      //add new product id to the `items` array
      cart.items.push({ id: productId, quantity: 1 });
    }

    await this.updateCart(cart.id, { items: cart.items });

    return cart;
  }
}

module.exports = {
  CartsService,
};
