const VoucherBaseController = require('./base/voucherBaseController');

class PaymentVoucherController extends VoucherBaseController {
  constructor() {
    super('paymentVoucher');
  }
}

module.exports = new PaymentVoucherController();
