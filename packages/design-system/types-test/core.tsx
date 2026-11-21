import * as React from "react";
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import {
  Button, IconButton, TextField, Checkbox, Switch, RadioGroup, Radio, Item, Select, ComboBox, TagGroup, Tag,
  Tabs, TabList, Tab, TabPanel, Slider, DatePicker, MenuButton, MenuItem, MenuSeparator, Modal, Tooltip,
  SegmentedControl, SearchField, ConfirmButton, Rating, useMessages,
  PhoneField, CountryPicker, LanguageSelect, LANGUAGES, COUNTRIES, countryByCode, sortedCountries, cleanPhoneInput, toLatinDigits, countryMatches,
  Flag, numberFormat, dateFormat, relativeTimeFormat, Sheet, PromptEditor, TokenFieldValue, SwitchRow, CheckboxRow, RadioRow,
  CalendarWithPickers, MultiSelect, MultiComboBox, LoadMoreIndicator, NavTree, Kbd, PreviewCard, SelectionIndicator,
  Virtualizer, ListLayout, GridLayout, WaterfallLayout, TableLayout, Collection, RouterProvider, ListBoxLoadMoreItem,
  TableLoadMoreItem, GridListSection, GridListHeader, TableFooter,
  BottomNav, BottomNavItem, useSystemBars, PushLayout, useHideOnScroll, Logo, OrbitMark,
} from "@truvar-ai/design-system";
import type { PhoneValue, Country, NavTreeSection } from "@truvar-ai/design-system";

export const _l = [Virtualizer, ListLayout, GridLayout, WaterfallLayout, TableLayout, Collection, ListBoxLoadMoreItem, TableLoadMoreItem, GridListSection, GridListHeader, TableFooter];
const Icon = () => <svg />;

export function Demo() {
  const m = useMessages();
  const [lang, setLang] = React.useState("en");
  const [menu, setMenu] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [value, setValue] = React.useState(() => new TokenFieldValue([{ type: "text", text: "Hi " }, { type: "token", text: "First name", value: "first_name" }]));
  const [hidden, setHidden] = useHideOnScroll(() => document.getElementById("content"), { media: "(max-width: 960px)", disabled: menu, resetKey: "/x" });
  const ref = React.useRef<HTMLDivElement>(null);
  useHideOnScroll(ref);
  useSystemBars(["truvar", "dark"]);
  const num = (v: number) => numberFormat("ar-EG", { style: "percent", signDisplay: "always" }).format(v);
  const dt = dateFormat("en-US", { day: "numeric", month: "short" }).format(new Date());
  const rel = relativeTimeFormat("en", { numeric: "auto" }).format(-1, "day");
  const sections: NavTreeSection[] = [
    { id: "work", label: { en: "Workspace", ar: "مساحة العمل" }, items: [
      { id: "home", href: "/home", label: { en: "Home", ar: "الرئيسية" }, icon: <Icon /> },
      { id: "calls", href: "/calls", label: { en: "Calls", ar: "المكالمات" }, children: [{ id: "t", href: "/calls/today", label: { en: "Today", ar: "اليوم" }, badge: 14 }] },
    ] },
  ];
  const c: Country | undefined = countryByCode("EG");
  const sorted: Country[] = sortedCountries("ar");
  const matches: boolean = countryMatches(COUNTRIES[0]!, "eg");
  const clean: string = cleanPhoneInput("tel:+20 (0)100") + toLatinDigits("٢٠");
  const sources = [{ id: "hs", name: "HubSpot", desc: "CRM" }, { id: "sf", name: "Salesforce", desc: "CRM" }];
  const tags = [{ id: "a", name: "A" }];
  return (
    <div ref={ref}>
      <p>{m.of("1", "5")} {m.choose} {num(0.2)} {dt} {rel} {c?.dial} {sorted.length} {String(matches)} {clean}</p>
      <Button variant="secondary" size="sm" onPress={() => {}} isPending>Save</Button>
      <Button>{(rp) => (rp.isPending ? "…" : "Go")}</Button>
      <IconButton label="Download"><Icon /></IconButton>
      <TextField label="Name" description="d" errorMessage="bad" isRequired type="email" onChange={(v: string) => v} multiline placeholder="x" />
      <Checkbox defaultSelected isIndeterminate>Remember</Checkbox>
      <Switch onChange={(on: boolean) => on}>Dark</Switch>
      <RadioGroup label="Plan" defaultValue="growth" orientation="horizontal" cards onChange={(v: string) => v}>
        <Radio value="growth">Growth</Radio>
        <RadioRow value="x" label="X" description="y" />
      </RadioGroup>
      <Select label="Source" items={sources} defaultSelectedKey="hs" onSelectionChange={(k) => k}>
        {(s) => <Item id={s.id} textValue={s.name} description={s.desc} icon={<Icon />}>{s.name}</Item>}
      </Select>
      <Select label="Static"><Item id="a">A</Item><Item id={3}>B</Item></Select>
      <ComboBox label="Assign" placeholder="Search" items={sources}>{(p) => <Item id={p.id}>{p.name}</Item>}</ComboBox>
      <TagGroup label="Filter" selectionMode="multiple" defaultSelectedKeys={["o0"]}>
        <Tag id="o0">One</Tag>
      </TagGroup>
      <TagGroup label="Applied" items={tags} onRemove={(keys) => keys.has("a")}>{(x) => <Tag id={x.id}>{x.name}</Tag>}</TagGroup>
      <Tabs defaultSelectedKey="a"><TabList aria-label="t"><Tab id="a">A</Tab><Tab id="b">B</Tab></TabList><TabPanel id="a">a</TabPanel><TabPanel id="b">b</TabPanel></Tabs>
      <Slider label="Threshold" defaultValue={80} minValue={50} maxValue={99} formatOptions={{ style: "unit", unit: "percent" }} />
      <Slider label="Deal" defaultValue={[2, 8]} thumbLabels={["Min", "Max"]} step={1} onChange={(v) => v} />
      <DatePicker label="Send on" defaultValue={today(getLocalTimeZone())} minValue={new CalendarDate(2026, 1, 1)} isDateUnavailable={(d) => d.day === 1} description="d" />
      <MenuButton label="Actions" onAction={(k) => String(k)}>
        <MenuItem id="edit" icon={<Icon />}>Edit</MenuItem>
        <MenuSeparator />
        <MenuItem id="del" danger>Delete</MenuItem>
      </MenuButton>
      <MenuButton label="More" icon={<Icon />}><MenuItem id="a">A</MenuItem></MenuButton>
      <Modal trigger={<Button>Open</Button>} title="Share">{({ close }) => <Button onPress={close}>Close</Button>}</Modal>
      <Tooltip content="Hi" placement="top" delay={100}><IconButton label="Info"><Icon /></IconButton></Tooltip>
      <SegmentedControl aria-label="Language" value={lang} onChange={setLang} options={[{ id: "en", label: "EN" }, { id: "ar", label: "ع", lang: "ar" }]} />
      <SegmentedControl<"a" | "b"> aria-label="Ab" value="a" options={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} onChange={(id) => id} />
      <SearchField label="Search" placeholder="Name" value="" onChange={() => {}} onSubmit={() => {}} />
      <ConfirmButton onConfirm={() => {}} confirmLabel="Sure?" size="sm">Delete</ConfirmButton>
      <Rating label="Useful?" labels={["Poor", "Good"]} value={rating} onChange={setRating} />
      <PhoneField label="Mobile" defaultCountry="EG" isRequired onChange={(v: PhoneValue) => v.e164} name="phone" />
      <CountryPicker value="EG" onChange={(code) => code.toLowerCase()} showName showDial />
      <LanguageSelect value="en" onChange={(id) => id} languages={LANGUAGES} compact />
      <Flag code="EG" size={28} title="Egypt" shape="circle" />
      <Sheet position="bottom" snapPoints={["50%", "100%"]} title="Opts" trigger={<Button>Bottom</Button>}
        footer={({ close }) => <Button onPress={close}>Cancel</Button>}>x</Sheet>
      <Sheet position="start" isOpen={menu} onOpenChange={setMenu}>y</Sheet>
      <PromptEditor label="First" variables={[{ id: "first_name", label: { en: "First", ar: "الأول" }, example: { en: "N", ar: "ن" } }]} value={value} onChange={setValue} placeholder="p" />
      <SwitchRow icon={<Icon />} defaultSelected label="Calls" description="d" onChange={(b: boolean) => b} />
      <CheckboxRow isRequired label="Mask" description="d" />
      <CalendarWithPickers aria-label="Signed" defaultValue={today(getLocalTimeZone()).subtract({ years: 2 })} />
      <MultiSelect label="Langs" items={[{ id: "en", name: { en: "English", ar: "الإنجليزية" } }]} defaultValue={["en"]} placeholder="Choose" />
      <MultiComboBox label="Route" items={[{ id: "sales", name: { en: "Sales", ar: "المبيعات" } }]} defaultValue={["sales"]} placeholder="Search" />
      <LoadMoreIndicator label="Loading" />
      <RouterProvider navigate={(to: string) => to}>
        <NavTree ariaLabel="Nav" selectedRoute="/calls/today" sections={sections} defaultExpandedKeys={["calls"]} />
      </RouterProvider>
      <Kbd>⌘K</Kbd>
      <PreviewCard trigger={<a href="#x">x</a>}>card</PreviewCard>
      <SelectionIndicator className="x" />
      <BottomNav mobileOnly isHidden={hidden} aria-label="Docs">
        <BottomNavItem href="/" icon={<Icon />} isCurrent>Home</BottomNavItem>
        <BottomNavItem icon={<Icon />} badge={3} aria-haspopup="dialog" onPress={() => setHidden(false)}>Search</BottomNavItem>
        <BottomNavItem icon={<Icon />} badge onReselect={() => {}} badgeLabel="new">Chats</BottomNavItem>
      </BottomNav>
      <BottomNav inline aria-label="Demo"><BottomNavItem icon={<Icon />}>Home</BottomNavItem></BottomNav>
      <PushLayout isOpen={menu} onOpenChange={setMenu} label="Pages" width={300} menu={({ close }) => <Button onPress={close}>x</Button>}>app</PushLayout>
      <Logo /><OrbitMark />
    </div>
  );
}
