# AGENTS.md

This file is the project-level working guide for Codex agents in this repository.

## Project Intent

- This is an open-source Virtual Power Plant (VPP) visual display platform being adapted for the user's company.
- The near-term goal is an external-facing showcase/demo platform, not a production-grade operational system.
- Prefer low-cost page, copy, branding, layout, data, and asset adjustments over backend-heavy or architecture-heavy changes.
- Keep the product language and visual direction aligned with a Chinese virtual power plant business scenario.

## Tech Stack

- Vue 3.5 + TypeScript + Vite 6.
- Element Plus for UI widgets, with Chinese locale configured in `src/main.ts`.
- Pinia is installed but currently only has the default/example `src/stores/counter.ts`.
- ECharts is wrapped by `src/components/chart/chart.vue` and helpers in `src/components/chart/index.ts`.
- AntV L7 + Gaode Map are used for map-based pages.
- UnoCSS utility classes are used heavily in templates.
- Sass/SCSS is enabled globally through `src/assets/element.scss`.
- `autofit.js` is used on most page-level views to scale a 1440 x 780 big-screen layout.

## Commands

- Install: `pnpm install`
- Dev server: `pnpm serve`
- Production build with type check: `pnpm build`
- Build only: `pnpm build-only`
- Preview build: `pnpm preview`
- Lint: `pnpm lint`
- Format source: `pnpm format`

Notes:
- Vite dev server is configured for port `3333` and `open: true` in `vite.config.ts`.
- Production output goes to `docs/`.
- Vite `base` is currently `/vpp`; adjust this before deployment if the app is not served under `/vpp`.

## Repository Map

- `index.html`: Vite HTML entry, mounts `#app` and loads `src/main.ts`.
- `src/main.ts`: app bootstrap; imports UnoCSS, global CSS, router, Pinia, Element Plus, SVG icon registration.
- `src/App.vue`: root shell; renders global navigation and `RouterView`.
- `src/router/index.ts`: all route definitions.
- `src/components/nav/index.vue`: top navigation and platform title.
- `src/components/exteriorShell/index.vue`: common panel frame with title/content slots.
- `src/components/chart/`: shared ECharts wrapper and option factories.
- `src/views/`: all page-level screens, organized by business module.
- `src/assets/`: source images, icons, and styles, organized roughly by page/module.
- `public/`: static public files.
- `docs/`: generated build output; do not edit directly for source changes.
- `auto-imports.d.ts` and `components.d.ts`: generated declarations from Vite plugins; avoid manual edits unless there is a deliberate generator-related change.

## Route Map

- `/`: home dashboard, map-heavy landing screen.
- `/resources/metaAnalysis`: resource comprehensive analysis.
- `/resources/metaOverview`: resource management overview.
- `/resources/metaEnroll`: resource registration.
- `/realTimeMonitor`: real-time status monitoring.
- `/forecast/DataQuery`: forecast data query. Keep the capital `D` unless deliberately changing routes.
- `/forecast/multiDimension`: multi-dimensional load forecast.
- `/generationTask/priceSignal`: price signal.
- `/generationTask/excitationSignal`: excitation/incentive signal.
- `/task/motivational`: incentive-type information.
- `/task/demandResponse`: demand response details.
- `/task/orderElectric`: orderly electricity utilization details.
- `/effect/technical`: technical parameter assessment.
- `/effect/deviation`: deviation rate assessment.

## Page Structure Pattern

- Most pages use `index.vue` as the layout container and split content into `left.vue`, `center.vue`, and/or `right.vue`.
- Map pages create an L7 `Scene` inside an element with id `container`.
- Non-map pages often use a background image on `#container` and compose panels using `ExteriorShell`.
- Most display data is currently static inside Vue components. This is useful for quick demo-oriented adaptation.
- Many layout dimensions are fixed for the big-screen design; when changing copy, check that Chinese text still fits.

## Editing Guidelines

- Use UTF-8 when reading or editing Chinese files. In PowerShell, prefer `Get-Content -Encoding UTF8`.
- Prefer existing Vue SFC style: `<script setup lang="ts">`, local imports, scoped SCSS where already used.
- Preserve the current big-screen visual language unless the user asks for a broader redesign.
- For quick business customization, prioritize:
  - `src/components/nav/index.vue` for platform name and menus.
  - `src/router/index.ts` for page availability and route labels.
  - `src/views/**/left.vue`, `center.vue`, `right.vue`, `index.vue` for panel copy, metrics, charts, and mock data.
  - `src/assets/**` for replacing page-specific images and backgrounds.
  - `README.md` for project-facing documentation.
- Do not change `docs/` directly for application behavior; edit `src/` and rebuild.
- Avoid introducing backend/API work unless explicitly requested. The Vite proxy exists, but current source inspection found no active axios/fetch API usage.
- Keep dependencies stable unless a requested feature clearly needs a new dependency.
- Be careful with Gaode Map settings and tokens hardcoded in map pages before public deployment.

## Verification

- For source changes, run at least `pnpm build-only` when practical.
- For type-sensitive or shared changes, run `pnpm build`.
- For UI/page changes, start `pnpm serve` and inspect the affected route.
- If Git commands fail with "dubious ownership", the repo likely needs:
  `git config --global --add safe.directory D:/GithubProject/AI-PBB`

## Current Adaptation Bias

For this user's current business goal, treat the project as a static, polished VPP showcase. Favor convincing presentation, coherent navigation, realistic mock metrics, company branding, and stable demo flow over full operational correctness.
