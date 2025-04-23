# `@sbp/env` — Environment Build Utility

This package provides a CLI utility for generating application-specific `.env` files from a monorepo-wide `.env` or `.env.example`, along with validation and `.env.example` generation.

## 📌 Why this exists

Centralized env files are nice, but scattered `.env` usage leads to:
- leaked or unused secrets
- pain in CI/CD pipelines
- messy manual sync

This utility keeps your envs clean and enforces structure.

## 📦 What it does

- Filters variables for specific apps
- Sorts them for consistency
- Validates required variables
- Keeps your apps clean, DRY, and CI/CD-friendly

## 🛠️ How to use

```bash
pnpm sbp:env
```

> This will:
> - filter and write `.env` for `apps/api`
> - validate presence of required variables
> - optionally generate `.env.example`

To run in dev mode with TypeScript:

```bash
pnpm --filter @sbp/env dev
```

To build and run the compiled version:

```bash
pnpm --filter @sbp/env build
pnpm --filter @sbp/env run:spread
```

### 🗝️ Schema

```bash
pnpm --filter @sbp/env [build|run:spread|dev:spread] [...opts]
```

### 🛠️ Options

### `--config`<sup>?`./env.spread.yaml`</sup>

- A YAML file that defines how to validate the environment variables and where to output them.
- The file must be located in the directory of the main `.env` file.

## 🔧 Integration in apps

Apps using this utility should import environment variables like this:

```ts
// prettier-ignore
import 'dotenv/config';
```

No manual configuration or duplication required.

## ✅ Example workflow
1. You define all available environment variables in the root `.env` or `.env.${NODE_ENV}`
2. You declare app paths and required env keys for all the apps in the root-level `env.spread.yaml`
3. Run `pnpm sbp:env`
4. It filters `.env` by required keys, validates presence, and generates `.env.${NODE_ENV}` in the target app

## 🧠 Pro tips

Use `.env.local`, `.env.development.local`, etc. for overrides.
This tool respects standard env merging via `dotenv-expand`.

Place a templated variable which depends on local ones at the end of the `.env.local` or `.env.${NODE_ENV}.local` file.

---

Built with 🧠 by humans. Inspired by real problems in monorepo env management.