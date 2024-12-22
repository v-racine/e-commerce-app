const { ErrEmailNotFound, ErrInvalidPassword } = require('../services/usersService');
const { BaseHandler: BaseHandler } = require('./baseHandler');
const signinTemplate = require('../views/admin/auth/signin');
const { validationResult } = require('express-validator'); //middleware library

class SigninHandler extends BaseHandler {
  constructor(args) {
    super();
    this.usersService = args.usersService;
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
  }

  async get(req, res) {
    res.send(signinTemplate({}));
  }

  async post(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send(signinTemplate({ errors }));
    }

    const { email, password } = req.body;

    let user;

    try {
      user = await this.usersService.signInUser(email, password);
    } catch (err) {
      if (err instanceof ErrEmailNotFound || err instanceof ErrInvalidPassword) {
        return res.send(err.message);
      } else {
        console.log(`failed to sign in user: ${err}`);
        return res.send('Internal server error');
      }
    }

    req.session.userId = user.id;

    // return res.send('You are signed in.');
    return res.redirect('/admin/products');
  }
}

module.exports = { SigninHandler: SigninHandler };
