const VoucherBaseController = require('./base/voucherBaseController');

class DebitNoteController extends VoucherBaseController {
  constructor() {
    super('debitNote');
  }
}

module.exports = new DebitNoteController();
