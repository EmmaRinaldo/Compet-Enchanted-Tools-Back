const express = require('express');
const multer = require('multer');

const {
  uploadModuleImage,
  uploadModuleAudio,
  uploadRobotPartImage,
} = require('../controllers/uploads.controller');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 Mo
  },
});

router.post('/module-image', upload.single('file'), uploadModuleImage);
router.post('/module-audio', upload.single('file'), uploadModuleAudio);
// Alias pour la compatibilité avec l'admin: robot-part-image / robot-part-variant-image
router.post('/robot-part-image', upload.single('file'), uploadRobotPartImage);
router.post('/robot-part-variant-image', upload.single('file'), uploadRobotPartImage);

module.exports = router;

