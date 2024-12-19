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

  describe('when: the user wants to edit the product but is not signed in', () => {
    let rsp;

    beforeEach(async () => {
      mockProductsRepo.update = jest.fn();

      rsp = await request(app).post('/admin/products/1/edit').send();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to sign-in page', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.update).toHaveBeenCalledTimes(0);

      const status = rsp.status;
      expect(status).toBe(302);
    });
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

      mockProductsRepo.update = jest.fn();

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post(`/admin/products/${id}/edit`)
        .set('Cookie', cookie)
        .field('title', 'newTitle')
        .field('price', '13');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we respond with "Could not find item"', async () => {
      const text = rsp.text;
      expect(text).toBe('Product not found');

      expect(mockProductsRepo.getOne).toHaveBeenCalledWith(id);

      expect(mockProductsRepo.update).toHaveBeenCalledTimes(0);

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });

  describe('when: the user successfully updates an existing product', () => {
    let rsp;

    let id = '1234';

    let product = {
      id: id,
      title: 'new product',
      price: 13,
    };

    beforeEach(async () => {
      mockProductsRepo.getOne = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: id, title: 'old product', price: 12 });
        });
      });

      mockProductsRepo.update = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(undefined);
        });
      });

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post(`/admin/products/${id}/edit`)
        .set('Cookie', cookie)
        .field('title', product.title)
        .field('price', product.price.toString());
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we update the product in the db AND redirect to products page', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOne).toHaveBeenCalledWith(id);

      expect(mockProductsRepo.update).toHaveBeenCalledWith(id, product);

      const status = rsp.status;
      expect(status).toBe(302);
    });
  });
});
