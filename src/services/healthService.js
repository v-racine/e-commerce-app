class HealthService {
  constructor(args) {
    this.usersRepo = args.usersRepo;
  }

  async canRetrieveData() {
    try {
      await this.usersRepo.getAll();

      return true;
    } catch (err) {
      console.log(`failed to connect to db: ${err.message}`);

      return false;
    }
  }
}

module.exports = { HealthService };
