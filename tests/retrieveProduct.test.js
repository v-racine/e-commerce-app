const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');
const { signupHelper } = require('./testUtils/signupHelper');

describe('retrieve a product to edit', () => {
  const mockProductsRepo = {};
  const mockUsersRepo = {};

  const app = AppFactory({
    productsRepo: mockProductsRepo,
    usersRepo: mockUsersRepo,
  });

  describe('when: the db does not contain the product requested', () => {
    let rsp;

    let id = '12345';

    beforeEach(async () => {
      mockProductsRepo.getOne = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(undefined);
        });
      });

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app).get(`/admin/products/${id}/edit`).set('Cookie', cookie).send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we respond with "Product not found"', async () => {
      const text = rsp.text;
      expect(text).toBe('Product not found');

      expect(mockProductsRepo.getOne).toHaveBeenCalledWith(id);

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });

  describe('when: the user wants to retrieve a product to edit but is not signed in', () => {
    let rsp;

    beforeEach(async () => {
      mockProductsRepo.getOne = jest.fn();

      rsp = await request(app).get('/admin/products/1/edit').send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to sign-in page', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOne).toHaveBeenCalledTimes(0);

      const status = rsp.status;
      expect(status).toBe(302);
    });
  });

  describe('when: the user wants to retrieve a product to edit', () => {
    let rsp;

    let id = '1234';

    let product = {
      id: id,
      title: 'product1',
      price: '12.00',
    };

    beforeEach(async () => {
      mockProductsRepo.getOne = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(product);
        });
      });

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app).get(`/admin/products/${id}/edit`).set('Cookie', cookie).send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return a pre-filled form of the product', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOne).toHaveBeenCalledWith(id);

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });
});
