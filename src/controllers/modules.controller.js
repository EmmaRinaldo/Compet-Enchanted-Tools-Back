const Module = require('../models/Module');

// GET /api/modules
async function getModules(req, res) {
  try {
    const modules = await Module.find({})
      .sort({ order: 1, number: 1 })
      .lean();

    const payload = modules.map((m) => ({
      id: m._id.toString(),
      number: m.number,
      slug: m.slug,
      name: m.name,
      description: m.description,
      videoUrl: m.videoUrl,
      gameType: m.gameType,
      robotPart: m.robotPart || null,
      position: m.position,
      isActive: m.isActive,
      order: m.order,
    }));

    res.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur GET /api/modules', err);
    res
      .status(500)
      .json({ success: false, message: 'Erreur serveur lors de la récupération des modules' });
  }
}

// POST /api/modules
async function createModule(req, res) {
  try {
    const {
      number,
      slug,
      name,
      description,
      videoUrl,
      gameType,
      gameConfig,
      robotPart,
      isActive,
    } = req.body || {};

    const last = await Module.findOne({})
      .sort({ order: -1, number: -1 })
      .lean();

    const nextNumber =
      typeof number === 'number' && !Number.isNaN(number)
        ? number
        : (last && typeof last.number === 'number' ? last.number : 0) + 1;

    const module = await Module.create({
      number: nextNumber,
      slug,
      name,
      description,
      videoUrl,
      gameType: gameType || 'none',
      gameConfig: gameConfig || {},
      robotPart: robotPart || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      // Position par défaut au centre pour rester compatible avec le layout editor (MVP)
      position: {
        x: 50,
        y: 50,
      },
      order: nextNumber,
    });

    return res.status(201).json({
      id: module._id.toString(),
      number: module.number,
      slug: module.slug,
      name: module.name,
      description: module.description,
      videoUrl: module.videoUrl,
      gameType: module.gameType,
      robotPart: module.robotPart || null,
      position: module.position,
      isActive: module.isActive,
      order: module.order,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur POST /api/modules', err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation des champs du module invalide',
        details: err.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du module',
    });
  }
}

// PUT /api/modules/:id
async function updateModule(req, res) {
  const { id } = req.params;
  const {
    number,
    slug,
    name,
    description,
    videoUrl,
    gameType,
    gameConfig,
    robotPart,
    isActive,
  } = req.body || {};

  const updates = {};

  if (typeof number === 'number') {
    updates.number = number;
    updates.order = number;
  }
  if (slug !== undefined) updates.slug = slug;
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (videoUrl !== undefined) updates.videoUrl = videoUrl;
  if (gameType !== undefined) updates.gameType = gameType;
  if (gameConfig !== undefined) updates.gameConfig = gameConfig;
  if (robotPart !== undefined) updates.robotPart = robotPart;
  if (typeof isActive === 'boolean') updates.isActive = isActive;

  try {
    const updated = await Module.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Module non trouvé' });
    }

    return res.json({
      id: updated._id.toString(),
      number: updated.number,
      slug: updated.slug,
      name: updated.name,
      description: updated.description,
      videoUrl: updated.videoUrl,
      gameType: updated.gameType,
      robotPart: updated.robotPart || null,
      position: updated.position,
      isActive: updated.isActive,
      order: updated.order,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur PUT /api/modules/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du module',
    });
  }
}

// DELETE /api/modules/:id
async function deleteModule(req, res) {
  const { id } = req.params;

  try {
    const deleted = await Module.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Module non trouvé' });
    }

    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur DELETE /api/modules/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du module',
    });
  }
}

// PUT /api/modules/layout
async function updateModulesLayout(req, res) {
  const { layout } = req.body || {};

  if (!Array.isArray(layout)) {
    return res
      .status(400)
      .json({ success: false, message: 'Le champ "layout" doit être un tableau' });
  }

  let updatedCount = 0;

  try {
    // On applique les mises à jour en série simple pour garder le code lisible (MVP)
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of layout) {
      const { id, x, y } = entry || {};

      if (!id || typeof x !== 'number' || typeof y !== 'number') {
        // On ignore silencieusement les entrées invalides
        // eslint-disable-next-line no-continue
        continue;
      }

      // Clamp simple 0–100 pour rester dans la zone de travail
      const clampedX = Math.min(100, Math.max(0, x));
      const clampedY = Math.min(100, Math.max(0, y));

      const result = await Module.findByIdAndUpdate(
        id,
        {
          'position.x': clampedX,
          'position.y': clampedY,
        },
        { new: false },
      );

      if (result) {
        updatedCount += 1;
      }
    }

    return res.json({
      success: true,
      updatedCount,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur PUT /api/modules/layout', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du layout',
    });
  }
}

// PUT /api/modules/order
async function updateModulesOrder(req, res) {
  const { order } = req.body || {};

  if (!Array.isArray(order)) {
    return res
      .status(400)
      .json({ success: false, message: 'Le champ "order" doit être un tableau' });
  }

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of order) {
      const { id, number } = entry || {};

      if (!id || typeof number !== 'number') {
        // eslint-disable-next-line no-continue
        continue;
      }

      await Module.findByIdAndUpdate(
        id,
        {
          number,
          order: number,
        },
        { new: false },
      );
    }

    return res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur PUT /api/modules/order', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l’ordre des modules',
    });
  }
}

module.exports = {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  updateModulesLayout,
  updateModulesOrder,
};

