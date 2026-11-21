---
"@truvar-ai/design-system": minor
---

Ships TypeScript declarations for every entry point (`@truvar-ai/design-system`, `/brand`, `/icons`, `/charts`, `/voice`, `/os`, `/crm`, `/widget` and `/tokens`). Components, hooks and constants are fully typed: each component exports its props type (for example `ButtonProps`), and the CRM, widget, OS and voice kits export their domain types (`Conversation`, `Message`, `ChannelId`, `Contact`, `Role` and more). Works with `moduleResolution` `bundler` and `nodenext`; needs TypeScript 5.4 or newer and `@types/react` (an optional peer dependency, so JavaScript projects are unaffected). There are no runtime changes.
