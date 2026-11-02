---
"@truvar-ai/design-system": patch
---

Server rendering (Next.js) without hydration errors. Every number, date and amount the components show now comes out exactly the same on the server and in every browser. Add `numberFormat`, `dateFormat` and `relativeTimeFormat`: drop-in replacements for `new Intl.NumberFormat`, `new Intl.DateTimeFormat` and `new Intl.RelativeTimeFormat`, for your own formatting. The call player reads its theme colours after it mounts, so pages with it can render on the server.
