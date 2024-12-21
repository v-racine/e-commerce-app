const AppFactory = require('../src/app');
const request = require('supertest');

describe('remove cart item', () => {
  const mockCartsRepo = {};

  const app = AppFactory({
    cartsRepo: mockCartsRepo,
  });

  describe('when: the user tries to remove a product', () => {
    let rsp;

    const cartId = 'dfslk';

    const toRemove = '3432423';

    const products = [
      {
        id: 'dflkhs',
        quantity: 1,
      },
      {
        id: toRemove,
        quantity: 22,
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
        .post('/cart/products/delete')
        .set('Cookie', cookie)
        .send({ itemId: toRemove });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we call cartsRepo.getOne correctly, we call cartsRepo.update correctly, and redirect the user', async () => {
      expect(mockCartsRepo.getOne).toHaveBeenCalledWith(cartId);

      const filtered = products.filter((p) => {
        return p.id !== toRemove;
      });

      expect(mockCartsRepo.update).toHaveBeenCalledWith(cartId, { items: filtered });

      expect(rsp.status).toBe(302);
    });
  });
});
