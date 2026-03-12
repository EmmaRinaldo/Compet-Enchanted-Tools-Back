const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Module = require('../models/Module');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.error('❌ MONGODB_URI manquant dans src/.env. Abandon du seed.');
  process.exit(1);
}

const MODULE_DEFINITIONS = [
  {
    number: 1,
    slug: 'naissance-enchanted-tools',
    name: 'La naissance d’Enchanted Tools',
    description:
      "Première activation des particules de lumière qui donneront naissance au corps du Mirokaï.",
    videoUrl: 'https://www.youtube.com/watch?v=WNjE-IHRdr4',
    gameType: 'none',
    robotPart: undefined,
    position: { x: 80, y: 92 },
    isActive: true,
    order: 1,
  },
  {
    number: 2,
    slug: 'histoire-mirokai',
    name: 'L’histoire des Mirokaï',
    description:
      "Canaliser l’énergie nécessaire pour maintenir le lien entre le monde des Mirokaï et la Terre.",
    videoUrl: 'https://www.youtube.com/watch?v=EncD-HasmLA',
    gameType: 'none',
    robotPart: 'torso', // gagne le corps
    position: { x: 90, y: 67 },
    isActive: true,
    order: 2,
  },
  {
    number: 3,
    slug: 'design',
    name: 'Le Design',
    description:
      "Ajuster la surface du corps pour qu’il reflète et absorbe correctement la lumière environnante.",
    videoUrl: 'https://www.youtube.com/watch?v=y_6i-W-XE60',
    gameType: 'none',
    robotPart: 'leftArm', // gagne le bras gauche
    position: { x: 90, y: 40 },
    isActive: true,
    order: 3,
  },
  {
    number: 4,
    slug: 'electronique-sur-table',
    name: 'Électronique sur table',
    description:
      "Assembler l’ossature principale qui soutiendra chaque mouvement du Mirokaï sur Terre.",
    videoUrl: 'https://www.youtube.com/watch?v=i9VHPQKpSvs',
    gameType: 'none',
    robotPart: 'rightArm', // gagne le bras droit
    position: { x: 78, y: 20 },
    isActive: true,
    order: 4,
  },
  {
    number: 5,
    slug: 'combinaison-mirokai',
    name: 'La combinaison des Mirokaï',
    description:
      "Stabiliser le cœur énergétique qui alimente l’ensemble du corps robotique.",
    videoUrl: 'https://www.youtube.com/watch?v=9kUG1zUlFuM',
    gameType: 'none',
    robotPart: undefined,
    position: { x: 55, y: 10 },
    isActive: true,
    order: 5,
  },
  {
    number: 6,
    slug: 'pendule-inverse',
    name: 'Pendule inversé',
    description:
      "Configurer les systèmes internes pour que le Mirokaï garde toujours le sens de l’espace.",
    videoUrl: 'https://www.youtube.com/watch?v=ZnHcU_dpGYY',
    gameType: 'none',
    robotPart: undefined,
    position: { x: 30, y: 18 },
    isActive: true,
    order: 6,
  },
  {
    number: 7,
    slug: 'vision-robot',
    name: 'Vision du robot',
    description:
      "Accorder les capteurs visuels et sonores pour percevoir les visiteurs et l’environnement.",
    videoUrl: 'https://www.youtube.com/watch?v=NhmDAfp_XW4',
    gameType: 'none',
    robotPart: 'head', // gagne la tête
    position: { x: 14, y: 38 },
    isActive: true,
    order: 7,
  },
  {
    number: 8,
    slug: 'ia-robot',
    name: 'L’IA du robot',
    description:
      "Façonner la voix par laquelle le Mirokaï pourra s’exprimer auprès des humains.",
    videoUrl: 'https://www.youtube.com/watch?v=ikvjdWjNJiU&pp=0gcJCcUKAYcqIYzv',
    gameType: 'none',
    robotPart: undefined,
    position: { x: 18, y: 60 },
    isActive: true,
    order: 8,
  },
  {
    number: 9,
    slug: 'cas-usage',
    name: 'Cas d’usage',
    description:
      "Préparer la base et les appuis pour que le corps reste stable malgré les perturbations.",
    videoUrl: 'https://www.youtube.com/watch?v=Vw-Kx2l7zA8',
    gameType: 'none',
    robotPart: undefined,
    position: { x: 32, y: 78 },
    isActive: true,
    order: 9,
  },
  {
    number: 10,
    slug: 'salle-cyclage',
    name: 'Salle de Cyclage',
    description:
      "Programmer la finesse des mouvements des bras pour interagir avec douceur avec le monde réel.",
    videoUrl: 'https://www.youtube.com/watch?v=3gxy-MTFPmA',
    gameType: 'none',
    robotPart: 'legs', // gagne le pendule / les jambes
    position: { x: 50, y: 82 },
    isActive: true,
    order: 10,
  },
  {
    number: 11,
    slug: 'fresque-recapitulative',
    name: 'Fresque récapitulative',
    description:
      "Dernière étape : aligner tous les fragments pour permettre au Mirokaï de traverser définitivement.",
    videoUrl: 'https://www.youtube.com/watch?v=c93QiVmUsmU',
    gameType: 'none',
    robotPart: undefined,
    position: { x: 66, y: 72 },
    isActive: true,
    order: 11,
  },
];

async function main() {
  try {
    // eslint-disable-next-line no-console
    console.log('🌱 Seed Modules – connexion à MongoDB…');
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('✅ Connecté à MongoDB');

    // Pour un MVP, on upsert par slug pour éviter les doublons
    let createdCount = 0;
    let updatedCount = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const def of MODULE_DEFINITIONS) {
      const existing = await Module.findOne({ slug: def.slug });
      if (existing) {
        await Module.updateOne({ slug: def.slug }, { $set: def });
        updatedCount += 1;
      } else {
        await Module.create(def);
        createdCount += 1;
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `🌱 Seed terminé. Créés: ${createdCount}, mis à jour: ${updatedCount}.`,
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Erreur pendant le seed des modules :', err);
  } finally {
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
}

main();

