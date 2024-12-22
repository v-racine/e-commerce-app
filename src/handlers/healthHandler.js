const { BaseHandler: BaseHandler } = require('./baseHandler');

class HealthHandler extends BaseHandler {
  constructor(args) {
    super();
    this.healthService = args.healthService;
    this.get = this.get.bind(this);
  }

  async get(_, res) {
    const rsp = await this.healthService.canRetrieveData();

    return rsp === true
      ? this.ok(res, {
          status: 'ok',
        })
      : this.unavailable(res, 'unable to retrieve data');
  }
}

module.exports = { HealthHandler: HealthHandler };
