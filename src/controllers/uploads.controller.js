const path = require('path');
const supabase = require('../lib/supabase');

const MODULE_MEDIA_BUCKET = process.env.SUPABASE_MODULE_MEDIA_BUCKET || 'module-media';
const ROBOT_PART_IMAGES_BUCKET =
  process.env.SUPABASE_ROBOT_PART_IMAGES_BUCKET || 'robot-part-images';

function ensureFilePresent(req, res) {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Aucun fichier fourni (champ "file" manquant)' });
    return false;
  }
  return true;
}

function buildFilePath(prefix, originalName) {
  const ext = path.extname(originalName) || '';
  const base = path.basename(originalName, ext);
  const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '_');
  const timestamp = Date.now();
  return `${prefix}/${timestamp}-${safeBase}${ext}`;
}

async function uploadToBucket(bucketName, filePath, buffer, contentType) {
  const { error } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw error;
  }
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

// POST /api/uploads/module-image
async function uploadModuleImage(req, res) {
  if (!ensureFilePresent(req, res)) return;

  const { file } = req;
  if (!file.mimetype.startsWith('image/')) {
    return res.status(400).json({
      success: false,
      message: 'Le fichier doit être une image.',
    });
  }

  try {
    const filePath = buildFilePath('modules/images', file.originalname);
    const url = await uploadToBucket(MODULE_MEDIA_BUCKET, filePath, file.buffer, file.mimetype);

    return res.status(201).json({
      success: true,
      url,
      bucket: MODULE_MEDIA_BUCKET,
      path: filePath,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur upload module image', err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'upload de l’image du module",
    });
  }
}

// POST /api/uploads/module-audio
async function uploadModuleAudio(req, res) {
  if (!ensureFilePresent(req, res)) return;

  const { file } = req;
  if (!file.mimetype.startsWith('audio/')) {
    return res.status(400).json({
      success: false,
      message: 'Le fichier doit être un audio.',
    });
  }

  try {
    const filePath = buildFilePath('modules/audio', file.originalname);
    const url = await uploadToBucket(MODULE_MEDIA_BUCKET, filePath, file.buffer, file.mimetype);

    return res.status(201).json({
      success: true,
      url,
      bucket: MODULE_MEDIA_BUCKET,
      path: filePath,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur upload module audio', err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'upload de l’audio du module",
    });
  }
}

// POST /api/uploads/robot-part-image
async function uploadRobotPartImage(req, res) {
  if (!ensureFilePresent(req, res)) return;

  const { file } = req;
  if (!file.mimetype.startsWith('image/')) {
    return res.status(400).json({
      success: false,
      message: 'Le fichier doit être une image.',
    });
  }

  try {
    const filePath = buildFilePath('robot-parts', file.originalname);
    const url = await uploadToBucket(
      ROBOT_PART_IMAGES_BUCKET,
      filePath,
      file.buffer,
      file.mimetype,
    );

    return res.status(201).json({
      success: true,
      url,
      bucket: ROBOT_PART_IMAGES_BUCKET,
      path: filePath,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur upload robot part image', err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'upload de l’image de robot part",
    });
  }
}

module.exports = {
  uploadModuleImage,
  uploadModuleAudio,
  uploadRobotPartImage,
};

