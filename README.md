# Arc Dashboard

This repository contains the Arc Dashboard frontend.

## Project status

The repository is published as-is for community reference and contributions.
There is currently no guaranteed maintenance SLA.

## Requirements

- Node.js 16.x (see `.nvmrc` / Volta config)
- Yarn 1.x

## Setup

After cloning this repo, sync the `batteries` submodule:

```bash
git submodule init
git submodule update --recursive --remote

cd src/batteries
git fetch origin
git checkout arc
cd ../..
```

Copy environment examples and update values:

```bash
cp .env.example .env
cp cypress.env.example.json cypress.env.json
```

## Installation and development

```bash
yarn
yarn dev
```

The app runs on `http://localhost:3333`.

## Build and test

```bash
yarn lint
yarn test
yarn build
```

For Cypress:

```bash
yarn cypress:open
# or
yarn cypress:run
```

## Security and secrets

- Do not commit real credentials, API keys, or tokens.
- Keep `.env`, `cypress.env.json`, and local auth tokens out of version control.
- For vulnerability disclosures, see `SECURITY.md`.
