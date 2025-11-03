const VoucherBaseController = require('./base/voucherBaseController');

class JournalVoucherController extends VoucherBaseController {
  constructor() {
    super('journalVoucher');
  }
}

module.exports = new JournalVoucherController();
