const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminSchema = new Schema(
  {
    // Email de connexion (identifiant unique)
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Mot de passe hashé (géré en dehors du modèle)
    passwordHash: {
      type: String,
      required: true,
    },

    // Rôle simple pour l'espace admin (MVP : un seul rôle)
    role: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Index unique explicite sur l'email
AdminSchema.index({ email: 1 }, { unique: true });

// Évite la recompilation du modèle en environnement avec rechargement
const Admin =
  mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

module.exports = Admin;

