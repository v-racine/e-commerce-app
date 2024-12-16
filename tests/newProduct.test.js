const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');

describe('create new product', () => {
  const mockProductsRepo = {};

  const app = AppFactory({
    productsRepo: mockProductsRepo,
  });

  describe('when: the user passes in something that is not a valid product title', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app).post('/admin/products/new').send({ title: 'a', price: '10' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Must be between 5 and 40 characters' html", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();
    });
  });

  describe('when: the user passes in something that is not a float number', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app)
        .post('/admin/products/new')
        .send({ title: 'sweater', price: '   test   ' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Invalid value'", () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();
    });
  });

  describe('when: the user passes in something that is not a product and no price', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app)
        .post('/admin/products/new')
        .send({ title: 'a', price: '   test   ' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return both error messages', () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();
    });
  });

  describe('when: the db already contains that product', () => {
    let rsp;

    beforeEach(async () => {
      mockProductsRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({});
        });
      });

      rsp = await request(app).post('/admin/products/new').send({ title: 'testing', price: '1' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Product already exists'", () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOneBy).toHaveBeenCalledWith({ title: 'testing' });
    });
  });

  describe('when: the db does not contain the product AND the price is a valid float', () => {
    let rsp;
    let id = '1221';

    beforeEach(async () => {
      mockProductsRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(undefined);
        });
      });

      mockProductsRepo.create = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: id });
        });
      });

      rsp = await request(app)
        .post('/admin/products/new')
        .send({ title: 'testing', price: '21.21' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Submitted!'", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOneBy).toHaveBeenCalledWith({ title: 'testing' });
    });
  });
});
