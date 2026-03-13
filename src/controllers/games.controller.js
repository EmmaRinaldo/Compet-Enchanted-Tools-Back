const supabase = require('../lib/supabase');

const ALLOWED_GAME_TYPES = ['quiz', 'memory', 'puzzle', 'none'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// GET /api/games
async function getGames(_req, res) {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('id, name, type, config, extra_info, created_at, updated_at')
      .order('created_at', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase GET /api/games', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des jeux',
      });
    }

    const payload = (data || []).map((g) => ({
      id: g.id,
      name: g.name,
      type: g.type,
      config: g.config,
      extraInfo: g.extra_info,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    }));

    return res.json(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur GET /api/games', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des jeux',
    });
  }
}

// GET /api/games/:id
async function getGameById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Paramètre id manquant',
    });
  }

  try {
    const { data, error } = await supabase
      .from('games')
      .select('id, name, type, config, extra_info, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Jeu non trouvé',
        });
      }
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase GET /api/games/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du jeu',
      });
    }

    return res.json({
      id: data.id,
      name: data.name,
      type: data.type,
      config: data.config,
      extraInfo: data.extra_info,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur GET /api/games/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du jeu',
    });
  }
}

// POST /api/games
async function createGame(req, res) {
  const { name, type, config, extraInfo } = req.body || {};

  if (!name || !type) {
    return res.status(400).json({
      success: false,
      message: 'name et type sont obligatoires',
    });
  }

  if (!ALLOWED_GAME_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `type doit être l'une des valeurs suivantes: ${ALLOWED_GAME_TYPES.join(', ')}`,
    });
  }

  if (config !== undefined && !isPlainObject(config)) {
    return res.status(400).json({
      success: false,
      message: 'config doit être un objet JSON',
    });
  }

  try {
    const { data, error } = await supabase
      .from('games')
      .insert([
        {
          name,
          type,
          config: config || {},
          extra_info: extraInfo || null,
        },
      ])
      .select('id, name, type, config, extra_info, created_at, updated_at')
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase POST /api/games', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création du jeu',
      });
    }

    return res.status(201).json({
      id: data.id,
      name: data.name,
      type: data.type,
      config: data.config,
      extraInfo: data.extra_info,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur POST /api/games', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du jeu',
    });
  }
}

// PUT /api/games/:id
async function updateGame(req, res) {
  const { id } = req.params;
  const { name, type, config, extraInfo } = req.body || {};

  const updates = {};

  if (name !== undefined) updates.name = name;
  if (type !== undefined) {
    if (!ALLOWED_GAME_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type doit être l'une des valeurs suivantes: ${ALLOWED_GAME_TYPES.join(', ')}`,
      });
    }
    updates.type = type;
  }

  if (config !== undefined) {
    if (!isPlainObject(config)) {
      return res.status(400).json({
        success: false,
        message: 'config doit être un objet JSON',
      });
    }
    updates.config = config;
  }

  if (extraInfo !== undefined) {
    updates.extra_info = extraInfo;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aucun champ valide à mettre à jour',
    });
  }

  try {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select('id, name, type, config, extra_info, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Jeu non trouvé' });
      }
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase PUT /api/games/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour du jeu',
      });
    }

    return res.json({
      id: data.id,
      name: data.name,
      type: data.type,
      config: data.config,
      extraInfo: data.extra_info,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur PUT /api/games/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du jeu',
    });
  }
}

// DELETE /api/games/:id
async function deleteGame(req, res) {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('games').delete().eq('id', id);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase DELETE /api/games/:id', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression du jeu',
      });
    }

    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur DELETE /api/games/:id', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du jeu',
    });
  }
}

module.exports = {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
};

