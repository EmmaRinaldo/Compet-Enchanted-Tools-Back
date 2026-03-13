const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');

const supabase = require('../lib/supabase');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  if (!ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL manquant dans le .env');
  }
  if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD manquant dans le .env');
  }

  const { data: existingAdmin, error: selectError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();

  if (selectError) {
    console.error('❌ Erreur lors de la récupération de l’admin existant :', selectError);
    throw selectError;
  }

  if (existingAdmin) {
    console.log(`ℹ️ Admin déjà présent pour ${ADMIN_EMAIL}, aucun seed nécessaire.`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const { error: insertError } = await supabase.from('admins').insert([
    {
      email: ADMIN_EMAIL,
      password_hash: passwordHash,
      role: 'admin',
    },
  ]);

  if (insertError) {
    console.error('❌ Erreur lors de la création de l’admin :', insertError);
    throw insertError;
  }

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
    // Rien à fermer explicitement avec Supabase (client HTTP stateless)
  });

