const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');
const { signupHelper } = require('./testUtils/signupHelper');

describe('edit a product', () => {
  const mockProductsRepo = {};
  const mockUsersRepo = {};

  const app = AppFactory({
    productsRepo: mockProductsRepo,
    usersRepo: mockUsersRepo,
  });

  describe('when: the user wants to delete a product but is not signed in', () => {
    let rsp;

    beforeEach(async () => {
      mockProductsRepo.delete = jest.fn();

      rsp = await request(app).post('/admin/products/1/delete').send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to sign-in page', () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.delete).toHaveBeenCalledTimes(0);

      const status = rsp.status;
      expect(status).toBe(302);
    });
  });

  describe('when: the user tries to delete AND the db throws an error', () => {
    let rsp;

    let id = '1234';

    beforeEach(async () => {
      mockProductsRepo.delete = jest.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          reject(new Error('something went wrong'));
        });
      });

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app).post(`/admin/products/${id}/delete`).set('Cookie', cookie).send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we display an internal server error', () => {
      const text = rsp.text;
      expect(text).toBe('Internal server error');

      expect(mockProductsRepo.delete).toHaveBeenCalledWith(id);

      const status = rsp.status;
      expect(status).toBe(500);
    });
  });

  describe('when: the user successfully deletes an existing product', () => {
    let rsp;

    let id = '1234';

    beforeEach(async () => {
      mockProductsRepo.delete = jest.fn();

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app).post(`/admin/products/${id}/delete`).set('Cookie', cookie).send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we delete the product from the db AND redirect to products page', () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.delete).toHaveBeenCalledWith(id);

      const status = rsp.status;
      expect(status).toBe(302);
    });
  });
});
