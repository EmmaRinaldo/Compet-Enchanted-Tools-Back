const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Admin = require('../models/Admin');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI manquant dans le .env');
  }
  if (!ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL manquant dans le .env');
  }
  if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD manquant dans le .env');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  const existing = await Admin.findOne({ email: ADMIN_EMAIL }).lean();
  if (existing) {
    console.log(`ℹ️ Admin déjà présent pour ${ADMIN_EMAIL}, aucun seed nécessaire.`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await Admin.create({
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
  });

  console.log(`✅ Admin créé pour ${ADMIN_EMAIL}`);
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((err) => {
    console.error('❌ Seed admin échoué :', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.connection.close();
      console.log('✅ Connexion MongoDB fermée');
    } catch (e) {
      console.error('⚠️ Impossible de fermer la connexion MongoDB :', e);
    }
  });

