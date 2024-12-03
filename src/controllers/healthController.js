const BaseController = require('./baseController');

class HealthController extends BaseController {
  constructor(args) {
    super();
    this.healthService = args.healthService;
  }

  async execute(_, res) {
    const rsp = await this.healthService.canRetrieveData();

    return rsp === true
      ? this.ok(res, {
          status: 'ok',
        })
      : this.unavailable(res, 'unable to retreieve data');
  }
}

module.exports = HealthController;
