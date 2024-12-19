const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');
const { signupHelper } = require('./testUtils/signupHelper');

const testImageToBase64 =
  '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';

describe('create new product', () => {
  const mockProductsRepo = {};
  const mockUsersRepo = {};

  const app = AppFactory({
    productsRepo: mockProductsRepo,
    usersRepo: mockUsersRepo,
  });

  describe('when: the user passes in something that is not a valid product title', () => {
    let rsp;

    beforeEach(async () => {
      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post('/admin/products/new')
        .set('Cookie', cookie)
        .send({ title: 'a', price: '10' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Must be between 5 and 40 characters' html", async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });

  describe('when: the user passes in something that is not a float number', () => {
    let rsp;

    beforeEach(async () => {
      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post('/admin/products/new')
        .set('Cookie', cookie)
        .send({ title: 'sweater', price: '   test   ' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Invalid value'", () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });

  describe('when: the user passes in something that is not a product and no price', () => {
    let rsp;

    beforeEach(async () => {
      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post('/admin/products/new')
        .set('Cookie', cookie)
        .send({ title: 'a', price: '   test   ' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return both error messages', () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });

  describe('when: the user passes in a title and a valid price but no image', () => {
    let rsp;

    beforeEach(async () => {
      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post('/admin/products/new')
        .set('Cookie', cookie)
        .send({ title: 'a new product', price: '21.21', image: undefined });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return "Please upload an image"', () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      const status = rsp.status;
      expect(status).toBe(200);
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

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post('/admin/products/new')
        .set('Cookie', cookie)
        .field('title', 'testing')
        .field('price', '1')
        .attach('image', `${__dirname}/images/image.png`);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Product already exists'", () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOneBy).toHaveBeenCalledWith({ title: 'testing' });

      const status = rsp.status;
      expect(status).toBe(200);
    });
  });

  describe('when: the db does not contain the product AND the price is a valid float BUT the user is not signed in', () => {
    let rsp;

    beforeEach(async () => {
      mockProductsRepo.getOneBy = jest.fn();

      mockProductsRepo.create = jest.fn();

      rsp = await request(app)
        .post('/admin/products/new')
        .set('Connection', 'Keep-Alive')
        .field('title', 'testing')
        .field('price', '21.21')
        .attach('image', `${__dirname}/images/image.png`);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to signin page', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOneBy).toHaveBeenCalledTimes(0);
      expect(mockProductsRepo.create).toHaveBeenCalledTimes(0);

      const status = rsp.status;
      expect(status).toBe(302);
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

      const cookie = await signupHelper(mockUsersRepo, app);

      rsp = await request(app)
        .post('/admin/products/new')
        .set('Cookie', cookie)
        .field('title', 'testing')
        .field('price', '21.21')
        .attach('image', `${__dirname}/images/image.png`);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to products list', async () => {
      const text = rsp.text;
      expect(text).toMatchSnapshot();

      expect(mockProductsRepo.getOneBy).toHaveBeenCalledWith({ title: 'testing' });
      expect(mockProductsRepo.create).toHaveBeenCalledWith({
        title: 'testing',
        price: 21.21,
        image: testImageToBase64,
      });

      const status = rsp.status;
      expect(status).toBe(302);
    });
  });
});
