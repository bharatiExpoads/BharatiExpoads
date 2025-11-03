// controllers/adminProfileController.js
const BaseController = require('./baseController');

class AdminProfileController extends BaseController {
  constructor() {
    super('adminProfile');
    console.log('AdminProfileController initialized');
  }
}

module.exports = new AdminProfileController();
