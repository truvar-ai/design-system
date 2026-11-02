---
"@truvar-ai/design-system": patch
---

Country names and their alphabetical order (phone field, country picker, maps) now come with the package instead of the browser's Intl data. Node and each browser ship different name data, so server-rendered pages in Next.js didn't match the browser and React threw a hydration error. Run `pnpm build:countries` to refresh the names.
