const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
    origin: ["http://localhost:3000"], // origine de ton admin
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
app.use('/api/modules', modulesRouter);
app.use('/api/admin', adminAuthRouter);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connexion à MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion MongoDB :', err);
    process.exit(1);
  });

// Routes de base (MVP)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
});
