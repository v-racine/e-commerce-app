const AppFactory = require('../src/app');
const request = require('supertest');

describe('list cart items', () => {
  const mockCartsRepo = {};
  const mockProductsRepo = {};

  const app = AppFactory({
    cartsRepo: mockCartsRepo,
    productsRepo: mockProductsRepo,
  });

  describe('when: there is no session cart id and the user requests to view their cart', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app).get('/cart').send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to home', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      const status = rsp.status;
      expect(status).toBe(302);
    });
  });

  describe('when: there is a session cart id and the user requests to view their cart', () => {
    let rsp;

    const cartId = 'sdlkfhs';

    const products = [
      {
        id: 'dflkhs',
        quantity: 1,
      },
      {
        id: '3432423',
        quantity: 3222,
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

      mockProductsRepo.getOne = jest.fn().mockImplementation((itemId) => {
        return new Promise((resolve) => {
          for (const product of products) {
            if (product.id === itemId) {
              resolve({ id: itemId, title: `product_${itemId}`, price: 12 });
            }
          }
        });
      });

      const createRsp = await request(app).post('/cart').send();

      const cookie = createRsp.get('Set-Cookie');

      rsp = await request(app).get('/cart').set('Cookie', cookie).send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: call cartsRepo.getOne, we call productsRepo.getOne for each item, and display the cart items', async () => {
      expect(mockCartsRepo.getOne).toHaveBeenCalledWith(cartId);

      expect(mockProductsRepo.getOne).toHaveBeenCalledTimes(products.length);

      for (let callCount = 1; callCount <= products.length; callCount++) {
        expect(mockProductsRepo.getOne).toHaveBeenNthCalledWith(
          callCount,
          products[callCount - 1].id,
        );
      }

      expect(rsp.text).toMatchSnapshot();
    });
  });

  describe('when: there is a session cart id and the user requests to view their cart but the cart is empty', () => {
    let rsp;

    const cartId = 'papillon';

    const products = [];

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

      mockProductsRepo.getOne = jest.fn();

      const createRsp = await request(app).post('/cart').send();

      const cookie = createRsp.get('Set-Cookie');

      rsp = await request(app).get('/cart').set('Cookie', cookie).send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: call cartsRepo.getOne, we do not call productsRepo.getOne at all, and display some html to the user', async () => {
      expect(mockCartsRepo.getOne).toHaveBeenCalledWith(cartId);

      expect(mockProductsRepo.getOne).toHaveBeenCalledTimes(0);

      expect(rsp.text).toMatchSnapshot();
      expect(rsp.status).toBe(200);
    });
  });
});
