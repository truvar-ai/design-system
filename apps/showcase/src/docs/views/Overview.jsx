"use client";
// A realistic CRM screen built only from @truvar/ui components
import { useState, useMemo, useCallback } from "react";
import {
  Button, SearchField, Select, Item, Breadcrumbs, StatTile, Table, TableHeader, Column, TableBody, Row, Cell,
  SelectionColumn, Badge, Avatar, Pagination, MenuButton, MenuItem, ConfirmDialog, Modal, TextField, PhoneField, Form, FileTrigger,
  toast, useFormat, EmptyState, Banner,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useLang } from "../i18n.jsx";
import { CONTACTS, OWNERS, STAGES, stageOf, ownerOf } from "../data.js";
import { RecordPanel } from "../RecordPanel.jsx";

const PAGE = 6;

export default function Overview() {
  const tr = useTr();
  const lang = useLang();
  const f = useFormat();
  const L = useCallback((o) => (lang === "ar" ? o.ar : o.en), [lang]);
  const [rows, setRows] = useState(CONTACTS);
  const [sort, setSort] = useState({ column: "value", direction: "descending" });
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [showTip, setShowTip] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = rows.filter((c) => (stage === "all" || c.stage === stage) &&
      (!q || [c.en, c.ar, c.company, c.email].some((x) => x.toLowerCase().includes(q))));
    const dir = sort.direction === "descending" ? -1 : 1;
    const key = { name: (c) => L(c), company: (c) => c.company, stage: (c) => STAGES.findIndex((s) => s.id === c.stage),
      owner: (c) => L(ownerOf(c.owner)), value: (c) => c.value, activity: (c) => c.days }[sort.column];
    return [...r].sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * dir);
  }, [rows, query, stage, sort, L]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = filtered.slice((page - 1) * PAGE, page * PAGE);
  const selIds = selected === "all" ? filtered.map((c) => c.id) : [...selected];
  const open = rows.find((c) => c.id === openId);

  const pipeline = rows.filter((c) => !["won", "lost"].includes(c.stage)).reduce((a, c) => a + c.value, 0);
  const won = rows.filter((c) => c.stage === "won").length, lost = rows.filter((c) => c.stage === "lost").length;

  const removeSelected = () => {
    const removed = rows.filter((c) => selIds.includes(c.id));
    setRows((r) => r.filter((c) => !selIds.includes(c.id)));
    setSelected(new Set());
    toast({ tone: "info", title: tr(`${removed.length} contacts deleted`, `تم حذف ${f.number(removed.length)} من جهات الاتصال`),
      action: { label: tr("Undo", "تراجع"), onAction: () => setRows((r) => [...r, ...removed]) } });
  };
  const assign = (owner) => {
    setRows((r) => r.map((c) => (selIds.includes(c.id) ? { ...c, owner } : c)));
    toast({ tone: "success", title: tr("Owner updated", "تم تغيير المسؤول"),
      description: tr(`${selIds.length} contacts now belong to ${ownerOf(owner).en}.`, `أصبحت ${f.number(selIds.length)} جهات اتصال تابعة لـ ${ownerOf(owner).ar}.`) });
    setSelected(new Set());
  };

  return (
    <div className="app-frame">
      <div className="app-head">
        <div>
          <Breadcrumbs items={[{ label: tr("CRM", "إدارة العملاء"), href: "#overview" }, { label: tr("Contacts", "جهات الاتصال") }]} />
          <h2 className="app-title">{tr("Contacts", "جهات الاتصال")}</h2>
        </div>
        <div className="row ws-page-actions">
          <FileTrigger acceptedFileTypes={[".csv", "text/csv"]} onSelect={(files) => files && toast({ tone: "success",
            title: tr("Import started", "بدأ الاستيراد"), description: [...files].map((x) => x.name).join(", ") })}>
            <Button variant="secondary"><Icon.Upload /><span className="ws-btn-label">{tr("Import", "استيراد")}</span></Button>
          </FileTrigger>
          <Modal trigger={<Button><Icon.Plus /><span className="ws-btn-long">{tr("Add contact", "إضافة جهة اتصال")}</span><span className="ws-btn-short" aria-hidden="true">{tr("Add", "إضافة")}</span></Button>} title={tr("Add contact", "إضافة جهة اتصال")}>
            {({ close }) => (
              <Form onSubmit={(e) => {
                e.preventDefault();
                const d = Object.fromEntries(new FormData(e.currentTarget));
                setRows((r) => [{ id: Date.now(), en: d.name, ar: d.name, titleEn: d.title || "—", titleAr: d.title || "—", company: d.company,
                  email: d.email, phone: "", owner: "amira", stage: "lead", value: 0, days: 0 }, ...r]);
                close();
                toast({ tone: "success", title: tr("Contact added", "تمت إضافة جهة الاتصال"), description: d.name });
              }}>
                <TextField name="name" label={tr("Full name", "الاسم الكامل")} isRequired autoFocus />
                <TextField name="email" type="email" label={tr("Email", "البريد الإلكتروني")} isRequired />
                <PhoneField name="phone" label={tr("Phone", "الهاتف")} defaultCountry="EG" />
                <div className="grid2">
                  <TextField name="company" label={tr("Company", "الشركة")} isRequired />
                  <TextField name="title" label={tr("Job title", "المسمى الوظيفي")} />
                </div>
                <div className="tv-dialog-actions">
                  <Button variant="ghost" onPress={close}>{tr("Cancel", "إلغاء")}</Button>
                  <Button type="submit">{tr("Add contact", "إضافة جهة اتصال")}</Button>
                </div>
              </Form>
            )}
          </Modal>
        </div>
      </div>

      {showTip && (
        <Banner tone="info" title={tr("Tip: open any contact", "نصيحة: افتح أي جهة اتصال")} onDismiss={() => setShowTip(false)}>
          {tr("Click a row to open the contact's full record. Tick the boxes to assign, export or delete in bulk.",
              "اضغط على أي صف لفتح ملف العميل الكامل. حدّد المربعات للإسناد أو التصدير أو الحذف دفعة واحدة.")}
        </Banner>
      )}

      <div className="stat-grid">
        <StatTile label={tr("Open pipeline", "قيمة الصفقات المفتوحة")} value={f.moneyShort(pipeline)} delta={f.number(0.12, { style: "percent" })} deltaLabel={tr("vs last month", "عن الشهر الماضي")} />
        <StatTile label={tr("Contacts", "جهات الاتصال")} value={f.number(rows.length)} delta={f.number(3)} deltaLabel={tr("new this week", "جديدة هذا الأسبوع")} />
        <StatTile label={tr("Win rate", "معدل الفوز")} value={f.number(won / Math.max(1, won + lost), { style: "percent" })} delta={f.number(0.04, { style: "percent" })} deltaLabel={tr("vs last quarter", "عن الربع الماضي")} />
        <StatTile label={tr("Avg. reply time", "متوسط وقت الرد")} value={tr("2.4 h", "٢٫٤ ساعة")} trend="down" good delta={tr("18 min", "١٨ دقيقة")} deltaLabel={tr("faster", "أسرع")} />
      </div>

      <div className="table-toolbar">
        {selIds.length > 0 ? (
          <div className="bulk-bar" role="region" aria-label={tr("Bulk actions", "إجراءات جماعية")}>
            <b>{tr(`${selIds.length} selected`, `تم تحديد ${f.number(selIds.length)}`)}</b>
            <MenuButton label={tr("Assign owner", "إسناد إلى")} onAction={assign}>
              {OWNERS.map((o) => <MenuItem key={o.id} id={o.id}>{L(o)}</MenuItem>)}
            </MenuButton>
            <Button variant="secondary" onPress={() => toast({ tone: "success", title: tr("Export ready", "التصدير جاهز"), description: tr(`${selIds.length} contacts in contacts.csv`, `${f.number(selIds.length)} جهات اتصال في contacts.csv`) })}>
              <Icon.Download />{tr("Export", "تصدير")}
            </Button>
            <Button variant="danger" onPress={() => setConfirmDel(true)}><Icon.Trash />{tr("Delete", "حذف")}</Button>
            <Button variant="ghost" onPress={() => setSelected(new Set())}>{tr("Clear", "إلغاء التحديد")}</Button>
          </div>
        ) : (
          <>
            <div className="toolbar-search">
              <SearchField aria-label={tr("Search contacts", "ابحث في جهات الاتصال")} label="" placeholder={tr("Search by name, company or email", "ابحث بالاسم أو الشركة أو البريد")}
                value={query} onChange={(v) => { setQuery(v); setPage(1); }} />
            </div>
            <div className="toolbar-filter">
              <Select aria-label={tr("Deal stage", "مرحلة الصفقة")} selectedKey={stage} onSelectionChange={(k) => { setStage(k); setPage(1); }}
                items={[{ id: "all", en: "All stages", ar: "كل المراحل" }, ...STAGES]}>
                {(s) => <Item id={s.id} textValue={L(s)}>{L(s)}</Item>}
              </Select>
            </div>
          </>
        )}
      </div>

      <div className="tv-table-scroll">
        <Table aria-label={tr("Contacts", "جهات الاتصال")} selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}
          sortDescriptor={sort} onSortChange={setSort} onRowAction={(id) => { location.hash = "contact/" + id; }}>
          <TableHeader>
            <SelectionColumn />
            <Column id="name" isRowHeader allowsSorting>{tr("Name", "الاسم")}</Column>
            <Column id="company" allowsSorting>{tr("Company", "الشركة")}</Column>
            <Column id="stage" allowsSorting>{tr("Stage", "المرحلة")}</Column>
            <Column id="owner" allowsSorting>{tr("Owner", "المسؤول")}</Column>
            <Column id="value" allowsSorting align="end">{tr("Deal value", "قيمة الصفقة")}</Column>
            <Column id="activity" allowsSorting>{tr("Last activity", "آخر نشاط")}</Column>
          </TableHeader>
          <TableBody items={current} renderEmptyState={() => (
            <EmptyState title={tr("No contacts match", "لا توجد جهات اتصال مطابقة")} action={<Button variant="secondary" onPress={() => { setQuery(""); setStage("all"); }}>{tr("Clear filters", "مسح عوامل التصفية")}</Button>}>
              {tr("Try a different name or stage.", "جرّب اسمًا أو مرحلة مختلفة.")}
            </EmptyState>)}>
            {(c) => {
              const s = stageOf(c.stage);
              return (
                <Row id={c.id}>
                  <Cell><div className="tv-cell-person"><Avatar name={L(c)} size={32} /><span><b>{L(c)}</b><span className="tv-desc" dir="ltr">{c.email}</span></span></div></Cell>
                  <Cell>{c.company}</Cell>
                  <Cell><Badge tone={s.tone} dot>{L(s)}</Badge></Cell>
                  <Cell>{L(ownerOf(c.owner))}</Cell>
                  <Cell align="end">{f.money(c.value)}</Cell>
                  <Cell><span className="tv-desc">{f.relative(c.days)}</span></Cell>
                </Row>
              );
            }}
          </TableBody>
        </Table>
      </div>
      <div className="table-foot">
        <span className="tv-desc">{filtered.length
          ? tr(`Showing ${(page - 1) * PAGE + 1}–${Math.min(page * PAGE, filtered.length)} of ${filtered.length}`,
               `عرض ${f.number((page - 1) * PAGE + 1)}–${f.number(Math.min(page * PAGE, filtered.length))} من ${f.number(filtered.length)}`)
          : ""}</span>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
      </div>

      <RecordPanel contact={open} isOpen={!!open} onOpenChange={(o) => !o && setOpenId(null)}
        onSave={(d) => setRows((r) => r.map((c) => (c.id === d.id ? d : c)))} />
      <ConfirmDialog isOpen={confirmDel} onOpenChange={setConfirmDel} tone="danger" icon={<Icon.Trash />}
        title={tr(`Delete ${selIds.length} contacts?`, `حذف ${f.number(selIds.length)} من جهات الاتصال؟`)}
        confirmLabel={tr("Delete contacts", "حذف جهات الاتصال")} onConfirm={removeSelected}>
        <p>{tr("Their activity history is deleted too. You can undo for a few seconds afterwards.", "سيُحذف سجل نشاطها أيضًا. يمكنك التراجع خلال ثوانٍ بعد الحذف.")}</p>
      </ConfirmDialog>
    </div>
  );
}
