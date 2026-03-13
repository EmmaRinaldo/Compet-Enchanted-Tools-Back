const supabase = require('../lib/supabase');

// GET /api/robot-layout
async function getRobotLayout(_req, res) {
  try {
    const [{ data: parts, error: partsError }, { data: variants, error: variantsError }] =
      await Promise.all([
        supabase
          .from('robot_parts')
          .select('id, part_name, position_x, position_y, width, height, z_index')
          .order('part_name', { ascending: true })
          .order('z_index', { ascending: true }),
        supabase
          .from('robot_part_variants')
          .select('id, robot_part_id, color, image_url')
          .order('color', { ascending: true }),
      ]);

    if (partsError) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase GET robot_parts pour /api/robot-layout', partsError);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des parties du robot',
      });
    }

    if (variantsError) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase GET robot_part_variants pour /api/robot-layout', variantsError);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des variantes du robot',
      });
    }

    const variantsByPartId = new Map();
    (variants || []).forEach((v) => {
      const list = variantsByPartId.get(v.robot_part_id) || [];
      list.push({
        id: v.id,
        color: v.color,
        imageUrl: v.image_url,
      });
      variantsByPartId.set(v.robot_part_id, list);
    });

    const payload = (parts || []).map((p) => ({
      id: p.id,
      partName: p.part_name,
      position: {
        x: p.position_x,
        y: p.position_y,
      },
      width: p.width,
      height: p.height,
      zIndex: p.z_index,
      variants: variantsByPartId.get(p.id) || [],
    }));

    return res.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur GET /api/robot-layout', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du layout du robot',
    });
  }
}

module.exports = {
  getRobotLayout,
};

