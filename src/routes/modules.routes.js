const express = require('express');
const {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  updateModulesLayout,
  updateModulesOrder,
} = require('../controllers/modules.controller');

const router = express.Router();

// GET /api/modules
router.get('/', getModules);

// PUT /api/modules/layout
router.put('/layout', updateModulesLayout);

// PUT /api/modules/order
router.put('/order', updateModulesOrder);

// POST /api/modules
router.post('/', createModule);

// PUT /api/modules/:id
router.put('/:id', updateModule);

// DELETE /api/modules/:id
router.delete('/:id', deleteModule);

module.exports = router;

