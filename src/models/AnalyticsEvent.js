const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnalyticsEventSchema = new Schema(
  {
    // Type d'événement anonymisé envoyé par le front
    eventType: {
      type: String,
      required: true,
      enum: [
        'experience_started',
        'module_completed',
        'challenge_completed',
        'badge_downloaded',
      ],
    },

    // Slug du module concerné (pour les événements liés à un module)
    moduleSlug: {
      type: String,
    },

    // Identifiant anonyme de session généré côté front
    sessionToken: {
      type: String,
      index: true,
    },

    // Données complémentaires légères et optionnelles
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index utiles pour les agrégations futures
AnalyticsEventSchema.index({ eventType: 1, moduleSlug: 1 });
AnalyticsEventSchema.index({ eventType: 1, createdAt: 1 });

const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ||
  mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

module.exports = AnalyticsEvent;

