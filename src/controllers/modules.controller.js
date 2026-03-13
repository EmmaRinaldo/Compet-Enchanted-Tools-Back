const supabase = require('../lib/supabase');

// GET /api/modules
async function getModules(req, res) {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select(
        'id, number, slug, name, description, image_url, video_url, audio_url, game_id, robot_part, position_x, position_y, is_active, display_order, games(type)',
      )
      .order('display_order', { ascending: true })
      .order('number', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase GET /api/modules', error);
      return res
        .status(500)
        .json({ success: false, message: 'Erreur serveur lors de la récupération des modules' });
    }

    const payload = (data || []).map((m) => ({
      id: m.id,
      number: m.number,
      slug: m.slug,
      name: m.name,
      description: m.description,
      imageUrl: m.image_url,
      videoUrl: m.video_url,
      audioUrl: m.audio_url,
      gameId: m.game_id,
      gameType: (m.games && m.games.type) || 'none',
      robotPart: m.robot_part || null,
      position: {
        x: m.position_x,
        y: m.position_y,
      },
      isActive: m.is_active,
      order: m.display_order,
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
      imageUrl,
      videoUrl,
      audioUrl,
      gameId,
      robotPart,
      isActive,
    } = req.body || {};

    const { data: lastModules, error: lastError } = await supabase
      .from('modules')
      .select('number, display_order')
      .order('display_order', { ascending: false })
      .order('number', { ascending: false })
      .limit(1);

    if (lastError) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase lors de la récupération du dernier module', lastError);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création du module',
      });
    }

    const last = (lastModules && lastModules[0]) || null;

    const nextNumber =
      typeof number === 'number' && !Number.isNaN(number)
        ? number
        : (last && typeof last.number === 'number' ? last.number : 0) + 1;

    const { data: createdRows, error: insertError } = await supabase
      .from('modules')
      .insert([
        {
          number: nextNumber,
          slug,
          name,
          description,
          image_url: imageUrl || null,
          video_url: videoUrl || null,
          audio_url: audioUrl || null,
          game_id: gameId || null,
          robot_part: robotPart || null,
          position_x: 50,
          position_y: 50,
          is_active: typeof isActive === 'boolean' ? isActive : true,
          display_order: nextNumber,
        },
      ])
      .select(
        'id, number, slug, name, description, image_url, video_url, audio_url, game_id, robot_part, position_x, position_y, is_active, display_order',
      )
      .single();

    if (insertError) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase lors de la création du module', insertError);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création du module',
      });
    }

    return res.status(201).json({
      id: createdRows.id,
      number: createdRows.number,
      slug: createdRows.slug,
      name: createdRows.name,
      description: createdRows.description,
      imageUrl: createdRows.image_url,
      videoUrl: createdRows.video_url,
      audioUrl: createdRows.audio_url,
      gameId: createdRows.game_id,
      gameType: 'none',
      robotPart: createdRows.robot_part || null,
      position: {
        x: createdRows.position_x,
        y: createdRows.position_y,
      },
      isActive: createdRows.is_active,
      order: createdRows.display_order,
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
    imageUrl,
    videoUrl,
    audioUrl,
    gameId,
    robotPart,
    isActive,
  } = req.body || {};

  const updates = {};

  if (typeof number === 'number') {
    updates.number = number;
    updates.display_order = number;
  }
  if (slug !== undefined) updates.slug = slug;
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (videoUrl !== undefined) updates.video_url = videoUrl;
  if (audioUrl !== undefined) updates.audio_url = audioUrl;
  if (gameId !== undefined) updates.game_id = gameId || null;
  if (robotPart !== undefined) updates.robot_part = robotPart;
  if (typeof isActive === 'boolean') updates.is_active = isActive;

  try {
    const { data: updated, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select(
        'id, number, slug, name, description, image_url, video_url, audio_url, game_id, robot_part, position_x, position_y, is_active, display_order',
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Module non trouvé' });
      }
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase PUT /api/modules/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour du module',
      });
    }

    return res.json({
      id: updated.id,
      number: updated.number,
      slug: updated.slug,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.image_url,
      videoUrl: updated.video_url,
      audioUrl: updated.audio_url,
      gameId: updated.game_id,
      gameType: 'none',
      robotPart: updated.robot_part || null,
      position: {
        x: updated.position_x,
        y: updated.position_y,
      },
      isActive: updated.is_active,
      order: updated.display_order,
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
    const { error } = await supabase.from('modules').delete().eq('id', id);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase DELETE /api/modules/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression du module',
      });
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

      const { error } = await supabase
        .from('modules')
        .update({
          position_x: clampedX,
          position_y: clampedY,
        })
        .eq('id', id);

      if (!error) {
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

      await supabase
        .from('modules')
        .update({
          number,
          display_order: number,
        })
        .eq('id', id);
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

