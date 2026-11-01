import React, { useState } from "react";
import {
  Select, Item, ComboBox, CommandMenu, ListBox, ListBoxSection, GridList, GridListItem, TagGroup, Tag,
  Tabs, TabList, Tab, TabPanel, Breadcrumbs, Disclosure, Accordion, Pagination, Avatar, Badge, IconButton, Tooltip, toast, useFormat,
} from "../../components/index.jsx";
import { ListBoxItem, MenuItem as RACMenuItem, Text } from "react-aria-components";
import * as Icon from "../../components/icons.jsx";
import { useTr, useT, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { MultiSelectSpec, GridSectionsSpec, InfiniteListSpec, NavTreeSpec, KeyboardSpec, PreviewSpec } from "./Phase2.jsx";
import { CONTACTS } from "../data.js";

const SOURCE_NAMES = ["Salesforce", "HubSpot", "Google Sheets", "PostgreSQL"];

export function Selection() {
  const tr = useTr(); const t = useT(); const lang = useLang(); const f = useFormat();
  const L = (o) => (lang === "ar" ? o.ar : o.en);
  const sources = ["sf", "hs", "gs", "pg"].map((id, i) => ({ id, name: SOURCE_NAMES[i], desc: t.sources[i] }));
  const people = t.people.map((name, id) => ({ id, name }));
  const [tags, setTags] = useState(t.appliedTags.map((name, id) => ({ id, name })));
  const commands = [
    { id: "new-contact", en: "Create contact", ar: "إنشاء جهة اتصال", icon: <Icon.User />, kbd: "C" },
    { id: "new-deal", en: "Create deal", ar: "إنشاء صفقة", icon: <Icon.Plus />, kbd: "D" },
    { id: "import", en: "Import spreadsheet", ar: "استيراد جدول بيانات", icon: <Icon.Upload /> },
    { id: "report", en: "Open weekly churn report", ar: "فتح تقرير فقدان العملاء الأسبوعي", icon: <Icon.FileText /> },
    { id: "ask", en: "Ask the assistant", ar: "اسأل المساعد", icon: <Icon.Send className="tv-flip" />, kbd: "/" },
  ];
  return (
    <>
      <ViewHeader viewId="selection" intro={tr("Pick one or many from a set. Each pattern fits a different size of list and a different way of finding things.", "اختر عنصرًا أو أكثر من مجموعة. كل نمط يناسب حجمًا مختلفًا من القوائم وطريقة مختلفة للبحث.")} />
      <Spec id="select" name={t.select} primitive="Select + ListBox + Popover" note={t.selectNote}>
        <div className="grid2">
          <Select label={t.source} items={sources} defaultSelectedKey="hs">
            {(s) => <Item id={s.id} textValue={s.name} description={s.desc}>{s.name}</Item>}
          </Select>
          <Select label={tr("Region", "المنطقة")} isDisabled defaultSelectedKey="cai" items={[{ id: "cai", n: tr("Greater Cairo", "القاهرة الكبرى") }]}>
            {(r) => <Item id={r.id}>{r.n}</Item>}
          </Select>
        </div>
      </Spec>
      <Spec id="combo-box" name={t.combo} primitive="ComboBox" note={t.comboNote}>
        <div className="grid2">
          <ComboBox label={t.assign} placeholder={t.assignPh} items={people}>{(p) => <Item id={p.id}>{p.name}</Item>}</ComboBox>
        </div>
      </Spec>
      <Spec id="autocomplete" name={tr("Autocomplete", "إكمال تلقائي")} primitive="Autocomplete + Menu" note={tr("A command menu: focus stays in the field while arrow keys move through results. Used for the search in the header.", "قائمة أوامر: يبقى التركيز في الحقل بينما تتنقل مفاتيح الأسهم بين النتائج. وهي المستخدمة في البحث أعلى الصفحة.")}>
        <div style={{ maxWidth: 460 }}>
          <CommandMenu label={tr("Commands", "الأوامر")} placeholder={tr("Type a command", "اكتب أمرًا")} items={commands}
            onAction={(id) => toast({ tone: "info", title: L(commands.find((c) => c.id === id)) })}
            renderEmpty={() => <div className="tv-empty-mini">{tr("No commands match.", "لا توجد أوامر مطابقة.")}</div>}>
            {(c) => (
              <RACMenuItem id={c.id} textValue={L(c)} className="tv-item">{c.icon}{L(c)}{c.kbd && <kbd className="tv-kbd" dir="ltr">{c.kbd}</kbd>}</RACMenuItem>
            )}
          </CommandMenu>
        </div>
      </Spec>
      <Spec id="list-box" name={tr("List box", "قائمة خيارات")} primitive="ListBox + ListBoxSection" note={tr("An always-visible list with sections. Here, multiple selection.", "قائمة ظاهرة دائمًا مع أقسام، وهنا مع اختيار متعدد.")}>
        <div style={{ maxWidth: 360 }}>
          <ListBox aria-label={tr("Columns to show", "الأعمدة المعروضة")} selectionMode="multiple" defaultSelectedKeys={["name", "company", "stage", "value"]}>
            <ListBoxSection title={tr("Contact", "جهة الاتصال")}>
              {[["name", "Name", "الاسم"], ["email", "Email", "البريد"], ["phone", "Phone", "الهاتف"]].map(([id, en, ar]) => <Item key={id} id={id}>{tr(en, ar)}</Item>)}
            </ListBoxSection>
            <ListBoxSection title={tr("Deal", "الصفقة")}>
              {[["company", "Company", "الشركة"], ["stage", "Stage", "المرحلة"], ["value", "Deal value", "قيمة الصفقة"], ["close", "Close date", "تاريخ الإغلاق"]].map(([id, en, ar]) => <Item key={id} id={id}>{tr(en, ar)}</Item>)}
            </ListBoxSection>
          </ListBox>
        </div>
      </Spec>
      <MultiSelectSpec />
      <Spec id="grid-list" name={tr("Grid list", "قائمة تفاعلية")} primitive="GridList" note={tr("Rows that hold buttons. Tab reaches the buttons; arrows move between rows.", "صفوف تحتوي أزرارًا. مفتاح Tab يصل إلى الأزرار، والأسهم تنتقل بين الصفوف.")}>
        <GridList aria-label={tr("Follow-ups due", "متابعات مستحقة")} selectionMode="multiple" items={CONTACTS.slice(0, 4)}>
          {(c) => (
            <GridListItem id={c.id} textValue={L(c)} actions={
              <div className="row" style={{ gap: 4 }}>
                <Tooltip content={tr("Call", "اتصال")}><IconButton label={tr("Call", "اتصال")}><Icon.Phone /></IconButton></Tooltip>
                <Tooltip content={tr("Email", "بريد")}><IconButton label={tr("Email", "بريد")}><Icon.Mail /></IconButton></Tooltip>
              </div>}>
              <Avatar name={L(c)} size={32} />
              <span className="gl-text"><b>{L(c)}</b><span className="tv-desc">{c.company}, {tr("follow up", "متابعة")} {f.relative(-c.days - 1)}</span></span>
            </GridListItem>
          )}
        </GridList>
      </Spec>
      <GridSectionsSpec />
      <InfiniteListSpec />
      <Spec id="tags" name={t.tags} primitive="TagGroup" note={t.tagsNote}>
        <div className="stack">
          <TagGroup label={t.filterBy} selectionMode="multiple" defaultSelectedKeys={["o0"]}>
            {t.outcomes.map((o, i) => <Tag key={i} id={`o${i}`}>{o}</Tag>)}
          </TagGroup>
          <TagGroup label={t.applied} items={tags} onRemove={(keys) => setTags((x) => x.filter((y) => !keys.has(y.id)))}
            renderEmptyState={() => <span className="caption">{t.noFilters}</span>}>
            {(x) => <Tag id={x.id}>{x.name}</Tag>}
          </TagGroup>
        </div>
      </Spec>
    </>
  );
}

export function Navigation() {
  const tr = useTr(); const t = useT();
  const [page, setPage] = useState(3);
  return (
    <>
      <ViewHeader viewId="navigation" intro={tr("Help people know where they are and move around without losing their place.", "ساعد الناس على معرفة مكانهم والتنقل دون أن يفقدوا موضعهم.")} />
      <Spec id="tabs" name={t.tabs} primitive="Tabs">
        <Tabs>
          <TabList aria-label={t.workflow}>{t.tabNames.map((n, i) => <Tab key={i} id={`t${i}`}>{n}</Tab>)}</TabList>
          {t.tabPanels.map((p, i) => <TabPanel key={i} id={`t${i}`}>{p}</TabPanel>)}
        </Tabs>
      </Spec>
      <Spec id="breadcrumbs" name={tr("Breadcrumbs", "مسار التنقل")} primitive="Breadcrumbs" note={tr("The last item is the current page and isn't a link. Separators mirror in Arabic.", "العنصر الأخير هو الصفحة الحالية وليس رابطًا. الفواصل تنعكس في العربية.")}>
        <Breadcrumbs items={[{ label: tr("Workspace", "مساحة العمل"), href: "#overview" }, { label: tr("Reports", "التقارير"), href: "#data" }, { label: tr("Churn", "فقدان العملاء"), href: "#data" }, { label: tr("Q3 2026", "الربع الثالث ٢٠٢٦") }]} />
      </Spec>
      <Spec id="disclosure" name={tr("Disclosure and accordion", "إفصاح وأكورديون")} primitive="Disclosure + DisclosureGroup" note={tr("Group them for an accordion. One open at a time by default.", "اجمعها لتكوين أكورديون، يُفتح واحد فقط في كل مرة افتراضيًا.")}>
        <Accordion defaultExpandedKeys={["q1"]}>
          <Disclosure id="q1" title={tr("Where does Truvar keep my data?", "أين يحتفظ Truvar ببياناتي؟")}>{tr("In your chosen region. Customers in Egypt default to our Frankfurt region, with daily encrypted backups.", "في المنطقة التي تختارها. عملاء مصر يستخدمون منطقة فرانكفورت افتراضيًا مع نسخ احتياطية مشفرة يوميًا.")}</Disclosure>
          <Disclosure id="q2" title={tr("Can I connect more than one CRM?", "هل يمكنني ربط أكثر من نظام لإدارة العملاء؟")}>{tr("Yes. Growth plans connect up to three, and records are matched by email.", "نعم. خطة النمو تربط حتى ثلاثة أنظمة، وتُطابق السجلات بالبريد الإلكتروني.")}</Disclosure>
          <Disclosure id="q3" title={tr("How is the AI assistant trained?", "كيف يُدرَّب المساعد الذكي؟")}>{tr("It reads your workspace only when you ask. Your data is never used to train models.", "يقرأ مساحة عملك فقط عندما تطلب ذلك، ولا تُستخدم بياناتك أبدًا لتدريب النماذج.")}</Disclosure>
        </Accordion>
      </Spec>
      <Spec id="pagination" name={tr("Pagination", "ترقيم الصفحات")} primitive="Button" note={tr("Not part of React Aria; composed from its buttons. The current page is announced.", "ليس ضمن React Aria، وقد بُني من أزرارها. تُعلن الصفحة الحالية لقارئات الشاشة.")}>
        <Pagination page={page} pageCount={12} onChange={setPage} />
      </Spec>
      <NavTreeSpec />
      <KeyboardSpec />
      <PreviewSpec />
    </>
  );
}
