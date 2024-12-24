class CartsService {
  constructor(args) {
    this.cartsRepo = args.cartsRepo;
    this.productsRepo = args.productsRepo;
  }

  async createCart() {
    return await this.cartsRepo.create({ items: [] });
  }

  async retrieveCart(id) {
    return await this.cartsRepo.getOne(id);
  }

  async retrieveProduct(id) {
    return await this.productsRepo.getOne(id);
  }

  async updateCart(id, newObj) {
    return await this.cartsRepo.update(id, newObj);
  }

  async upsertCart(cartId, productId) {
    let cart;

    if (!cartId) {
      //user does not have a cart, so we need to create one
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

  async showCart(cartId) {
    const cart = await this.retrieveCart(cartId);

    for (let item of cart.items) {
      //item === {id: ..., quantity: ...}
      const product = await this.retrieveProduct(item.id);

      item.product = product;
    }

    return cart;
  }

  async deleteFromCart(cartId, itemId) {
    const cart = await this.retrieveCart(cartId);

    //filtering out the item that is to be deleted from the `items` array
    const items = cart.items.filter((item) => {
      return item.id !== itemId;
    });

    await this.updateCart(cartId, { items: items });
  }
}

module.exports = {
  CartsService,
};
