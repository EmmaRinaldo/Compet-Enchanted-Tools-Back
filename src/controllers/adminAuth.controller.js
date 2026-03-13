const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const TOKEN_COOKIE_NAME = 'admin_session';

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET manquant dans src/.env');
  }
  return secret;
}

// POST /api/admin/login
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe sont requis',
    });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase lors de la récupération de l’admin', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la connexion',
      });
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role || 'admin',
      },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // à passer à true en prod (https)
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur login admin', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
    });
  }
}

// POST /api/admin/logout
function logout(_req, res) {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
  return res.json({ success: true });
}

module.exports = {
  login,
  logout,
};

