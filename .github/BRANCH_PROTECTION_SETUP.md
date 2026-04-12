# Configuration des Branch Protection Rules

> Ce guide doit être suivi par un **administrateur du repo** (Settings > Branches).

## Branches à protéger : `main` et `develop`

Pour chaque branche, ajouter une **Branch protection rule** avec les paramètres suivants :

### Branch name pattern
- `main`
- `develop`

### Règles à activer

- [x] **Require a pull request before merging**
  - [x] Require approvals : **2** (tous les membres de l'équipe)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners
- [x] **Require status checks to pass before merging** *(pour `main` et `develop`)*
  - Ajouter les checks : `Lint`, `Test`, `Docker Build`
- [x] **Require branches to be up to date before merging**
- [x] **Do not allow bypassing the above settings**
- [x] **Restrict who can push to matching branches**
  - Ne permettre aucun push direct (uniquement via PR)

### Accès rapide

Settings > Branches > Add branch protection rule

Ou via l'URL :
```
https://github.com/dasilv-h3/ThermoTwin/settings/branches
```
