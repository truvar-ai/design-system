# @truvar-ai/design-system

The Truvar.ai design system for React: accessible components built on [React Aria](https://react-spectrum.adobe.com/react-aria/), Arabic-first with full RTL, international phone and country inputs, charts and maps, voice AI components and the Truvar OS kit.

Docs: [design-system.truvar.ai](https://design-system.truvar.ai)

```sh
pnpm add @truvar-ai/design-system
```

Works with Next.js (App Router and Pages), Vite, Electron and any React 18 or 19 app.

## Use

```jsx
import "@truvar-ai/design-system/fonts.css";
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
| `@truvar-ai/design-system` | Core components: buttons, bottom nav, fields, selects, dates, dialogs, menus, tables, trees, toasts, cards, badges, phone and country inputs, flags, logo and brand marks | `styles.css` |
| `@truvar-ai/design-system/icons` | UI icons and stateful system icons (Wi-Fi, battery, mic, camera, devices) | none |
| `@truvar-ai/design-system/brand` | `Logo`, `OrbitMark`, `BrandAvatar`, `OrbitLoader` (also exported from the root) | `styles.css` |
| `@truvar-ai/design-system/charts` | `ChartCard`, sparklines, gauges, heatmaps, funnels, `WorldMap` (Recharts, d3) | `charts/styles.css` |
| `@truvar-ai/design-system/voice` | `CallPlayer`, `Transcript`, `CallLogs`, `LiveCall`, `WorkflowBuilder` (wavesurfer.js, React Flow) | `voice/styles.css` |
| `@truvar-ai/design-system/os` | Truvar OS kit: system bar, voice dock, agent task and approval cards, lock screen, permissions | `os/styles.css` |
| `@truvar-ai/design-system/crm` | Conversations across every channel, AI handoff, contact records, call sheet, roles and permissions | `crm/styles.css` |
| `@truvar-ai/design-system/fonts.css` | The four brand fonts (Poppins, DM Sans, Alexandria, IBM Plex Sans Arabic), served from your own app | `fonts.css` |
| `@truvar-ai/design-system/tokens` | Design tokens as JS (`light`, `dark`); also `tokens.css` and `tokens.json` | `tokens.css` |

Heavy dependencies live behind their own import path, and unused components are removed by your bundler, so an app that only uses `Button` doesn't ship charts, maps or the waveform player.

## Fonts, Arabic and RTL

The four brand fonts come with the package. Import them once, before the styles:

```jsx
import "@truvar-ai/design-system/fonts.css";
import "@truvar-ai/design-system/styles.css";
```

Your bundler copies the font files into your app, so they're served from your own site with no request to Google. A page downloads only what its text needs (Latin, Latin Extended or Arabic). The fonts are under the SIL Open Font License, included as `dist/fonts/OFL.txt`.

To use your own fonts, load them yourself, leave out `fonts.css`, and set the two font tokens after `styles.css`. Keep an Arabic font second, so each script gets the right face:

```css
:root {
  --font-display: "Inter", "Noto Kufi Arabic", "Helvetica Neue", Arial, sans-serif;
  --font-body: "Inter", "Noto Sans Arabic", "Helvetica Neue", Arial, sans-serif;
}
```

For one brand only, put the same lines under `:root[data-brand="<name>"]`.

- English uses Poppins (headings) and DM Sans (body); Arabic uses Alexandria and IBM Plex Sans Arabic. Mixed text picks the right face per letter.
- For Arabic, set `<html lang="ar" dir="rtl">` and wrap your app in React Aria's `<I18nProvider locale="ar-EG">`. Keyboard arrows, sliders, calendars, date order and numerals mirror automatically.
- Component CSS uses logical properties, so there is no separate RTL stylesheet.

## Themes

Light and dark are built in. Dark follows the system setting; force a theme with `<html data-theme="light">` or `data-theme="dark"`.

### Brands

Truvar is the default brand. Other brands are set with `<html data-brand="<name>">` for their colours (light and dark), and `BrandProvider` tells `Logo` which mark to draw.

```jsx
import { BrandProvider, Logo } from "@truvar-ai/design-system";

document.documentElement.dataset.brand = "<name>";
<BrandProvider brand="<name>"><Logo /></BrandProvider>
```

Brand colours live in `tokens/brands/<name>.tokens.json`; each file overrides only the tokens that differ from Truvar's. Resolved values are in `@truvar-ai/design-system/tokens` as `brands.<name>.light` and `.dark`.

## Phones and touch

`styles.css` makes every component feel native on phones and correct with a mouse:

- **No tap flash:** no grey or blue box when you tap, and no stuck hover after a tap. Hover styles only apply on devices that can hover.
- **Pressed feedback:** buttons, icon buttons, tabs, segments and list items dim or shrink slightly while pressed.
- **Finger-sized targets:** on touch screens, icon buttons and small buttons get a 44px hit area without changing the layout.
- **Cursors:** pointer on anything that acts (including rows React Aria makes pressable), text where you type, grab and grabbing on handles, a crosshair in colour areas, and not-allowed on anything disabled.
- **No zoom on focus:** fields use 16px text, so iPhone doesn't zoom in when one is focused.

### BottomNav

The phone tab bar: 3 to 5 tabs, each an icon and a short label.

```jsx
import { BottomNav, BottomNavItem } from "@truvar-ai/design-system";

<BottomNav mobileOnly aria-label="Main">
  <BottomNavItem href="/" icon={<Home />} isCurrent>Home</BottomNavItem>
  <BottomNavItem href="/inbox" icon={<Mail />} badge={4} badgeLabel=", 4 unread">Inbox</BottomNavItem>
  <BottomNavItem icon={<User />} onPress={openSettings}>Settings</BottomNavItem>
</BottomNav>
```

- **Links and buttons:** an item with `href` is a link (wrap your app in React Aria's `RouterProvider` for Next.js routing); an item with `onPress` is a button, for a tab that opens a sheet.
- **Back to top:** pressing the current tab again scrolls to the top, or calls `onReselect`.
- **Layout:** the bar sits above the iPhone home indicator. `mobileOnly` hides it from 961px wide. While the bar is shown, `--bottomnav-space` holds its height, so pad your scrolling content with it; toasts move above it automatically. Use `inline` to place it inside a preview or phone frame instead of fixing it to the screen.
- **Badges:** numbers are shown in the reader's digits and capped at 99+; `badge={true}` shows a dot.

`Sheet` can also be opened from code: pass `isOpen` and `onOpenChange` and leave out `trigger`.

## Conversations, contacts and teams

`@truvar-ai/design-system/crm` is a unified inbox and CRM kit. Import its stylesheet once:

```jsx
import "@truvar-ai/design-system/crm/styles.css";
import { ConversationInbox } from "@truvar-ai/design-system/crm";

<ConversationInbox conversations={conversations} messages={messagesById} contacts={contactsById}
  team={team} me={me} savedReplies={savedReplies} templates={templates}
  onSuggest={(conversation, messages) => askYourModel(conversation, messages)}
  profileHref={(contact) => `/contacts/${contact.id}`} aiResumeAfter={15} />
```

The inbox fits itself to the space it gets: three panes (list, thread, contact) when there's room, two on tablets, one at a time on phones. Every piece also works on its own:

| Piece | What it does |
|---|---|
| `ChannelBadge`, `ChannelIcon`, `ChannelLabel`, `ChannelAvatar` | 19 channels: WhatsApp, Instagram, Messenger, Facebook, Telegram, TikTok, X, Threads, LinkedIn, YouTube, Google Business, Snapchat, Viber, LINE, WeChat, SMS, email, phone and website chat. Brand marks from Simple Icons (CC0) |
| `ConversationList` | Avatar with the channel on its corner, unread count, who's handling it, a waiting time that turns red past the SLA, bulk selection |
| `MessageThread`, `MessageBubble` | Text, photo, file, voice note, call, internal note and event messages; sent, delivered, read and failed receipts |
| `Composer` | Reply or internal note, reply-via channel, emoji, files, saved replies, an AI suggestion, and approved templates once WhatsApp's 24-hour window has closed. Enter sends |
| `AiAgentBar`, `useAiHandoff` | The AI agent answers until a person takes over. While a person handles it, a timer runs and restarts with every reply; if no one replies before it ends, the AI agent resumes. `resumeAfter` is in minutes; `null` keeps it paused |
| `ContactPanel` | Details, every channel, first source and campaign, deal, tags, history and an AI summary |
| `ContactHeader`, `PropertyList`, `ActivityTimeline`, `CallSheet` | A contact record: quick actions, editable properties, everything that happened, and calling from the page |
| `RoleList`, `PermissionMatrix` | Roles and what each can view, create, edit, delete and export, with access to their own, their team's or everyone's records. On narrow screens each row becomes a card |

Text follows the `I18nProvider` locale (English or Arabic), and everything mirrors right to left.

## Links

Docs: [design-system.truvar.ai](https://design-system.truvar.ai) · Website: [truvar.ai](https://truvar.ai) · [LinkedIn](https://www.linkedin.com/company/truvar-ai) · [YouTube](https://www.youtube.com/@Truvar-d8b) · [Instagram](https://www.instagram.com/truvar.ai/) · [Facebook](https://www.facebook.com/truvar.ai.global) · [npm](https://www.npmjs.com/org/truvar-ai) · [business@truvar.ai](mailto:business@truvar.ai)

## License

MIT © [Truvar.ai](https://truvar.ai)
