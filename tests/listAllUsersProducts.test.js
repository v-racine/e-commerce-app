const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');

describe('list all products', () => {
  const mockProductsRepo = {};

  const app = AppFactory({
    productsRepo: mockProductsRepo,
  });

  describe('when: users want to view all products on the homepage', () => {
    let rsp;

    let products = [
      {
        id: '1234',
        title: 'product1',
        price: '12.00',
      },
      {
        id: '12345',
        title: 'product2',
        price: '101000.00',
      },
    ];

    beforeEach(async () => {
      mockProductsRepo.getAll = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(products);
        });
      });

      rsp = await request(app).get('/').send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return a list of all the products', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getAll).toHaveBeenCalledTimes(1);

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });
});
