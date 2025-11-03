const VoucherBaseController = require('./base/voucherBaseController');

class ReceiptVoucherController extends VoucherBaseController {
  constructor() {
    super('receiptVoucher');
  }
}

module.exports = new ReceiptVoucherController();
