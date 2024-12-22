const { ErrEmailInUse, ErrPasswordMisMatch } = require('../services/usersService');
const { BaseHandler: BaseHandler } = require('./baseHandler');
const signupTemplate = require('../views/admin/auth/signup');
const { validationResult } = require('express-validator'); //middleware library

class SignupHandler extends BaseHandler {
  /**
   * constructor expects the following
   * - usersService: instance of usersService
   * @param {*} args
   */
  constructor(args) {
    super();
    this.usersService = args.usersService;
    this.post = this.post.bind(this);
    this.get = this.get.bind(this);
  }

  async get(req, res) {
    res.send(signupTemplate({ req }));
  }

  async post(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send(signupTemplate({ req, errors }));
    }

    const { email, password, passwordConfirmation } = req.body;

    let user;

    try {
      user = await this.usersService.createUser(email, password, passwordConfirmation);
    } catch (err) {
      if (err instanceof ErrEmailInUse || err instanceof ErrPasswordMisMatch) {
        return res.send(err.message);
      } else {
        console.log(`failed to create a user: ${err}`);
        return res.send('Internal server error');
      }
    }

    req.session.userId = user.id;

    // return res.send(`User ${user.id} created!!!`);
    return res.redirect('/admin/products');
  }
}

module.exports = { SignupHandler: SignupHandler };
