# Repository Guidelines

## Project Structure & Module Organization

This React + TypeScript frontend uses Vite and a separate Rails API. `src/App.tsx` contains the explorer, `src/data.ts` handles normalization and calculations, and `src/Picker.tsx` provides accessible selectors. Styles live in `src/App.css`; assets belong in `src/assets/` or `public/`. Source tests are colocated; browser tests live in `e2e/`. See `design/README.md` for visual direction. Production output goes to `dist/`.

## Build, Test, and Development Commands

Use Node.js 20.19+ or 22.12+.

- `npm install`: install dependencies.
- `cp .env.example .env.local`: initialize local configuration.
- `npm run dev`: start Vite at `http://127.0.0.1:5173`; run the populated Rails API separately on port 3000.
- `npm run build`: check TypeScript and build production assets.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run Oxlint with React and TypeScript rules.
- `npm test`: run Vitest source tests.
- `npm run test:e2e`: run Playwright desktop and mobile tests locally, or set `PLAYWRIGHT_BASE_URL=https://bigmac.gurgelrenan.tech` for production.

## Production Deployment

Production: `https://bigmac.gurgelrenan.tech`, using Docker and Kamal 2 on Hostinger. See `DEPLOY.md`. Ruby and Bundler run deployment tooling only; `bin/kamal deploy` publishes Nginx to GHCR. Boot the `router` accessory on first setup. Traefik handles TLS through the shared Kamal proxy; preserve Fiscaliza services and proxy configuration. Nginx forwards `/api/` internally to `bigmac-api.gurgelrenan.tech`, using the relative `/api/v1` base.

## Coding Style & Naming Conventions

Follow existing two-space indentation, single quotes, and local semicolon conventions. Use PascalCase component filenames, camelCase functions and variables, and explicit TypeScript types for data contracts. Keep calculations in `data.ts` and reuse `Picker` for selectors. Preserve Portuguese interface copy and accessible labels. Oxlint enforces Hooks rules; no formatter is configured.

## Testing Guidelines

Name source tests `*.test.ts` or `*.test.tsx` and browser tests `*.spec.ts`. Use Vitest and Testing Library; component tests select jsdom through a file directive. Cover calculations, JSON:API parsing, errors, and user interactions. No coverage threshold is configured. Playwright uses installed Chrome by default; override with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. For UI changes, inspect both viewport sizes and include screenshots.

## Commit & Pull Request Guidelines

Use action-oriented subjects, following `[MAIN] Build Big Mac Index explorer frontend`. PRs should explain changes, link issues, report checks, and include screenshots for visual changes.

## Configuration & Data Integrity

Set `API_PROXY_TARGET` for development. Override `VITE_API_BASE_URL` only for alternate hosting; all `VITE_*` values are public. Never commit `.kamal/secrets` or credentials. Compare countries within one edition, preserve source attribution, and keep loading, failure, and empty-data states distinct.
