# @truvar/ui 0.7 (starter)

Truvar.ai components on top of React Aria Components.

- `src/tokens.css` — Truvar tokens as CSS variables (light + dark), from the Truvar.ai design system's tokens.json
- `src/components/index.jsx` — the components (Button, TextField, Select, ComboBox, DatePicker, Tabs, Menu, Modal, Tooltip, Slider, TagGroup, Checkbox, Switch, RadioGroup) plus two extension examples: ConfirmButton (custom behaviour) and Rating (new component)
- `src/components/styles.css` — component styles, keyed off React Aria's data-* state attributes
- `src/components/index.jsx` also exports `Logo` (wordmark/monogram, swaps art with the theme) and `BrandAvatar`
- `logos/` — transparent PNGs: `*-light.png` for light grounds, `*-dark.png` reversed for dark grounds and the navy field (derived from the originals; replace with designer-made files when you have them)
- `src/showcase.jsx` — the demo page

Build the demo: `npm install && npx esbuild src/entry.jsx --bundle --jsx=automatic --outdir=dist`

## Fonts and RTL

- English: Poppins (headings) + DM Sans (body). Arabic: Alexandria (headings) + IBM Plex Sans Arabic (body). All four are free on Google Fonts (SIL Open Font License).
- The font tokens list the English face first and the Arabic face second, so mixed text picks the right font per letter automatically.
- Wrap your app in React Aria's `<I18nProvider locale="ar-EG">` and set `<html lang="ar" dir="rtl">`. React Aria then mirrors keyboard arrows, slider, calendar week start, weekends, date order and numerals.
- Component CSS uses logical properties (`margin-inline-start`, `inset-inline-start`), so layouts mirror without separate RTL stylesheets.
- `useMessages()` gives components their built-in English and Arabic strings.

## What's in 0.2

- `src/components/index.jsx` — core components, Logo, OrbitMark / BrandAvatar / OrbitLoader, SearchField
- `src/components/more.jsx` — the rest of React Aria (dates, number field, checkbox group, list box, grid list, autocomplete,
  breadcrumbs, disclosure/accordion, drawer, confirm dialog, popover, submenus, toasts, progress, meter, table, tree,
  colour pickers, drop zone) plus brand components (badge, card, stat tile, avatar, empty state, skeleton, banner, pagination,
  notification centre)
- `src/docs/` — the documentation site: shell (`showcase.jsx`), navigation map (`nav.js`), sample CRM data, record panel, views

Notes
- Toasts use React Aria's `UNSTABLE_Toast*` API, which may change in a future release.
- Expandable rows are built on `Tree`; React Aria's `Table` has no public row-expansion API in 1.22.
- Each component has a shareable link: `#token` (see `nav.js`). Language is remembered in the browser.

## Phase 1 (0.3): international input

- `src/components/intl.jsx`: `PhoneField`, `CountryPicker`, `LanguageSelect`
- `src/components/Flag.jsx`: `<Flag code="EG" size={20} shape="rect|circle" />`
- `src/components/countries.js`: `COUNTRIES` (ISO, dialling code, English and Arabic names), `cleanPhoneInput`, `toLatinDigits`

Dependencies added (both MIT, pinned):
- `country-flag-icons@1.6.20`: SVG flags
- `libphonenumber-js@1.13.15`: phone parsing, formatting and validation (uses the `max` metadata so it can tell mobile from landline)

PhoneField stores one format (E.164, e.g. `+201002345678`) through `onChange({ e164, country, isValid })`.
Formatting follows libphonenumber's official national formats, e.g. Egyptian mobiles show as `010 02345678`.

## Phase 2 (0.4): the rest of React Aria

`src/components/phase2.jsx`:
- `Sheet`: SheetTrigger + SheetOverlay + Sheet (bottom, top, start, end, center; swipe to close; snap points)
- `PromptEditor`: TokenField + TokenInput + Token, text with inline variables; insert with `value.replaceRangeWithSegments`
- `SwitchRow`, `CheckboxRow`, `RadioRow`: SwitchField / CheckboxField / RadioField with descriptions
- `CalendarWithPickers`: CalendarMonthPicker + CalendarYearPicker
- `MultiSelect`, `MultiComboBox`: selectionMode="multiple" with chips (SelectValue / ComboBoxValue)
- `NavTree`: NavigationTree with sections, nesting, current route (use inside RouterProvider)
- `Kbd`: Keyboard; `PreviewCard`: PreviewTrigger hover card
- `SelectionIndicator`: animated indicator now built into `Tab`, `SegmentedControl` and `SegmentButton`
- Re-exported for large collections: Virtualizer, ListLayout, GridLayout, WaterfallLayout, TableLayout,
  ListBoxLoadMoreItem, TableLoadMoreItem, GridListSection, GridListHeader, TableFooter

Demos: `src/docs/views/Phase2.jsx` and the new "Large collections" page (`Collections.jsx`).

Not covered: TreeSection/TreeHeader as a standalone demo (used inside NavigationTree), and SharedElement
outside the selection indicators.

## Phase 3 (0.5): charts and maps

Dependencies added (pinned, all at least two weeks old when added):
- `recharts@3.10.1` (MIT), with `react-is@18.3.1`
- `d3-geo@3.1.1`, `d3-zoom@3.0.0`, `d3-selection@3.0.0` (ISC)
- `topojson-client@3.1.0` (ISC); dev only: `topojson-server@3.0.1` (ISC)

`src/components/charts.jsx`
- `ChartCard`: title, legend, Chart/Table toggle, screen-reader summary
- `tooltipProps`, `axisProps`, `gridProps`, `useChartLocale` (locale numbers; reversed time axis in Arabic)
- `Sparkline`, `Gauge` (SVG), `Heatmap` (CSS grid), `FunnelBars` and `RankedBars` (HTML lists that mirror in Arabic)
- Colour tokens `--chart-1` … `--chart-6`, matching label colours `--chart-ink-*`, and `--map-*` (tokens.css)

`src/components/maps.jsx`
- `WorldMap`: choropleth, region focus (continents + Middle East & North Africa), zoom/pan (mouse, buttons,
  keyboard: arrows, + − 0), hover tooltip, selection, live markers, Table view
- `pov="EG"` (default) follows Egypt's official view: Taiwan → China, Northern Cyprus → Cyprus,
  Somaliland → Somalia. `pov="default"` draws Natural Earth's de facto borders. Halaib is Egyptian in both.

Map data: Natural Earth 1:110m admin-0 countries (public domain), reduced to the fields we use.
Rebuild with `node build-geo.mjs` (source GeoJSON in `geo-src/`). Countries too small for this scale
(e.g. Bahrain, Singapore) have no shape; show them with markers or in the table.

## Phase 4 (0.6): voice AI components

Dependencies added (pinned):
- `wavesurfer.js@7.12.12` (BSD-3-Clause): waveform drawing. 7.x on purpose; 8.x was a month old.
- `@xyflow/react@12.12.0` (MIT; depends on zustand, classcat, @xyflow/system, all MIT): workflow canvas

`src/components/voice/`
- `CallSessionProvider` + `useCall`: one audio element with a Web Audio gain per channel. Player, transcript
  and logs inside the same provider stay in sync. Expects `recording = { left, right, sampleRate, duration }`
  (Float32Array channels); for real calls decode your stereo file with `AudioContext.decodeAudioData`.
- `CallPlayer` (stereo waveform, per-channel mute/solo, event markers, skip silence, speed, stereo/mono WAV
  download, expanded modal with a side panel), `MiniPlayer`, `StereoWaveform`
- `Transcript` (follows audio, click to seek, per-reply feedback with reasons), `CallLogs` (level filters,
  search, click to seek), `CostBreakdown`, `JsonView`, `CodeBlock`, `CopyButton`
- `LiveCall`: idle → connecting → live → ended; wire `onStart` / `onEnd` to your WebRTC/telephony client
- `WorkflowBuilder`: start, say (TokenField variables), API request, condition, branch, transfer and end nodes,
  side inspector, add/delete, JSON export, publish confirmation
- `audio.js`: `synthCall` (demo audio), `encodeWav`, `mixToMono`, `findSilences`, `formatClock`

Notes
- wavesurfer quirk handled in `StereoWaveform`: always pass the session's `url` with `media`, or wavesurfer
  clears the media source; unplayed colours must be opaque because the progress layer is a mask of them.
- The waveform and workflow canvas stay left to right in Arabic (time and diagrams); the UI around them mirrors.
- Inside a published claude.ai page, script-started downloads may be blocked; they work in your apps.

## Phase 5 (0.7): Truvar OS kit

No new dependencies.

`src/components/os/SystemIcons.jsx`: stateful system icons (`WifiIcon strength|off`, `BatteryIcon level|charging`,
`CloudIcon state`), privacy (mic, camera), connectivity, devices, smart home, and capability icons. Pass `label`
for screen readers; without it an icon is decorative.

`src/components/os/OSKit.jsx`
- `SystemBar` (assistant orb, privacy pills for mic/camera in words, devices, cloud, Wi-Fi, battery, clock, user)
- `VoiceDock` (idle / listening / thinking), `ListeningView` (live words, unfinished part lighter, run/cancel)
- `AgentTaskCard` (steps: done / active / pending / approval, progress), `ApprovalCard` (alertdialog: exact preview,
  yes/no by tap or voice), `DoneCard` (result, follow-up question, day's tally)
- `NotificationCard`, `NotificationStack`, `OSTaskCard`, `AppWindow` + `AgentCursor`, `DeviceCard`, `SmartTile`,
  `PermissionRow` (on its own = gold, ask first = navy, never = red), `LockScreen`, `useNow`, `formatTime`, `formatDay`
- `--os-canvas` token: the OS background (ivory with a soft gold wash; graphite in dark)

Docs: `src/docs/views/OS.jsx` (clickable prototype + one page per area) and `src/docs/osText.js`.
OS Arabic copy follows the product's Egyptian voice from the concept; the rest of the library uses Modern Standard Arabic.
