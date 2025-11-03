const VoucherBaseController = require('./base/voucherBaseController');

class CreditNoteController extends VoucherBaseController {
  constructor() {
    super('creditNote');
  }
}

module.exports = new CreditNoteController();
