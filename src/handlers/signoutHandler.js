const { BaseHandler } = require('./baseHandler');

class SignoutHandler extends BaseHandler {
  constructor(args) {
    super();

    this.get = this.get.bind(this);
  }

  async get(req, res) {
    req.session = null;
    res.send('You are logged out.');
    //res.redirect('/signup');
  }
}

module.exports = {
  SignoutHandler,
};
