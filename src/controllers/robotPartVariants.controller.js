const supabase = require('../lib/supabase');

// GET /api/robot-part-variants
async function getRobotPartVariants(_req, res) {
  try {
    const { data, error } = await supabase
      .from('robot_part_variants')
      .select('id, robot_part_id, color, image_url, created_at, updated_at')
      .order('color', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase GET /api/robot-part-variants', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des variantes de robot parts',
      });
    }

    const payload = (data || []).map((v) => ({
      id: v.id,
      robotPartId: v.robot_part_id,
      color: v.color,
      imageUrl: v.image_url,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }));

    return res.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur GET /api/robot-part-variants', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des variantes de robot parts',
    });
  }
}

// POST /api/robot-part-variants
async function createRobotPartVariant(req, res) {
  const { robotPartId, color, imageUrl } = req.body || {};

  if (!robotPartId || !color || !imageUrl) {
    return res.status(400).json({
      success: false,
      message: 'robotPartId, color et imageUrl sont obligatoires',
    });
  }

  try {
    const { data, error } = await supabase
      .from('robot_part_variants')
      .insert([
        {
          robot_part_id: robotPartId,
          color,
          image_url: imageUrl,
        },
      ])
      .select('id, robot_part_id, color, image_url, created_at, updated_at')
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase POST /api/robot-part-variants', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de la variante',
      });
    }

    return res.status(201).json({
      id: data.id,
      robotPartId: data.robot_part_id,
      color: data.color,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur POST /api/robot-part-variants', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la variante',
    });
  }
}

// PUT /api/robot-part-variants/:id
async function updateRobotPartVariant(req, res) {
  const { id } = req.params;
  const { robotPartId, color, imageUrl } = req.body || {};

  const updates = {};
  if (robotPartId !== undefined) updates.robot_part_id = robotPartId;
  if (color !== undefined) updates.color = color;
  if (imageUrl !== undefined) updates.image_url = imageUrl;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aucun champ valide à mettre à jour',
    });
  }

  try {
    const { data, error } = await supabase
      .from('robot_part_variants')
      .update(updates)
      .eq('id', id)
      .select('id, robot_part_id, color, image_url, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Variante non trouvée' });
      }
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase PUT /api/robot-part-variants/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour de la variante',
      });
    }

    return res.json({
      id: data.id,
      robotPartId: data.robot_part_id,
      color: data.color,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur PUT /api/robot-part-variants/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la variante',
    });
  }
}

// DELETE /api/robot-part-variants/:id
async function deleteRobotPartVariant(req, res) {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('robot_part_variants').delete().eq('id', id);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase DELETE /api/robot-part-variants/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression de la variante',
      });
    }

    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur DELETE /api/robot-part-variants/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la variante',
    });
  }
}

module.exports = {
  getRobotPartVariants,
  createRobotPartVariant,
  updateRobotPartVariant,
  deleteRobotPartVariant,
};

