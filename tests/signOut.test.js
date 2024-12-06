const { Config } = require('../src/config/config');

Config.Get(process.env);

const AppFactory = require('../src/app');
const request = require('supertest');

describe('sign out', () => {
  const mockUsersRepo = {};

  const app = AppFactory({
    usersRepo: mockUsersRepo,
  });

  describe('when: user signs out', () => {
    let signUpResponse;
    let signOutResponse;

    let id = '4534';

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

      signUpResponse = await request(app)
        .post('/signup')
        .send({ email: 'test4@test.com', password: 'testing', passwordConfirmation: 'testing' });

      signOutResponse = await request(app).get('/signout');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("then: we expect a 200 and the cookie to be cleared and to send back 'You are logged out.'", async () => {
      expect(signUpResponse.get('Set-Cookie').length).not.toBe(0);

      const status = signOutResponse.status;
      expect(status).toBe(200);

      const text = signOutResponse.text;
      expect(text).toBe('You are logged out.');

      expect(signOutResponse.get('Set-Cookie')[0]).toBe(
        'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
      );
    });
  });
});
