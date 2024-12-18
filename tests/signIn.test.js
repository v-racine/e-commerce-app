const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');

describe('sign in', () => {
  const mockUsersRepo = {};

  const app = AppFactory({
    usersRepo: mockUsersRepo,
  });

  describe('when: the user passes in something that is not an email for email', () => {
    let rsp;

    beforeEach(async () => {
      rsp = await request(app).post('/signin').send({ email: 'asdf', password: 'testing' });
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
          resolve({
            email: 'testing2@test.com',
            password:
              'c39c38f8856779b2271931a7bf0b9b9002f452a8450b81e54e12a77e9025653e401ec28c4839bcfba384d90a94f13caf4fa8f52104cf72fd04f0dec2272c1330.9a4dfb72bbf1f3ef',
          });
        });
      });

      rsp = await request(app)
        .post('/signin')
        .send({ email: 'testing2@test.com', password: 'testing2' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we return "Invalid password"', async () => {
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
          resolve({
            email: 'testing5@test.com',
            password:
              'c39c38f8856779b2271931a7bf0b9b9002f452a8450b81e54e12a77e9025653e401ec28c4839bcfba384d90a94f13caf4fa8f52104cf72fd04f0dec2272c1330.9a4dfb72bbf1f3ef',
          });
        });
      });

      rsp = await request(app)
        .post('/signin')
        .send({ email: 'testing5@test.com', password: 'papillon' });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('then: we redirect to products list', async () => {
      const status = rsp.status;
      expect(status).toBe(302);

      const text = rsp.text;
      expect(text).toBe('Found. Redirecting to /admin/products');

      expect(rsp.get('Set-Cookie').length).not.toBe(0);

      expect(mockUsersRepo.getOneBy).toHaveBeenCalledWith({ email: 'testing5@test.com' });
    });
  });
});
