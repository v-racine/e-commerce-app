const BaseController = require('./baseController');

class CreateUserController extends BaseController {
  /**
   * constructor expects the following
   * - usersService: instance of usersService
   * @param {*} args
   */
  constructor(args) {
    super();
    this.usersService = args.usersService;
  }

  async execute(req, res) {
    const { email, password, passwordConfirmation } = req.body;

    // TODO: validation?

    // TODO: error handling?

    const result = await this.usersService.createUser(email, password, passwordConfirmation);

    return res.send(result);
  }
}
