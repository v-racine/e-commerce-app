const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');

describe('list all products', () => {
  const mockProductsRepo = {};

  const app = AppFactory({
    productsRepo: mockProductsRepo,
  });

  describe('when: the user wants to view all products', () => {
    let rsp;

    let products = [
      {
        title: 'product1',
      },
      {
        title: 'product2',
      },
    ];

    beforeEach(async () => {
      mockProductsRepo.getAll = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(products);
        });
      });

      rsp = await request(app).get('/admin/products').send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return a list of all the products' titles", async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });
});
