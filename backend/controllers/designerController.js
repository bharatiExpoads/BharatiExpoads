// controllers/designerController.js
const BaseController = require('./baseController');

class DesignerController extends BaseController {
  constructor() {
    super('designer'); // Prisma model name in lowercase
  }
}

module.exports = new DesignerController();
