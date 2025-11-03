const BaseController = require('./baseController');

class CreditorController extends BaseController {
  constructor() {
    super('creditor');
  }
}

module.exports = new CreditorController();