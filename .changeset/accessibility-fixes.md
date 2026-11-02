---
"@truvar-ai/design-system": patch
---

Accessibility and bundle size. `ChartCard`, `OSTaskCard`, `AppWindow` and `DeviceCard` take `headingLevel` (3 by default, was a fixed 4) so their titles fit the page's heading order. `Slider` with only `aria-label` no longer renders an empty label, so screen readers hear its name. The solid danger button keeps readable text in dark mode when the theme follows the device. Flags and phone number data are now separate files in the package: apps that don't render `Flag`, `PhoneField` or `CountryPicker` no longer download them.
