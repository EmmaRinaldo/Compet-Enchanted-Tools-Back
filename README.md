## Compet Enchanted Tools – Back (API & Données)

### 1. Documentation technique

- **Rôle du projet**: fournir l’API centrale et la couche de persistance pour :
  - l’application joueur (`Compet-Enchanted-Tools-Front`)
  - l’application d’administration (`Compet-Enchanted-Tools-Admin`)
- **Technologies**: à adapter selon ton implémentation (exemples possibles) :
  - Node.js + Express / NestJS
  - Base de données : PostgreSQL / MySQL / MongoDB
  - ORM : Prisma / TypeORM / Sequelize, etc.
- **Principales entités métiers** (à ajuster si besoin) :
  - `User` / `Player` : utilisateur/joueur de la plateforme
  - `Parcours` : parcours pédagogique (ensemble structuré de modules)
  - `Module` : regroupement de missions / activités
  - `Mission` : activité ou étape précise (souvent liée à un quiz ou un mini‑jeu)
  - `Game` / `Quiz` : contenu interactif pour valider les compétences
  - `Reward` : récompense associée à des conditions (points, missions terminées, etc.)
  - `Progression` : suivi des missions complétées, scores, etc.

### 2. Schéma d’architecture (vue globale)

- **Clients**:
  - Front joueur (`Compet-Enchanted-Tools-Front`)
  - Front admin (`Compet-Enchanted-Tools-Admin`)
- **Back API (ce dépôt)**:
  - expose des endpoints REST (ou GraphQL) pour :
    - l’authentification / gestion des comptes
    - la gestion des parcours, modules, missions, récompenses
    - la récupération / mise à jour de la progression des joueurs
  - communique avec la base de données pour stocker les entités ci‑dessus.

### 3. Guide d’installation

#### Prérequis

- Node.js (version LTS)
- Gestionnaire de paquets: npm ou yarn
- Base de données installée et accessible (PostgreSQL / autre, selon ton choix)

#### Installation

```bash
cd Compet-Enchanted-Tools-Back
npm install
# ou
yarn install
```

#### Configuration

Créer un fichier d’environnement (par exemple `.env`) avec au minimum :

- URL de la base de données (`DATABASE_URL` ou équivalent)
- Port d’écoute de l’API (`PORT`)
- Clé secrète pour les tokens si auth JWT (`JWT_SECRET`)

### 4. Guide d’utilisation (API back)

#### Lancer le serveur en développement

```bash
cd Compet-Enchanted-Tools-Back
npm run dev
```

Le serveur démarre sur `http://localhost:<PORT>` (par défaut 3001 / 4000 selon la config).

#### Endpoints typiques (à adapter)

- `POST /auth/login` : authentification (retourne un token ou une session)
- `GET /parcours` : liste des parcours
- `GET /modules` / `GET /modules/:id` : liste / détail des modules
- `GET /missions` / `GET /missions/:id` : liste / détail des missions
- `GET /rewards` : liste des récompenses
- `GET /players/:id/progression` : progression d’un joueur
- `POST /players/:id/progression` : mise à jour de la progression (fin d’une mission, score de quiz, etc.)

Les routes d’administration (CRUD complet) peuvent être préfixées par `/admin/...` et protégées par des rôles/permissions.

### 5. Exemples de données

#### 5.1. Exemples JSON (seeds / fixtures)

Exemple de parcours :

```json
{
  "id": "parcours-1",
  "name": "Découverte des outils enchantés",
  "description": "Un parcours introductif pour découvrir les principaux outils.",
  "modules": ["module-1", "module-2"]
}
```

Exemple de module :

```json
{
  "id": "module-1",
  "title": "Module 1 – Bases",
  "description": "Comprendre les fonctionnalités de base.",
  "missions": ["mission-1", "mission-2"]
}
```

Exemple de mission :

```json
{
  "id": "mission-1",
  "title": "Première mission",
  "description": "Répondre à un quiz d’introduction.",
  "type": "quiz",
  "gameId": "quiz-1",
  "rewardId": "reward-1"
}
```

Exemple de quiz :

```json
{
  "id": "quiz-1",
  "questions": [
    {
      "id": "q1",
      "label": "Quel est l’objectif du parcours ?",
      "choices": [
        "Apprendre les bases",
        "Gagner des points sans apprendre",
        "Aucune idée"
      ],
      "correctChoiceIndex": 0
    }
  ]
}
```

Exemple de récompense :

```json
{
  "id": "reward-1",
  "name": "Badge Explorateur",
  "description": "Récompense obtenue après la première mission.",
  "icon": "rewards-perso.svg",
  "conditions": {
    "completedMissions": ["mission-1"]
  }
}
```

#### 5.2. Où placer ces données

- Dossier recommandé: `prisma/seed.ts`, `data/seeds/*.json` ou équivalent, selon ton stack.
- Script de seed possible :

```bash
npm run seed
```

Cela permet de peupler la base avec un jeu de données de démonstration cohérent pour tester le front joueur et l’admin.

### 6. Instructions de déploiement

#### Build & run en production

```bash
cd Compet-Enchanted-Tools-Back
npm run build    # si applicable (NestJS / TypeScript…)
npm run start
```

#### Points d’attention

- Configurer les variables d’environnement (DB, JWT, CORS, etc.) sur l’environnement de prod.  
- Ouvrir le port de l’API uniquement derrière un reverse proxy (Nginx, Traefik, etc.).  
- Configurer les CORS pour autoriser les domaines du front joueur et de l’admin.  
- Mettre en place des sauvegardes régulières de la base de données et, si possible, de l’observabilité (logs, métriques, alertes).

