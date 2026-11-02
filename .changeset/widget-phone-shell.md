---
"@truvar-ai/design-system": patch
---

Add `@truvar-ai/design-system/widget`: an embeddable website assistant with text, voice notes and live voice calls, agent steps, time slots, inline forms, approvals, choice cards and results (`WebWidget`, plus each part on its own). On phones it takes over the screen like an app. Add phone app pieces: `PushLayout`, a side menu that slides the whole app aside; `useHideOnScroll`, bars that step aside while you read; `useSystemBars`, the phone's status bar following the page and dimming with open sheets. `BottomNav` takes `isHidden`. `UserMenu` opens as a bottom sheet on phones. Closing the push menu no longer shows the menu around the app as it slides back.
