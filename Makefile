## ThermoTwin — Makefile
##
## Reproduit localement la pipeline GitHub Actions (.github/workflows/backend-ci.yml)
## et expose des cibles d'auto-fix pour rester ISO CI avant de pousser.
##
## Usage rapide :
##   make            # affiche l'aide
##   make ci         # exécute toute la pipeline (lint + test + build)
##   make fix        # auto-fix backend + frontend
##   make check      # vérifie sans modifier (= ce que fait la CI)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SHELL          := /bin/bash
.DEFAULT_GOAL  := help

BACKEND_DIR    := backend
FRONTEND_DIR   := frontend
E2E_DIR        := e2e

PYTHON         ?= python3
RUFF_VERSION   := 0.11.4

# Venv local au projet (evite PEP 668 / externally-managed env sur macOS Homebrew)
# Chemins absolus pour fonctionner depuis n'importe quel sous-repertoire (cd backend &&...)
VENV           := $(CURDIR)/.venv
VENV_PY        := $(VENV)/bin/python
VENV_PIP       := $(VENV)/bin/pip

# Variables d'environnement utilisees par les tests backend (cf. backend-ci.yml)
export MONGO_URL      ?= mongodb://root:thermotwin@localhost:27017/?authSource=admin
export MONGO_DB_NAME  ?= thermotwin
export POSTGRES_URL   ?= postgresql+psycopg://thermotwin:thermotwin@localhost:5432/thermotwin
export JWT_SECRET     ?= ci-test-secret
export DEBUG          ?= false

.PHONY: help ci check fix check-all \
        ensure-venv ensure-ruff ensure-backend-deps ensure-frontend-deps \
        install install-backend install-frontend install-e2e \
        backend-format-check backend-lint backend-format backend-fix backend-test \
        frontend-lint frontend-lint-fix frontend-format frontend-fix \
        e2e-test \
        docker-build services-up services-down services-logs \
        clean

# ---------------------------------------------------------------------------
# Aide
# ---------------------------------------------------------------------------
help: ## Affiche cette aide
	@printf "\nThermoTwin — cibles disponibles :\n\n"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  \033[36m%-26s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@printf "\n"

# ---------------------------------------------------------------------------
# Pipelines composites (ISO GitHub Actions)
# ---------------------------------------------------------------------------
ci: check backend-test docker-build ## Pipeline complete (lint + test + docker build) — equivalent CI

check: backend-format-check backend-lint frontend-lint ## Verifie sans modifier (ce que fait la CI)

fix: backend-fix frontend-fix ## Auto-fix backend + frontend (format + lint --fix)

check-all: fix check backend-test ## Tout-en-un : auto-fix puis verifie (lint + tests) — pre-push complet

# ---------------------------------------------------------------------------
# Installation des dependances
# ---------------------------------------------------------------------------
install: install-backend install-frontend install-e2e ## Installe toutes les dependances

install-backend: ensure-venv ## Installe les deps Python du backend + ruff dans $(VENV)
	"$(VENV_PIP)" install -r "$(BACKEND_DIR)/requirements.txt"
	"$(VENV_PIP)" install ruff==$(RUFF_VERSION)

install-frontend: ## Installe les deps npm du frontend
	cd "$(FRONTEND_DIR)" && npm install

install-e2e: ## Installe les deps Playwright
	cd "$(E2E_DIR)" && npm install && npx playwright install --with-deps

# ---------------------------------------------------------------------------
# Garde-fous d'installation (auto-bootstrap si outil manquant)
# ---------------------------------------------------------------------------
ensure-venv: ## Cree le venv local $(VENV) si absent
	@test -x "$(VENV_PY)" || { \
		echo "==> Creation du venv $(VENV)..."; \
		$(PYTHON) -m venv "$(VENV)"; \
		"$(VENV_PIP)" install --quiet --upgrade pip; \
	}

ensure-ruff: ensure-venv ## Installe ruff dans $(VENV) si absent
	@"$(VENV_PY)" -m ruff --version >/dev/null 2>&1 || { \
		echo "==> Installation de ruff==$(RUFF_VERSION) dans $(VENV)..."; \
		"$(VENV_PIP)" install --quiet ruff==$(RUFF_VERSION); \
	}

ensure-backend-deps: ensure-venv ## Installe les deps Python si pytest absent du venv
	@"$(VENV_PY)" -m pytest --version >/dev/null 2>&1 || { \
		echo "==> Installation des deps backend dans $(VENV)..."; \
		"$(VENV_PIP)" install -r "$(BACKEND_DIR)/requirements.txt"; \
	}

ensure-frontend-deps: ## Installe les deps npm du frontend si binaires manquants
	@if [ ! -x "$(FRONTEND_DIR)/node_modules/.bin/prettier" ] || \
	    [ ! -x "$(FRONTEND_DIR)/node_modules/.bin/eslint" ]; then \
		echo "==> Deps frontend incompletes, npm install dans $(FRONTEND_DIR)..."; \
		cd "$(FRONTEND_DIR)" && npm install; \
	fi

# ---------------------------------------------------------------------------
# Backend — lint & format (job "lint" de la CI)
# ---------------------------------------------------------------------------
backend-format-check: ensure-ruff ## ruff format --check (CI step)
	cd "$(BACKEND_DIR)" && "$(VENV_PY)" -m ruff format --check .

backend-lint: ensure-ruff ## ruff check (CI step)
	cd "$(BACKEND_DIR)" && "$(VENV_PY)" -m ruff check .

backend-format: ensure-ruff ## ruff format (auto-fix formatting)
	cd "$(BACKEND_DIR)" && "$(VENV_PY)" -m ruff format .

backend-fix: backend-format ## ruff format + ruff check --fix
	cd "$(BACKEND_DIR)" && "$(VENV_PY)" -m ruff check --fix .

# ---------------------------------------------------------------------------
# Backend — tests (job "test" de la CI)
# ---------------------------------------------------------------------------
backend-test: ensure-backend-deps ## pytest tests/ -v (CI step) — necessite Postgres + Mongo accessibles
	cd "$(BACKEND_DIR)" && "$(VENV_PY)" -m pytest tests/ -v

# ---------------------------------------------------------------------------
# Frontend — lint & format
# ---------------------------------------------------------------------------
frontend-lint: ensure-frontend-deps ## eslint .
	cd "$(FRONTEND_DIR)" && npm run lint

frontend-lint-fix: ensure-frontend-deps ## eslint . --fix
	cd "$(FRONTEND_DIR)" && npm run lint:fix

frontend-format: ensure-frontend-deps ## prettier --write
	cd "$(FRONTEND_DIR)" && npm run format

frontend-fix: frontend-format frontend-lint-fix ## prettier + eslint --fix

# ---------------------------------------------------------------------------
# E2E (Playwright)
# ---------------------------------------------------------------------------
e2e-test: ## Lance les tests end-to-end Playwright
	cd "$(E2E_DIR)" && npm test

# ---------------------------------------------------------------------------
# Docker (job "build" de la CI)
# ---------------------------------------------------------------------------
docker-build: ## docker build backend/ -t thermotwin-api:local (CI step)
	docker build "$(BACKEND_DIR)/" -t thermotwin-api:local

services-up: ## Demarre Postgres + Mongo via docker-compose (pour backend-test)
	docker compose up -d postgres mongo

services-down: ## Arrete les services docker-compose
	docker compose down

services-logs: ## Suit les logs des services
	docker compose logs -f

# ---------------------------------------------------------------------------
# Nettoyage
# ---------------------------------------------------------------------------
clean: ## Supprime les artefacts (caches, builds)
	find . -type d -name "__pycache__" -prune -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -prune -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -prune -exec rm -rf {} +
	rm -rf "$(FRONTEND_DIR)/node_modules/.cache" 2>/dev/null || true
	rm -rf "$(E2E_DIR)/test-results" "$(E2E_DIR)/playwright-report" 2>/dev/null || true
