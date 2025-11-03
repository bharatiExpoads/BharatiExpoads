const BaseController = require('./baseController');

class ClientController extends BaseController {
  constructor() {
    super('client');
  }
}

module.exports = new ClientController();