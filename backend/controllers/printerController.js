const BaseController = require('./baseController');

class PrinterController extends BaseController {
  constructor() {
    super('printer');
  }
}

module.exports = new PrinterController(); 