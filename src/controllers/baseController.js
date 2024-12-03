class BaseController {
  ok(res, data) {
    return this.jsonResponse(res, 200, data);
  }

  unavailable(res, msg) {
    return this.jsonResponse(res, 503, msg);
  }

  jsonResponse(res, code, msg) {
    res.type('application/json');
    return res.status(code).json({ message: msg });
  }
}

module.exports = BaseController;
