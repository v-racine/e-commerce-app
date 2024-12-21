const AppFactory = require('../src/app');
const request = require('supertest');

describe('upsert cart', () => {
  const mockCartsRepo = {};

  const app = AppFactory({
    cartsRepo: mockCartsRepo,
  });

  describe('when: there is no session cart id and the user wants to add a product to their cart', () => {
    let rsp;

    const cartId = 'dskfhds';

    const productId = '345907340';

    beforeEach(async () => {
      mockCartsRepo.create = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: cartId, items: [] });
        });
      });

      mockCartsRepo.update = jest.fn();

      rsp = await request(app).post('/cart/products').send({ productId: productId });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we call cartsRepo.create, add cart id to session, call cartsRepo.update correctly (quantity === 1), and redirect with status 302', async () => {
      expect(mockCartsRepo.create).toHaveBeenCalledWith({ items: [] });

      const cookie = rsp.get('Set-Cookie');

      const session = atob(cookie[0].split('=')[1]);

      expect(session).toEqual(JSON.stringify({ cartId: cartId }));

      expect(mockCartsRepo.update).toHaveBeenCalledWith(cartId, {
        items: [{ id: productId, quantity: 1 }],
      });

      expect(rsp.status).toBe(302);
    });
  });

  describe('when: there is a session cart id and the user wants to add an instance of a product to their cart that is not already there', () => {
    let rsp;

    const cartId = '32904u238f';

    const newProductId = '555lkcsscsdlkd';

    const products = [
      {
        id: 'dskfjlsd',
        quantity: 1,
      },
      {
        id: '3f80jw3',
        quantity: 1000,
      },
    ];

    beforeEach(async () => {
      mockCartsRepo.create = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: cartId, items: [] });
        });
      });

      mockCartsRepo.getOne = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: cartId, items: products });
        });
      });

      mockCartsRepo.update = jest.fn();

      const createRsp = await request(app).post('/cart').send();

      const cookie = createRsp.get('Set-Cookie');

      rsp = await request(app)
        .post('/cart/products')
        .set('Cookie', cookie)
        .send({ productId: newProductId });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we do not call cartsRepo.create (except just to get the session), we call cartsRepo.getOne correctly, call cartsRepo.update correctly (quantity === 1), and redirect with status 302', async () => {
      expect(mockCartsRepo.create).toHaveBeenCalledTimes(1);

      expect(mockCartsRepo.getOne).toHaveBeenCalledWith(cartId);

      expect(mockCartsRepo.update).toHaveBeenCalledWith(cartId, { items: products });

      expect(products[products.length - 1].quantity).toBe(1);

      expect(rsp.status).toBe(302);
    });
  });

  describe('when: there is a session cart id and the user wants to add an instance of a product to their cart that is already there', () => {
    let rsp;

    const cartId = 'ewifj';

    const extantProductId = '342';

    const currentQuantity = 4;

    const expectedQuantityChange = 5;

    const products = [
      {
        id: extantProductId,
        quantity: currentQuantity,
      },
    ];

    beforeEach(async () => {
      mockCartsRepo.create = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: cartId, items: [] });
        });
      });

      mockCartsRepo.getOne = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: cartId, items: products });
        });
      });

      mockCartsRepo.update = jest.fn();

      const createRsp = await request(app).post('/cart').send();

      const cookie = createRsp.get('Set-Cookie');

      rsp = await request(app)
        .post('/cart/products')
        .set('Cookie', cookie)
        .send({ productId: extantProductId });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we do not call cartsRepo.create (except just to get the session), we call cartsRepo.getOne correctly, call cartsRepo.update correctly (quantity++), and redirect with status 302', async () => {
      expect(mockCartsRepo.create).toHaveBeenCalledTimes(1);

      expect(mockCartsRepo.getOne).toHaveBeenCalledWith(cartId);

      expect(mockCartsRepo.update).toHaveBeenCalledWith(cartId, { items: products });

      const product = products.find((p) => {
        return p.id === extantProductId;
      });

      expect(product.quantity).toBe(expectedQuantityChange);

      expect(rsp.status).toBe(302);
    });
  });
});
