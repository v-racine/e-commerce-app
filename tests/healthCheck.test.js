const request = require('supertest');
const AppFactory = require('../src/app');

describe('/health', () => {
  const mockUsersRepo = {};

  const app = AppFactory({
    usersRepo: mockUsersRepo,
  });

  const testCases = GenerateTestCases();

  testCases.forEach((testCase) => {
    describe(testCase.when, () => {
      let rsp;

      beforeEach(async () => {
        mockUsersRepo.getAll = jest.fn().mockImplementation(testCase.getAllStub);
        rsp = await request(app).get('/health');
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      test(testCase.then, async () => {
        const status = rsp.status;
        expect(status).toBe(testCase.code);

        const body = rsp.body;
        expect(body).toEqual(testCase.want);

        expect(mockUsersRepo.getAll).toHaveBeenCalledTimes(1);
      });
    });
  });
});

function GenerateTestCases() {
  return [
    {
      when: 'when: we cannot retrieve data from the db',
      getAllStub: () => {
        return new Promise((_, reject) => {
          reject(new Error('error retrieving data'));
        });
      },
      then: 'then: we return _unavailable_ json',
      code: 503,
      want: { message: 'unable to retrieve data' },
    },
    {
      when: 'when: we can retrieve data from the db',
      getAllStub: () => {
        return new Promise((resolve) => {
          resolve([]);
        });
      },
      then: 'then: we return _OK_ json',
      code: 200,
      want: { message: { status: 'ok' } },
    },
  ];
}
