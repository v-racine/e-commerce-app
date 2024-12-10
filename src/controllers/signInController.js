const { ErrEmailNotFound, ErrInvalidPassword } = require('../services/usersService');
const { BaseController } = require('./baseController');

class SignInController extends BaseController {
  constructor(args) {
    super();
    this.usersService = args.usersService;
  }

  async execute(req, res) {
    const { email, password } = req.body;

    let user;

    try {
      user = await this.usersService.signInUser(email, password);
    } catch (err) {
      if (err instanceof ErrEmailNotFound || err instanceof ErrInvalidPassword) {
        return res.send(err.message);
      } else {
        console.log(`failed to sign in user: ${JSON.stringify(err)}`);
        return res.send('Internal server error');
      }
    }

    req.session.userId = user.id;

    return res.send('You are signed in.');
  }
}

module.exports = { SignInController };
