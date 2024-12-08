const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');

describe('sign in', () => {
  const mockUsersRepo = {};

  const app = AppFactory({
    usersRepo: mockUsersRepo,
  });

  describe('when: the db does not already contain that email', () => {
    let rsp;

    beforeEach(async () => {
      mockUsersRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(undefined);
        });
      });

      rsp = await request(app).post('/signin').send({ email: 'testing1@test.com' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return a 'Email not found'", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toBe('Email not found');

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'testing1@test.com' });
    });
  });

  describe('when: the passwords do not match', () => {
    let rsp;

    beforeEach(async () => {
      mockUsersRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ email: 'testing2@test.com', password: 'testing3' });
        });
      });

      rsp = await request(app)
        .post('/signin')
        .send({ email: 'testing2@test.com', password: 'testing2' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return "Password must match"', async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toBe('Invalid password');

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'testing2@test.com' });
    });
  });

  describe('when: the db contains the email and the passwords match', () => {
    let rsp;

    beforeEach(async () => {
      mockUsersRepo.getOneBy = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ email: 'testing5@test.com', password: 'testing5' });
        });
      });

      rsp = await request(app)
        .post('/signin')
        .send({ email: 'testing5@test.com', password: 'testing5' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we return 'You are signed in.'", async () => {
      const status = rsp.status;
      expect(status).toBe(200);

      const text = rsp.text;
      expect(text).toBe('You are signed in.');

      expect(rsp.get('Set-Cookie').length).not.toBe(0);

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'testing5@test.com' });
    });
  });
});
