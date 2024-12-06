const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');

describe('sign up', () => {
  const mockUsersRepo = {};

  const app = AppFactory({
    usersRepo: mockUsersRepo,
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

    beforeEach(async () => {
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

    test("then: we return 'User id created!!!'", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toBe(`User ${id} created!!!`);

      expect(rsp.get('Set-Cookie').length).not.toBe(0);

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'test3@test.com' });
    });
  });
});
