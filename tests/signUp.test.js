const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');
const { PasswordHelper } = require('../src/utilities/passwordHelper');

describe('sign up', () => {
  const mockUsersRepo = {};

  const app = AppFactory({
    usersRepo: mockUsersRepo,
  });

  describe('when: the user passes in something that is not an email for email', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app)
        .post('/signup')
        .send({ email: 'asdf', password: 'asdf', passwordConfirmation: 'asdf' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Must be a valid email' html", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();
    });
  });

  describe('when: the user passes in an empty string after trim for a password and password confirmation', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app)
        .post('/signup')
        .send({ email: 'testing@testing.com', password: '   ', passwordConfirmation: '   ' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return "Must be between 4 and 20 characters"', async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();
    });
  });

  describe('when: the user passes in a password + confirmation combination, each of which are longer than 20 chars', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app).post('/signup').send({
        email: 'testing@testing.com',
        password: 'abcdefghijklmnopqrstuvwxyz',
        passwordConfirmation: 'abcdefghijklmnopqrstuvwxyz',
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return "then: we return "Must be between 4 and 20 characters"', () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();
    });
  });

  describe('when: the user passes in something that is not an email and no password', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app)
        .post('/signup')
        .send({ email: 'asdf', password: '', passwordConfirmation: '' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return html with all of the parsing errors', async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toMatchSnapshot();
    });
  });

  describe('when: the db already contains a user with that email', () => {
    let rsp;

    beforeEach(async () => {
      mockUsersRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({});
        });
      });

      rsp = await request(app)
        .post('/signup')
        .send({ email: 'test1@test.com', password: 'asdf', passwordConfirmation: 'asdf' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return a 'Email in use'", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toBe('Email in use');

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'test1@test.com' });
    });
  });

  describe('when: the passwords do not match', () => {
    let rsp;

    beforeEach(async () => {
      mockUsersRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          // is this what is returned when there is no user no matter the repo implementation?
          resolve(undefined);
        });
      });

      rsp = await request(app)
        .post('/signup')
        .send({ email: 'test2@test.com', password: 'asdf', passwordConfirmation: 'asdff' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'Password must match'", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toBe('Password must match');

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'test2@test.com' });
    });
  });

  describe('when: the db does not contain the user and the passwords match', () => {
    let rsp;

    let id = '3424';

    let hex =
      'cf5dc7df47b8f0b6655cefb9457816a0ca15c1d32576e62d8c1cc768acc2ffcd1747570339747b02865fb78eaf46919392d1a33e652b67c05cd820d88a43edb8';

    let salt = 'f8864ab11acaed11';

    beforeEach(async () => {
      PasswordHelper.HexAndSalt = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ hex: hex, salt: salt });
        });
      });

      mockUsersRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(undefined);
        });
      });

      mockUsersRepo.create = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ id: id });
        });
      });

      rsp = await request(app)
        .post('/signup')
        .send({ email: 'test3@test.com', password: 'asdf', passwordConfirmation: 'asdf' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to list of products', async () => {
      const status = rsp.status;
      expect(status).toBe(302);

      const text = rsp.text;
      expect(text).toBe('Found. Redirecting to /admin/products');

      expect(rsp.get('Set-Cookie').length).not.toBe(0);

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'test3@test.com' });
      expect(mockUsersRepo.create).toHaveBeenCalledWith({
        email: 'test3@test.com',
        password: `${hex}.${salt}`,
      });
    });
  });
});
