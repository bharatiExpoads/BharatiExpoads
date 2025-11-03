const VoucherBaseController = require('./base/voucherBaseController');

class ContraVoucherController extends VoucherBaseController {
  constructor() {
    super('contraVoucher');
  }
}

module.exports = new ContraVoucherController();
