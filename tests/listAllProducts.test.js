const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');
const { signupHelper } = require('./testUtils/signupHelper');

describe('list all products', () => {
  const mockProductsRepo = {};
  const mockUsersRepo = {};

  const app = AppFactory({
    productsRepo: mockProductsRepo,
    usersRepo: mockUsersRepo,
  });

  describe('when: the user wants to view all products but is not signed in', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app).get('/admin/products').send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to sign-in page', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      const status = rsp.status;
      expect(status).toBe(302);
    });
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

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app).get('/admin/products').set('Cookie', cookie).send();
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
