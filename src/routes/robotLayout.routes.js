const express = require('express');

const { getRobotLayout } = require('../controllers/robotLayout.controller');

const router = express.Router();

router.get('/', getRobotLayout);

module.exports = router;

