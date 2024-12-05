const { ErrEmailInUse, ErrPasswordMisMatch } = require('../services/usersService');
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

    let user;

    try {
      user = await this.usersService.createUser(email, password, passwordConfirmation);
    } catch (err) {
      if (err instanceof ErrEmailInUse || err instanceof ErrPasswordMisMatch) {
        return res.send(err.message);
      } else {
        console.log(`failed to create a user: ${JSON.stringify(err)}`);
        return res.send('Internal server error');
      }
    }

    // TODO: Store the id of that user inside the users cookie (in the controller layer)
    req.session.userId = user.id;

    return res.send(`User ${user.id} created!!!`);
  }
}

module.exports = CreateUserController;
