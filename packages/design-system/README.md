# @truvar-ai/design-system

The Truvar.ai design system for React: accessible components built on [React Aria](https://react-spectrum.adobe.com/react-aria/), Arabic-first with full RTL, international phone and country inputs, charts and maps, voice AI components and the Truvar OS kit.

Docs: [design-system.truvar.ai](https://design-system.truvar.ai)

```sh
pnpm add @truvar-ai/design-system
```

Works with Next.js (App Router and Pages), Vite, Electron and any React 18 or 19 app.

## Use

```jsx
import "@truvar-ai/design-system/styles.css";
import { Button, TextField, PhoneField } from "@truvar-ai/design-system";

export function SignUp() {
  return (
    <form>
      <TextField label="Name" />
      <PhoneField label="Mobile" defaultCountry="EG" />
      <Button type="submit">Create account</Button>
    </form>
  );
}
```

Every component is a client component (`"use client"` is built in), so they work inside Next.js Server Component pages without wrappers.

## What's included

| Import | What | Styles |
|---|---|---|
| `@truvar-ai/design-system` | Core components: buttons, fields, selects, dates, dialogs, menus, tables, trees, toasts, cards, badges, phone and country inputs, flags, logo and brand marks | `styles.css` |
| `@truvar-ai/design-system/icons` | UI icons and stateful system icons (Wi-Fi, battery, mic, camera, devices) | none |
| `@truvar-ai/design-system/brand` | `Logo`, `OrbitMark`, `BrandAvatar`, `OrbitLoader` (also exported from the root) | `styles.css` |
| `@truvar-ai/design-system/charts` | `ChartCard`, sparklines, gauges, heatmaps, funnels, `WorldMap` (Recharts, d3) | `charts/styles.css` |
| `@truvar-ai/design-system/voice` | `CallPlayer`, `Transcript`, `CallLogs`, `LiveCall`, `WorkflowBuilder` (wavesurfer.js, React Flow) | `voice/styles.css` |
| `@truvar-ai/design-system/os` | Truvar OS kit: system bar, voice dock, agent task and approval cards, lock screen, permissions | `os/styles.css` |
| `@truvar-ai/design-system/tokens` | Design tokens as JS (`light`, `dark`); also `tokens.css` and `tokens.json` | `tokens.css` |

Heavy dependencies live behind their own import path, and unused components are removed by your bundler, so an app that only uses `Button` doesn't ship charts, maps or the waveform player.

## Fonts, Arabic and RTL

Load the four Google Fonts the tokens name (all SIL Open Font License):

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=Alexandria:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet" />
```

In Next.js, `next/font/google` works too. Name the families exactly as above.

- English uses Poppins (headings) and DM Sans (body); Arabic uses Alexandria and IBM Plex Sans Arabic. Mixed text picks the right face per letter.
- For Arabic, set `<html lang="ar" dir="rtl">` and wrap your app in React Aria's `<I18nProvider locale="ar-EG">`. Keyboard arrows, sliders, calendars, date order and numerals mirror automatically.
- Component CSS uses logical properties, so there is no separate RTL stylesheet.

## Themes

Light and dark are built in. Dark follows the system setting; force a theme with `<html data-theme="light">` or `data-theme="dark"`.

## License

MIT © Truvar.ai
