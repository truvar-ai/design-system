# Truvar Design System

The design system behind [Truvar.ai](https://truvar.ai): one set of design tokens and the components built on them, for React (Next.js, Vite, Electron) and, soon, Flutter and Figma. Arabic-first with full RTL, accessible by default on [React Aria](https://react-spectrum.adobe.com/react-aria/).

Docs: [design-system.truvar.ai](https://design-system.truvar.ai) · npm: [`@truvar-ai/design-system`](https://www.npmjs.com/package/@truvar-ai/design-system)

```sh
pnpm add @truvar-ai/design-system
```

```jsx
import "@truvar-ai/design-system/styles.css";
import { Button } from "@truvar-ai/design-system";
```

See the [package README](packages/design-system/README.md) for everything it includes.

## Repository

```
tokens/                     Source of truth: DTCG 2025.10 .tokens.json files + build.mjs (Style Dictionary)
packages/design-system/     npm @truvar-ai/design-system
  src/core/                 core components, phone and country inputs, flags
  src/brand/                logo, orbit mark, brand avatar, loader
  src/icons/                UI and system icons
  src/charts/               charts and maps
  src/voice/                call player, transcript, live call, workflow builder
  src/os/                   Truvar OS kit
apps/showcase/              internal playground: every component, English and Arabic, light and dark
starter/                    the original single-package starter, kept until the move is complete
```

Coming next: `apps/docs` (Next.js static site for design-system.truvar.ai), `packages/flutter` (`truvar_design_system` on pub.dev), `packages/mcp` and `figma/` (Code Connect).

## Develop

Requires Node 20+ and pnpm 10.

```sh
pnpm install
pnpm dev      # builds tokens and the package, then runs the showcase at http://localhost:5173
pnpm build    # builds everything
```

### Tokens

Edit the files in `tokens/`, never the generated CSS. Light values live in `$value`; dark values in `$extensions["ai.truvar.modes"].dark`. `pnpm build` regenerates `tokens.css`, `tokens.json` and `tokens.js` for every package.

### Releasing

Each pull request that changes the package adds a changeset (`pnpm changeset`). Versions and the changelog are generated from them.

## License

MIT © Truvar.ai
