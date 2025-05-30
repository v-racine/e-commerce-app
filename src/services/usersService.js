const { PasswordHelper } = require('../utilities/passwordHelper');

class ErrEmailInUse extends Error {
  constructor() {
    super('Email in use');
  }
}

class ErrPasswordMisMatch extends Error {
  constructor() {
    super('Password must match');
  }
}

class ErrEmailNotFound extends Error {
  constructor() {
    super('Email not found');
  }
}

class ErrInvalidPassword extends Error {
  constructor() {
    super('Invalid password');
  }
}

class UsersService {
  /**
   * UsersService args expects the following
   * - usersRepo: instance of UsersRepo
   * @param {*} args
   */
  constructor(args) {
    this.usersRepo = args.usersRepo;
  }

  /**
   * createUser checks whether there is an entry with the supplied email.
   * if there is, then it returns an "Email in use".
   * if not but the passwords do not match, then it returns "Password must match".
   * otherwise, it creates the account and sends back "Account created!!!"
   * @param {*} email
   * @param {*} password
   * @param {*} passwordConfirmation
   * @returns
   */
  async createUser(email, password, passwordConfirmation) {
    const existingUser = await this.usersRepo.getOneBy({ email });
    if (existingUser) {
      throw new ErrEmailInUse();
    }

    if (password !== passwordConfirmation) {
      throw new ErrPasswordMisMatch();
    }

    const { hex, salt } = await PasswordHelper.HexAndSalt(password);

    const user = await this.usersRepo.create({
      email,
      password: `${hex}.${salt}`,
    });

    return user;
  }

  /**
   * signInUser checks if user's email exists and, if so, checks if password entered
   * matches password stored in db, and then returns that user
   * @param {string} email
   * @param {string} password
   * @returns {{id: string, email: string, password: string}} user
   */
  async signInUser(email, password) {
    const user = await this.usersRepo.getOneBy({ email });
    if (!user) {
      throw new ErrEmailNotFound();
    }

    const validPassword = await PasswordHelper.ComparePasswords(user.password, password);
    if (!validPassword) {
      throw new ErrInvalidPassword();
    }

    return user;
  }
}

module.exports = {
  UsersService,
  ErrEmailInUse,
  ErrPasswordMisMatch,
  ErrEmailNotFound,
  ErrInvalidPassword,
};
