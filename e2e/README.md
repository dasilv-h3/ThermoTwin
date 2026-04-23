# ThermoTwin — E2E tests

Tests d'intégration de l'API ThermoTwin avec [Playwright](https://playwright.dev).

## Prérequis

- Node.js >= 18
- Le backend ThermoTwin doit être lancé localement (`docker compose up -d` à la racine, API sur `http://localhost:8001`)

## Installation

```bash
cd e2e
npm install
npx playwright install
```

## Lancer les tests

```bash
# Contre le backend local (http://localhost:8001)
npm test

# Contre un autre environnement
API_BASE_URL=https://api.staging.thermotwin.io npm test

# UI interactive
npm run test:ui

# Rapport HTML
npm run report
```

## Structure

```
e2e/
├── playwright.config.ts   # Configuration (baseURL, reporters, retries)
├── tests/
│   ├── health.spec.ts     # Smoke tests sur /api/health
│   └── auth.smoke.spec.ts # Smoke tests sur les endpoints auth
└── package.json
```

## CI

Les retries (2) et le reporter GitHub sont activés automatiquement via `process.env.CI`.
