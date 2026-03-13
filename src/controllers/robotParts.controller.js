const supabase = require('../lib/supabase');

// GET /api/robot-parts
async function getRobotParts(_req, res) {
  try {
    const { data, error } = await supabase
      .from('robot_parts')
      .select(
        'id, part_name, position_x, position_y, width, height, z_index, created_at, updated_at',
      )
      .order('part_name', { ascending: true })
      .order('z_index', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase GET /api/robot-parts', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des robot parts',
      });
    }

    const payload = (data || []).map((p) => ({
      id: p.id,
      partName: p.part_name,
      position: {
        x: p.position_x,
        y: p.position_y,
      },
      width: p.width,
      height: p.height,
      zIndex: p.z_index,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return res.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur GET /api/robot-parts', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des robot parts',
    });
  }
}

// POST /api/robot-parts
async function createRobotPart(req, res) {
  const { partName, position, width, height, zIndex } = req.body || {};

  if (!partName || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'partName et position.x/position.y sont obligatoires',
    });
  }

  if (typeof width !== 'number' || typeof height !== 'number' || typeof zIndex !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'width, height et zIndex doivent être des nombres',
    });
  }

  try {
    const { data, error } = await supabase
      .from('robot_parts')
      .insert([
        {
          part_name: partName,
          position_x: position.x,
          position_y: position.y,
          width,
          height,
          z_index: zIndex,
        },
      ])
      .select(
        'id, part_name, position_x, position_y, width, height, z_index, created_at, updated_at',
      )
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase POST /api/robot-parts', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de la robot part',
      });
    }

    return res.status(201).json({
      id: data.id,
      partName: data.part_name,
      position: {
        x: data.position_x,
        y: data.position_y,
      },
      width: data.width,
      height: data.height,
      zIndex: data.z_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur POST /api/robot-parts', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la robot part',
    });
  }
}

// PUT /api/robot-parts/:id
async function updateRobotPart(req, res) {
  const { id } = req.params;
  const { partName, position, width, height, zIndex } = req.body || {};

  const updates = {};
  if (partName !== undefined) updates.part_name = partName;
  if (position && typeof position.x === 'number' && typeof position.y === 'number') {
    updates.position_x = position.x;
    updates.position_y = position.y;
  }
  if (typeof width === 'number') updates.width = width;
  if (typeof height === 'number') updates.height = height;
  if (typeof zIndex === 'number') updates.z_index = zIndex;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aucun champ valide à mettre à jour',
    });
  }

  try {
    const { data, error } = await supabase
      .from('robot_parts')
      .update(updates)
      .eq('id', id)
      .select(
        'id, part_name, position_x, position_y, width, height, z_index, created_at, updated_at',
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Robot part non trouvée' });
      }
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase PUT /api/robot-parts/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour de la robot part',
      });
    }

    return res.json({
      id: data.id,
      partName: data.part_name,
      position: {
        x: data.position_x,
        y: data.position_y,
      },
      width: data.width,
      height: data.height,
      zIndex: data.z_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur PUT /api/robot-parts/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la robot part',
    });
  }
}

// DELETE /api/robot-parts/:id
async function deleteRobotPart(req, res) {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('robot_parts').delete().eq('id', id);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase DELETE /api/robot-parts/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression de la robot part',
      });
    }

    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur DELETE /api/robot-parts/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la robot part',
    });
  }
}

module.exports = {
  getRobotParts,
  createRobotPart,
  updateRobotPart,
  deleteRobotPart,
};

