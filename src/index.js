const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const supabase = require('./lib/supabase');

// Swagger est optionnel pour le MVP : on essaie de le charger, sinon on continue sans casser l'app
let swaggerUi;
let swaggerSpec;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  const swagger = require('./swagger');
  swaggerUi = swagger.swaggerUi;
  swaggerSpec = swagger.swaggerSpec;
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ Swagger non chargé (fichier ./swagger manquant ou invalide). API démarrée sans /api-docs.');
}

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://compet-enchanted-tools-admin.vercel.app/", "https://compet-enchanted-tools-front.vercel.app/", "https://compet-enchanted-tools-admin-rmbw7k2z9-emmas-projects-7a07aa96.vercel.app/", "https://compet-enchanted-tools-front-cqgrxrc7g-emmas-projects-7a07aa96.vercel.app/"], // admin + front visiteur
    credentials: true,
  }),
);
app.use(express.json());

// Docs Swagger disponibles sur /api-docs (si swagger est dispo)
if (swaggerUi && swaggerSpec) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Routes API
const modulesRouter = require('./routes/modules.routes');
const adminAuthRouter = require('./routes/adminAuth.routes');
const robotPartsRouter = require('./routes/robotParts.routes');
const gamesRouter = require('./routes/games.routes');
const robotPartVariantsRouter = require('./routes/robotPartVariants.routes');
const robotLayoutRouter = require('./routes/robotLayout.routes');
const uploadsRouter = require('./routes/uploads.routes');
app.use('/api/modules', modulesRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/robot-parts', robotPartsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/robot-part-variants', robotPartVariantsRouter);
app.use('/api/robot-layout', robotLayoutRouter);
app.use('/api/uploads', uploadsRouter);

const PORT = process.env.PORT || 4000;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante(s). Les opérations BDD échoueront.',
  );
}

// Routes de base (MVP)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
});
