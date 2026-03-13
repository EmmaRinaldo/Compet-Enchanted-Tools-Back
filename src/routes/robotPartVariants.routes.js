const express = require('express');

const {
  getRobotPartVariants,
  createRobotPartVariant,
  updateRobotPartVariant,
  deleteRobotPartVariant,
} = require('../controllers/robotPartVariants.controller');

const router = express.Router();

router.get('/', getRobotPartVariants);
router.post('/', createRobotPartVariant);
router.put('/:id', updateRobotPartVariant);
router.delete('/:id', deleteRobotPartVariant);

module.exports = router;

