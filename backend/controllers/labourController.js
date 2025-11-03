const BaseController = require('./baseController');

class LabourController extends BaseController {
  constructor() {
    super('labour');
  }
}

module.exports = new LabourController();