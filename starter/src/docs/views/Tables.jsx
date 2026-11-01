import React, { useState, useMemo } from "react";
import {
  Table, TableHeader, Column, TableBody, Row, Cell, SelectionColumn, DragColumn, ResizableTable, Tree, TreeItem,
  Badge, Avatar, Button, MenuButton, MenuItem, EmptyState, OrbitLoader, ToggleButtonGroup, SegmentButton, toast,
  useFormat, useListData, useDragAndDrop,
} from "../../components/index.jsx";
import * as Icon from "../../components/icons.jsx";
import { useTr, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { TableFooterSpec, InfiniteTableSpec, VirtualTableSpec } from "./Phase2.jsx";
import { CONTACTS, OWNERS, stageOf, ownerOf } from "../data.js";

function useL() { const lang = useLang(); return (o) => (lang === "ar" ? o.ar : o.en); }

export function Tables() {
  const tr = useTr(); const L = useL(); const f = useFormat();
  const [sort, setSort] = useState({ column: "value", direction: "descending" });
  const sorted = useMemo(() => {
    const k = { name: (c) => L(c), company: (c) => c.company, value: (c) => c.value, days: (c) => c.days }[sort.column];
    const d = sort.direction === "descending" ? -1 : 1;
    return [...CONTACTS].sort((a, b) => (k(a) > k(b) ? 1 : k(a) < k(b) ? -1 : 0) * d).slice(0, 6);
  }, [sort, L]);
  const [sel, setSel] = useState(new Set([2, 3]));
  const selCount = sel === "all" ? 5 : sel.size;
  const [state, setState] = useState("loading");

  const list = useListData({ initialItems: [
    { id: "p1", en: "Call Delta Freight about renewal", ar: "الاتصال بـ Delta Freight بخصوص التجديد", owner: "omar", due: 0 },
    { id: "p2", en: "Send Nile Foods the pilot plan", ar: "إرسال خطة التجربة إلى Nile Foods", owner: "amira", due: 1 },
    { id: "p3", en: "Review Aswan Solar contract", ar: "مراجعة عقد Aswan Solar", owner: "amira", due: 2 },
    { id: "p4", en: "Book demo with Cairo Fintech", ar: "حجز عرض توضيحي مع Cairo Fintech", owner: "laila", due: 3 },
  ]});
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((k) => ({ "text/plain": L(list.getItem(k)) })),
    onReorder(e) { e.target.dropPosition === "before" ? list.moveBefore(e.target.key, e.keys) : list.moveAfter(e.target.key, e.keys); },
  });

  const regions = [
    { id: "cairo", en: "Greater Cairo", ar: "القاهرة الكبرى", deals: 41, value: 9200000, children: [
      { id: "c-ent", en: "Enterprise team", ar: "فريق المؤسسات", deals: 17, value: 6100000, children: [
        { id: "amira", person: 1, en: "Amira Hassan", ar: "أميرة حسن", deals: 9, value: 3400000 }, { id: "omar", person: 1, en: "Omar Farouk", ar: "عمر فاروق", deals: 8, value: 2700000 }] },
      { id: "c-smb", team: 1, en: "SMB team", ar: "فريق الشركات الصغيرة", deals: 24, value: 3100000 }] },
    { id: "alex", en: "Alexandria", ar: "الإسكندرية", deals: 18, value: 3800000, children: [
      { id: "laila", person: 1, en: "Laila Mansour", ar: "ليلى منصور", deals: 11, value: 2500000 }, { id: "youssef", person: 1, en: "Youssef Nabil", ar: "يوسف نبيل", deals: 7, value: 1300000 }] },
    { id: "delta", en: "Delta", ar: "الدلتا", deals: 9, value: 1400000 },
  ];
  const renderRegion = (r) => (
    <TreeItem key={r.id} id={r.id} title={L(r)} icon={r.person ? <Icon.User /> : (r.team || r.id.startsWith("c-")) ? <Icon.Users /> : <Icon.Building />}
      cells={<div className="tv-tree-cells"><span>{f.number(r.deals)}</span><span>{f.money(r.value)}</span></div>}>
      {r.children?.map(renderRegion)}
    </TreeItem>
  );

  const Person = ({ c }) => <div className="tv-cell-person"><Avatar name={L(c)} size={28} /><b>{L(c)}</b></div>;

  return (
    <>
      <ViewHeader viewId="data" intro={tr("Tables are built on React Aria's Table, so keyboard navigation, selection, sorting and screen-reader announcements work the same in every one.", "الجداول مبنية على مكوّن Table من React Aria، فيعمل التنقل بلوحة المفاتيح والتحديد والترتيب وإعلانات قارئات الشاشة بالطريقة نفسها في كل جدول.")} />
      <Spec id="simple-table" name={tr("Simple table", "جدول بسيط")} primitive="Table" note={tr("Numbers align to the end and use tabular figures.", "الأرقام تُحاذى إلى النهاية بأرقام متساوية العرض.")} wide>
        <div className="tv-table-scroll">
          <Table aria-label={tr("Top deals", "أهم الصفقات")}>
            <TableHeader>
              <Column isRowHeader>{tr("Company", "الشركة")}</Column>
              <Column>{tr("Stage", "المرحلة")}</Column>
              <Column align="end">{tr("Value", "القيمة")}</Column>
            </TableHeader>
            <TableBody items={CONTACTS.slice(0, 4)}>
              {(c) => <Row id={c.id}><Cell>{c.company}</Cell><Cell>{L(stageOf(c.stage))}</Cell><Cell align="end">{f.money(c.value)}</Cell></Row>}
            </TableBody>
          </Table>
        </div>
      </Spec>
      <Spec id="sortable-table" name={tr("Sortable table", "جدول قابل للترتيب")} primitive="Table + sortDescriptor" note={tr("Click a header, or focus it and press Enter. The sort direction is announced.", "اضغط على عنوان العمود أو ركّز عليه واضغط Enter، ويُعلن اتجاه الترتيب.")} wide>
        <div className="tv-table-scroll">
          <Table aria-label={tr("Contacts", "جهات الاتصال")} sortDescriptor={sort} onSortChange={setSort}>
            <TableHeader>
              <Column id="name" isRowHeader allowsSorting>{tr("Name", "الاسم")}</Column>
              <Column id="company" allowsSorting>{tr("Company", "الشركة")}</Column>
              <Column id="value" allowsSorting align="end">{tr("Deal value", "قيمة الصفقة")}</Column>
              <Column id="days" allowsSorting>{tr("Last activity", "آخر نشاط")}</Column>
            </TableHeader>
            <TableBody items={sorted}>
              {(c) => <Row id={c.id}><Cell><Person c={c} /></Cell><Cell>{c.company}</Cell><Cell align="end">{f.money(c.value)}</Cell><Cell><span className="tv-desc">{f.relative(c.days)}</span></Cell></Row>}
            </TableBody>
          </Table>
        </div>
      </Spec>
      <Spec id="selectable-table" name={tr("Selection and bulk actions", "التحديد والإجراءات الجماعية")} primitive="Table selectionMode=multiple" note={tr("Shift-click selects a range. The bulk bar replaces the toolbar while rows are selected.", "الضغط مع Shift يحدد نطاقًا، وشريط الإجراءات الجماعية يحل محل شريط الأدوات أثناء التحديد.")} wide>
        <div className="stack">
          <div className="bulk-bar" aria-live="polite">
            {selCount > 0 ? <>
              <b>{tr(`${selCount} selected`, `تم تحديد ${f.number(selCount)}`)}</b>
              <MenuButton label={tr("Assign owner", "إسناد إلى")} onAction={(k) => toast({ tone: "success", title: tr("Owner updated", "تم تغيير المسؤول"), description: L(ownerOf(k)) })}>
                {OWNERS.map((o) => <MenuItem key={o.id} id={o.id}>{L(o)}</MenuItem>)}
              </MenuButton>
              <Button variant="ghost" onPress={() => setSel(new Set())}>{tr("Clear", "إلغاء التحديد")}</Button>
            </> : <span className="tv-desc">{tr("Select rows to see bulk actions.", "حدّد صفوفًا لترى الإجراءات الجماعية.")}</span>}
          </div>
          <div className="tv-table-scroll">
            <Table aria-label={tr("Contacts", "جهات الاتصال")} selectionMode="multiple" selectedKeys={sel} onSelectionChange={setSel}>
              <TableHeader>
                <SelectionColumn />
                <Column isRowHeader>{tr("Name", "الاسم")}</Column>
                <Column>{tr("Stage", "المرحلة")}</Column>
                <Column>{tr("Owner", "المسؤول")}</Column>
              </TableHeader>
              <TableBody items={CONTACTS.slice(0, 5)}>
                {(c) => { const s = stageOf(c.stage); return <Row id={c.id}><Cell><Person c={c} /></Cell><Cell><Badge tone={s.tone} dot>{L(s)}</Badge></Cell><Cell>{L(ownerOf(c.owner))}</Cell></Row>; }}
              </TableBody>
            </Table>
          </div>
        </div>
      </Spec>
      <Spec id="resizable-table" name={tr("Resizable columns", "أعمدة قابلة لتغيير الحجم")} primitive="ResizableTableContainer + ColumnResizer" note={tr("Drag the edge of a header, or focus it and use arrow keys.", "اسحب حافة عنوان العمود، أو ركّز عليها واستخدم مفاتيح الأسهم.")} wide>
        <ResizableTable>
          <Table aria-label={tr("Contacts", "جهات الاتصال")}>
            <TableHeader>
              <Column id="n" isRowHeader resizable defaultWidth={200} minWidth={120}>{tr("Name", "الاسم")}</Column>
              <Column id="e" resizable defaultWidth={240} minWidth={120}>{tr("Email", "البريد الإلكتروني")}</Column>
              <Column id="c" resizable defaultWidth={160} minWidth={100}>{tr("Company", "الشركة")}</Column>
              <Column id="p" defaultWidth={180}>{tr("Phone", "الهاتف")}</Column>
            </TableHeader>
            <TableBody items={CONTACTS.slice(0, 4)}>
              {(c) => <Row id={c.id}><Cell>{L(c)}</Cell><Cell><span dir="ltr" className="ellipsis">{c.email}</span></Cell><Cell>{c.company}</Cell><Cell><span dir="ltr">{c.phone}</span></Cell></Row>}
            </TableBody>
          </Table>
        </ResizableTable>
      </Spec>
      <Spec id="expandable-rows" name={tr("Expandable rows", "صفوف قابلة للتوسيع")} primitive="Tree" note={tr("Hierarchical rows use React Aria's Tree. Right arrow expands, left collapses (mirrored in Arabic).", "الصفوف الهرمية تستخدم Tree من React Aria. السهم الأيمن يوسّع والأيسر يطوي (ومعكوس في العربية).")} wide>
        <div className="tree-table" style={{ "--tree-cols": "90px 150px" }}>
          <div className="tree-head" aria-hidden="true"><span>{tr("Region and team", "المنطقة والفريق")}</span><span>{tr("Deals", "الصفقات")}</span><span>{tr("Pipeline", "قيمة الصفقات")}</span></div>
          <Tree aria-label={tr("Pipeline by region", "الصفقات حسب المنطقة")} defaultExpandedKeys={["cairo"]}>
            {regions.map(renderRegion)}
          </Tree>
        </div>
      </Spec>
      <Spec id="reorder-table" name={tr("Drag to reorder", "السحب لإعادة الترتيب")} primitive="Table + useDragAndDrop" note={tr("Drag the handle, or focus it and press Enter, then arrows, then Enter to drop.", "اسحب المقبض، أو ركّز عليه واضغط Enter ثم الأسهم ثم Enter للإفلات.")} wide>
        <div className="tv-table-scroll">
          <Table aria-label={tr("Priorities this week", "أولويات هذا الأسبوع")} dragAndDropHooks={dragAndDropHooks}>
            <TableHeader>
              <DragColumn />
              <Column isRowHeader>{tr("Task", "المهمة")}</Column>
              <Column>{tr("Owner", "المسؤول")}</Column>
              <Column>{tr("Due", "الموعد")}</Column>
            </TableHeader>
            <TableBody items={list.items}>
              {(p) => <Row id={p.id}><Cell>{L(p)}</Cell><Cell>{L(ownerOf(p.owner))}</Cell><Cell><span className="tv-desc">{f.relative(-p.due)}</span></Cell></Row>}
            </TableBody>
          </Table>
        </div>
      </Spec>
      <TableFooterSpec />
      <InfiniteTableSpec />
      <VirtualTableSpec />
      <Spec id="table-states" name={tr("Loading and empty", "التحميل والحالة الفارغة")} primitive="TableBody renderEmptyState" wide>
        <div className="stack">
          <ToggleButtonGroup aria-label={tr("State", "الحالة")} selectionMode="single" disallowEmptySelection selectedKeys={[state]} onSelectionChange={(k) => setState([...k][0])}>
            <SegmentButton id="loading">{tr("Loading", "تحميل")}</SegmentButton>
            <SegmentButton id="empty">{tr("Empty", "فارغ")}</SegmentButton>
          </ToggleButtonGroup>
          <div className="tv-table-scroll">
            <Table aria-label={tr("Deals", "الصفقات")}>
              <TableHeader>
                <Column isRowHeader>{tr("Deal", "الصفقة")}</Column><Column>{tr("Stage", "المرحلة")}</Column><Column align="end">{tr("Value", "القيمة")}</Column>
              </TableHeader>
              <TableBody items={[]} renderEmptyState={() => state === "loading"
                ? <div className="table-loading"><OrbitLoader label={tr("Loading deals", "جارٍ تحميل الصفقات")} size={28} /></div>
                : <EmptyState title={tr("No deals in this view", "لا توجد صفقات في هذا العرض")} action={<Button variant="secondary"><Icon.Plus />{tr("Create deal", "إنشاء صفقة")}</Button>}>{tr("Deals you create or import will show up here.", "ستظهر هنا الصفقات التي تنشئها أو تستوردها.")}</EmptyState>}>
                {[]}
              </TableBody>
            </Table>
          </div>
        </div>
      </Spec>
    </>
  );
}
