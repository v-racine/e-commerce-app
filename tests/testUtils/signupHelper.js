const { PasswordHelper } = require('../../src/utilities/passwordHelper');
const request = require('supertest');

let id = '3424';

let hex =
  'cf5dc7df47b8f0b6655cefb9457816a0ca15c1d32576e62d8c1cc768acc2ffcd1747570339747b02865fb78eaf46919392d1a33e652b67c05cd820d88a43edb8';

let salt = 'f8864ab11acaed11';

async function signupHelper(mockUsersRepo, app) {
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

  const signUpRsp = await request(app)
    .post('/signup')
    .send({ email: 'test3@test.com', password: 'asdf', passwordConfirmation: 'asdf' });

  const cookie = signUpRsp.get('Set-Cookie');

  return cookie;
}

module.exports = { signupHelper };
