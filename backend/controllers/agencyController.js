const BaseController = require('./baseController');

class AgencyController extends BaseController {
  constructor() {
    super('agency');
  }
}

module.exports = new AgencyController();