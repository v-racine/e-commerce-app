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
      return 'Email in use';
    }

    if (password !== passwordConfirmation) {
      return 'Password must match';
    }

    // TODO: actually create the entry with this.usersRepo

    return 'Account created!!!';
  }
}

module.exports = UsersService;
