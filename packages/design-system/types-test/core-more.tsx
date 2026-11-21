import * as React from "react";
import { parseDate } from "@internationalized/date";
import {
  ToggleButton, ToggleButtonGroup, SegmentButton, Link, FileTrigger, Toolbar, Separator, NumberField, CheckboxGroup, RadioCard, Form,
  DateField, TimeField, Calendar, RangeCalendar, DateRangePicker, ListBox, ListBoxSection, GridList, GridListItem, CommandMenu,
  Breadcrumbs, Disclosure, Accordion, Pagination, Drawer, ConfirmDialog, InfoPopover, MenuSection, SelectableMenuItem, Submenu,
  toast, toastQueue, ToastRegion, Banner, ProgressBar, Meter, Skeleton, NotificationList, NotificationDetail, NotificationCenter, UserMenu,
  Badge, Card, StatTile, Avatar, EmptyState, Table, TableHeader, Column, SelectionColumn, DragColumn, TableBody, Row, Cell, ResizableTable,
  Tree, TreeItem, ColorPickerPanel, ColorWheel, ColorSwatch, DropZone, useDragAndDrop, useListData, useFilter, isFileDropItem, useM, useFormat,
  type NotificationItem, type UserMenuItem, type UserMenuSeparator,
} from "@truvar-ai/design-system";
import { Logo, OrbitMark, BrandAvatar, OrbitLoader, BrandProvider, useBrand, BRANDS, EasySocialsMark, type BrandName } from "@truvar-ai/design-system/brand";
import * as Icon from "@truvar-ai/design-system/icons";
import { Search, Plus, WifiIcon, BatteryIcon, CloudIcon, MicIcon, type IconProps, type IconComponent } from "@truvar-ai/design-system/icons";
import tokens, { light, dark, brands, type TokenName } from "@truvar-ai/design-system/tokens";

const items: NotificationItem[] = [
  { id: "a", icon: <Icon.Mail />, title: "New reply", time: "2m", unread: true,
    detail: { from: "Mona", subject: "Re: pricing", body: "Hello", actions: [{ label: "Reply", onPress: (close) => close?.() }, { label: "Later", variant: "ghost" }], href: "/inbox/a" } },
  { id: 2, title: "Deal won" },
];
const menuItems: (UserMenuItem | UserMenuSeparator)[] = [
  { id: "profile", label: "Profile", icon: <Icon.User />, href: "/me" },
  { id: "keys", label: "Shortcuts", shortcut: "Ctrl+K", desktopOnly: true },
  { separator: true },
  { id: "out", label: "Log out", danger: true, icon: <Icon.LogOut /> },
];
interface Cmd { id: string; label: string }
const commands: Cmd[] = [{ id: "new", label: "New" }];

export function Demo() {
  const [page, setPage] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const m = useM();
  const f = useFormat();
  const brand: BrandName = useBrand();
  const { contains } = useFilter({ sensitivity: "base" });
  const list = useListData({ initialItems: [{ id: 1, name: "x" }] });
  const { dragAndDropHooks } = useDragAndDrop({ getItems: (keys) => [...keys].map((k) => ({ "text/plain": String(k) })) });
  const s: string = m.page(f.number(3, { style: "percent" })) + f.money(10) + f.moneyShort(1e6) + f.relative(2) + String(contains("ab", "a"));
  return (
    <BrandProvider brand="easysocials">
      <ToastRegion />
      <Logo width={200} tone="onDark" variant="monogram" brand="truvar" />
      <OrbitMark size={18} active activity="searching" title="x" />
      <BrandAvatar size={36} active activity="speaking" label="Layla" />
      <OrbitLoader label="Thinking" size={16} showLabel={false} />
      <EasySocialsMark size={32} title="ES" />
      <p>{BRANDS[brand]}{BRANDS.easysocials}{s}{list.items.length}</p>
      <ToggleButtonGroup selectionMode="single" aria-label="View"><SegmentButton id="a" icon={<Search />}>A</SegmentButton><SegmentButton id="b">B</SegmentButton></ToggleButtonGroup>
      <ToggleButton icon={<Plus />} onChange={(v) => v}>T</ToggleButton>
      <Link standalone href="#x">View</Link>
      <FileTrigger allowsMultiple acceptedFileTypes={[".csv"]} onSelect={(l) => l && [...l].map((x) => x.name)}><button>Pick</button></FileTrigger>
      <Toolbar aria-label="Fmt"><Separator orientation="vertical" /></Toolbar>
      <NumberField label="Seats" minValue={1} defaultValue={5} description="Hi" />
      <CheckboxGroup label="Ch" defaultValue={["a"]}><span>x</span></CheckboxGroup>
      <RadioCard value="starter" title="Starter" description="Up to 5" badge={<Badge tone="accent">Popular</Badge>} />
      <Form onSubmit={(e) => e.preventDefault()}><span /></Form>
      <DateField label="Start" defaultValue={parseDate("2026-01-01")} />
      <TimeField label="At" />
      <Calendar aria-label="c" /><RangeCalendar aria-label="r" />
      <DateRangePicker label="Range" description="d" />
      <ListBox aria-label="l" selectionMode="single"><ListBoxSection title="Contact"><span /></ListBoxSection></ListBox>
      <GridList aria-label="g" selectionMode="multiple" dragAndDropHooks={dragAndDropHooks} items={list.items}>
        {(c) => <GridListItem id={c.id} textValue={c.name} actions={<Plus />}>{c.name}</GridListItem>}
      </GridList>
      <CommandMenu label="Commands" placeholder="Type" items={commands} onAction={(id) => toast({ tone: "info", title: String(id) })} onCancel={() => {}} renderEmpty={() => "None"}>
        {(c) => <Icon.Check key={c.id} />}
      </CommandMenu>
      <Breadcrumbs items={[{ label: "W", href: "#a" }, { label: "Q3" }]} />
      <Accordion><Disclosure title="About" badge={<Badge>2</Badge>} defaultExpanded>x</Disclosure></Accordion>
      <Pagination page={page} pageCount={12} onChange={setPage} />
      <Drawer isOpen={open} onOpenChange={setOpen} side="start" width={520} title="T" subtitle="S" footer={({ close }) => <button onClick={close} />}>{({ close }) => <button onClick={close} />}</Drawer>
      <ConfirmDialog isOpen={open} onOpenChange={setOpen} tone="danger" requireText="Nile" icon={<Icon.AlertTriangle />} title="Del?" confirmLabel="Delete" size="full" onConfirm={() => toast({ tone: "danger", title: "Deleted" })}>Sure</ConfirmDialog>
      <InfoPopover title="How" trigger={<button>?</button>} placement="top">Body</InfoPopover>
      <MenuSection title="Sort" selectionMode="single" selectedKeys={["value"]} onSelectionChange={() => {}}><SelectableMenuItem id="value">Value</SelectableMenuItem></MenuSection>
      <Submenu label="Move" icon={<Icon.Folder />}><span /></Submenu>
      <Banner tone="warning" title="T" action={<button />} onDismiss={() => {}}>Body</Banner>
      <ProgressBar label="Up" value={50} valueLabel="50%" showValue={false} /><ProgressBar label="x" isIndeterminate />
      <Meter label="Storage" value={81} maxValue={100} statusText={{ warning: "Getting full" }} warnAt={70} />
      <Skeleton avatar lines={2} />
      <NotificationList items={items} onAction={(id) => String(id)} currentId="a" />
      <NotificationDetail item={items[0]!} onBack={() => {}} close={() => {}} headingLevel={2} />
      <NotificationCenter items={items} onMarkAllRead={() => {}} onOpenItem={(id) => id} viewAllHref="/inbox" />
      <UserMenu compact user={{ name: "Amira", email: "a@b.c", role: "Owner", src: "x.jpg" }} items={menuItems} onAction={(id) => String(id)} />
      <Card className="x" id="y"><Avatar name="Mona Fathy" size={40} tone="navy" /><StatTile label="L" value="1" delta="+3%" trend="down" good={false} /></Card>
      <EmptyState title="None" action={<button />}>Text</EmptyState>
      <ResizableTable>
        <Table aria-label="t" selectionMode="multiple" sortDescriptor={{ column: "name", direction: "ascending" }} onSortChange={() => {}} className="z">
          <TableHeader><SelectionColumn /><DragColumn /><Column id="name" isRowHeader allowsSorting resizable>Name</Column><Column id="v" align="end">V</Column><Column id="actions" aria-label="Actions" /></TableHeader>
          <TableBody items={list.items} renderEmptyState={() => <EmptyState title="x" />}>
            {(c) => <Row id={c.id}><Cell>{c.name}</Cell><Cell align="end">1</Cell></Row>}
          </TableBody>
        </Table>
      </ResizableTable>
      <Tree aria-label="tree" selectionMode="multiple"><TreeItem id="a" title="Docs" icon={<Icon.Folder />} cells={<span>1</span>}><TreeItem id="b" title="x" textValue="x" /></TreeItem></Tree>
      <ColorPickerPanel defaultValue="#001250" label="Label" swatches={["#001250", "#916625"]} />
      <ColorWheel defaultValue="hsl(40, 65%, 65%)" /><ColorSwatch color="#001250" />
      <DropZone getDropOperation={() => "copy"} onDrop={async (e) => e.items.filter(isFileDropItem).map((i) => i.name)}><span /></DropZone>
      <Icon.Search width={16} height={16} className="x" aria-label="s" />
      <Search strokeWidth={2} /><Icon.Alert aria-hidden="false" />
      <WifiIcon strength={2} label="Wi-Fi" size={24} /><WifiIcon off /><BatteryIcon level={0.15} charging /><CloudIcon state="syncing" /><MicIcon className="c" />
      <p style={{ color: light.primary, background: dark["surface"], border: brands.easysocials.dark["green-500"] }}>{tokens.light["ink"]}{brands.easysocials.light.primary}</p>
    </BrandProvider>
  );
}

const nm: TokenName = "space-4";
const ic: IconComponent = Search;
const pp: IconProps = { width: 10 };
export { nm, ic, pp, toastQueue };

// @ts-expect-error unknown brand
<Logo brand="nope" />;
// @ts-expect-error bad wifi strength
<WifiIcon strength={4} />;
// @ts-expect-error bad token
const bad: TokenName = "nope";
// @ts-expect-error bad tone
<Badge tone="gold" />;
// @ts-expect-error bad cloud state
<CloudIcon state="up" />;
// @ts-expect-error easysocials only token
light["green-500"];
