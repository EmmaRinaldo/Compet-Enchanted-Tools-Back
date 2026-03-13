const express = require('express');

const {
  getRobotParts,
  createRobotPart,
  updateRobotPart,
  deleteRobotPart,
} = require('../controllers/robotParts.controller');

const router = express.Router();

router.get('/', getRobotParts);
router.post('/', createRobotPart);
router.put('/:id', updateRobotPart);
router.delete('/:id', deleteRobotPart);

module.exports = router;

