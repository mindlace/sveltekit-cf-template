# SvelteKit + Cloudflare Workers Template

A [Copier](https://copier.readthedocs.io/) template for SvelteKit projects deployed to Cloudflare Workers with D1 (SQLite), Drizzle ORM, Tailwind CSS 4, and mdsvex.

## What you get

- **SvelteKit 2 + Svelte 5** with TypeScript strict mode
- **Cloudflare Workers** runtime with D1 database and optional R2/Queue bindings
- **Drizzle ORM** with SQLite dialect, migrations, and a D1-compatible migration flattener
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **mdsvex** for Markdown-in-Svelte (`.svx` files)
- **Vitest** with dual test projects (browser via Playwright + server via Node)
- **Playwright** for end-to-end tests
- **ESLint + Prettier** with 2-space indent, single quotes, 100 char width
- **Husky + lint-staged** pre-commit hooks
- **GitHub Actions CI** (lint + check + test)
- **Claude Code** agent instructions (`CLAUDE.md`) and permission config

## Usage

### Create a new project

```bash
# Install copier if needed
pip install copier  # or: pipx install copier / uvx copier

# Create a project from the template
copier copy gh:mindlace/sveltekit-cf-template my-project

# Set up
cd my-project
npm install
npm run dev
```

### Template variables

| Variable | Description | Default |
|---|---|---|
| `project_name` | Package name, D1 binding, wrangler name | (required) |
| `project_description` | Description for CLAUDE.md | `""` |
| `d1_database_id` | Production D1 database UUID | `""` |
| `d1_staging_database_id` | Staging D1 database UUID | `""` |
| `custom_domain` | Custom domain (e.g. `myapp.example.com`) | `""` |
| `use_r2` | Include R2 bucket binding | `false` |
| `use_queues` | Include Queue producer binding | `false` |

### Update an existing project

When the template is updated, pull changes into your project:

```bash
copier update
```

### Reverse-sync with copyback

To push improvements from a project back to this template, use [copyback](https://github.com/mindlace/copyback):

```bash
pip install copyback
cd my-project
copyback status                 # See what differs
copyback push --interactive     # Push selected changes back
copyback add src/lib/new.ts     # Add new files to the template
```

## Project structure (after copy)

```
my-project/
├── CLAUDE.md                    # Agent instructions
├── package.json                 # npm, shared deps/scripts
├── wrangler.jsonc               # Cloudflare Workers config
├── svelte.config.js             # SvelteKit + mdsvex
├── vite.config.ts               # Vite + Vitest dual projects
├── tsconfig.json                # TypeScript strict
├── drizzle.config.ts            # Drizzle ORM (SQLite/D1)
├── eslint.config.js             # ESLint 10
├── .prettierrc                  # 2-space, single quotes
├── playwright.config.ts         # E2E tests
├── .github/workflows/ci.yaml   # GitHub Actions
├── .husky/pre-commit            # lint-staged
├── src/
│   ├── app.d.ts                 # App.Platform type
│   ├── app.html                 # HTML shell
│   ├── lib/
│   │   └── server/db/
│   │       ├── index.ts         # getDb(platform) helper
│   │       ├── schema/schema.ts # Drizzle schema
│   │       └── d1-shim.ts       # better-sqlite3 D1 mock for tests
│   ├── routes/
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── scripts/
│       ├── migrate.ts           # D1 migration runner
│       └── prepare-migrations.ts # Drizzle -> D1 flattener
└── migrations/                  # Database migrations
```

## License

MIT
