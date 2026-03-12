const mongoose = require('mongoose');
const { Schema } = mongoose;

const ModuleSchema = new Schema(
  {
    // Numéro du module affiché dans l'expérience
    number: {
      type: Number,
      required: true,
    },

    // Identifiant lisible pour le front / API
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Nom du module
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Texte de présentation du module
    description: {
      type: String,
      required: true,
    },

    // Médias (vidéo configurable)
    videoUrl: {
      type: String,
      required: true,
    },

    // Type de mini-jeu associé
    gameType: {
      type: String,
      enum: ['quiz', 'memory', 'puzzle', 'none'],
      default: 'none',
      required: true,
    },

    // Configuration souple du mini-jeu (quiz, memory, puzzle, etc.)
    gameConfig: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Partie du robot débloquée (optionnelle)
    robotPart: {
      type: String,
      enum: ['head', 'torso', 'leftArm', 'rightArm', 'legs', 'core'],
    },

    // Position obligatoire sur le plan (coordonnées x/y)
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },

    // Activation / désactivation du module dans l'expérience
    isActive: {
      type: Boolean,
      default: true,
    },

    // Ordre logique de parcours si besoin
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index utiles pour les requêtes courantes
ModuleSchema.index({ number: 1 });
ModuleSchema.index({ isActive: 1, order: 1 });

const Module =
  mongoose.models.Module || mongoose.model('Module', ModuleSchema);

module.exports = Module;