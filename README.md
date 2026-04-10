# ThermoTwin

Application de jumeau numérique thermique pour le monitoring et la simulation énergétique de bâtiments.

## Stack technique

### Backend
- **Framework** : FastAPI (Python 3.14)
- **Bases de données** : PostgreSQL 16 + MongoDB 7.0
- **ORM/ODM** : SQLAlchemy (PostgreSQL) / Beanie + Motor (MongoDB)
- **Authentification** : JWT (PyJWT + bcrypt)
- **Linting** : Ruff
- **Tests** : Pytest

### Frontend (mobile)
- **Framework** : React Native (Expo SDK 54)
- **Langage** : TypeScript
- **Navigation** : React Navigation (Stack + Tab)
- **State management** : Redux Toolkit
- **Linting** : ESLint + Prettier

### Infrastructure
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Monitoring logs** : Dozzle

## Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [Python](https://www.python.org/) >= 3.14
- [Docker](https://www.docker.com/) et Docker Compose
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/dasilv-h3/ThermoTwin.git
cd ThermoTwin
```

### 2. Configuration des variables d'environnement

```bash
# Variables Docker (racine)
cp .env.example .env

# Variables backend
cp backend/.env.example backend/.env
```

Remplir les fichiers `.env` :

**`.env` (racine)** :
| Variable | Description |
|----------|-------------|
| `MONGO_ROOT_USER` | Utilisateur root MongoDB |
| `MONGO_ROOT_PASSWORD` | Mot de passe root MongoDB |
| `POSTGRES_USER` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `POSTGRES_DB` | Nom de la base PostgreSQL |

**`backend/.env`** :
| Variable | Description |
|----------|-------------|
| `MONGO_DB_NAME` | Nom de la base MongoDB |
| `JWT_SECRET` | Clé secrète pour les tokens JWT |
| `DEBUG` | Mode debug (`true` / `false`) |

### 3. Lancer le backend (Docker)

```bash
docker compose up -d
```

Services disponibles :
| Service | URL |
|---------|-----|
| API | http://localhost:8001 |
| Docs Swagger | http://localhost:8001/docs |
| PostgreSQL | localhost:5432 |
| MongoDB | localhost:27017 |
| Dozzle (logs) | http://localhost:9999 |

### 4. Lancer le frontend

```bash
cd frontend
npm install
npm start
```

Scanner le QR code avec [Expo Go](https://expo.dev/go) sur mobile.

## Structure du projet

```
ThermoTwin/
├── backend/
│   ├── app/
│   │   ├── api/            # Routes et middlewares
│   │   ├── core/           # Config, sécurité, logging
│   │   ├── db/             # Connexions PostgreSQL et MongoDB
│   │   ├── models/         # Modèles SQLAlchemy
│   │   ├── schemas/        # Schémas Pydantic
│   │   ├── services/       # Logique métier
│   │   └── main.py         # Point d'entrée FastAPI
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── navigation/     # Navigateurs Stack et Tab
│   │   ├── screens/        # Écrans de l'application
│   │   └── store/          # Redux store et slices
│   ├── App.tsx
│   └── package.json
├── .github/workflows/      # CI/CD GitHub Actions
├── docker-compose.yml
└── .env.example
```

## API Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/auth/register` | Inscription | Non |
| `POST` | `/api/auth/login` | Connexion | Non |
| `POST` | `/api/auth/refresh` | Rafraîchir le token | Non |
| `GET` | `/api/auth/me` | Profil utilisateur | JWT |
| `GET` | `/api/health` | Health check | Non |

## Workflow Git

- **`main`** : branche de production (protégée)
- **`develop`** : branche de développement (protégée)
- **`feature/*`** : branches de fonctionnalités

Les PRs vers `main` et `develop` nécessitent l'approbation de tous les reviewers.

## CI/CD

Le pipeline GitHub Actions (`backend-ci.yml`) s'exécute sur push/PR vers `main` et `develop` :

1. **Lint** : vérification du formatage et linting (Ruff)
2. **Test** : exécution des tests avec PostgreSQL et MongoDB
3. **Build** : construction de l'image Docker

## Équipe

| Membre | GitHub |
|--------|--------|
| Thomas Bizet | [@LaSkyMania](https://github.com/LaSkyMania) |
| Katia | [@Katiadje](https://github.com/Katiadje) |
| Da Silva | [@dasilv-h3](https://github.com/dasilv-h3) |
