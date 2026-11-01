// HubSpot-style record panel: a Drawer with editable properties, associations and an activity timeline.
import React, { useState, useEffect } from "react";
import { Heading } from "react-aria-components";
import {
  Drawer, Button, IconButton, Tooltip, TextField, Select, Item, Tabs, TabList, Tab, TabPanel,
  Disclosure, Badge, Avatar, toast, useFormat, Link,
} from "../components/index.jsx";
import * as Icon from "../components/icons.jsx";
import { useTr, useLang } from "./i18n.jsx";
import { OWNERS, STAGES, stageOf } from "./data.js";

export function RecordPanel({ contact, isOpen, onOpenChange, side = "end", onSave }) {
  const tr = useTr();
  const lang = useLang();
  const f = useFormat();
  const [draftState, setDraft] = useState(contact);
  useEffect(() => { setDraft(contact); }, [contact, isOpen]);
  if (!contact) return null;
  const draft = draftState && draftState.id === contact.id ? draftState : contact;
  const dirty = JSON.stringify(draft) !== JSON.stringify(contact);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const name = lang === "ar" ? contact.ar : contact.en;
  const stage = stageOf(draft.stage);

  const timeline = [
    { icon: <Icon.Mail />, title: tr("Email opened: Q4 pricing", "تم فتح البريد: أسعار الربع الرابع"), meta: f.relative(0), who: tr("Amira Hassan", "أميرة حسن") },
    { icon: <Icon.Phone />, title: tr("Call logged, 14 minutes", "تم تسجيل مكالمة، ١٤ دقيقة"), meta: f.relative(1), who: tr("Omar Farouk", "عمر فاروق"), body: tr("Wants a pilot for two warehouses before signing.", "يريد تجربة في مستودعين قبل التوقيع.") },
    { icon: <Icon.FileText />, title: tr("Proposal sent", "تم إرسال العرض"), meta: f.relative(3), who: tr("Amira Hassan", "أميرة حسن") },
    { icon: <Icon.User />, title: tr("Contact created from website form", "تم إنشاء جهة الاتصال من نموذج الموقع"), meta: f.relative(21) },
  ];

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} side={side} width={520}
      header={
        <div className="rp-head">
          <Avatar name={name} size={48} />
          <div className="rp-head-text">
            <Heading slot="title" className="tv-drawer-title">{name}</Heading>
            <p className="tv-desc" style={{ margin: 0 }}>{lang === "ar" ? contact.titleAr : contact.titleEn}, {contact.company}</p>
            <div className="rp-badges"><Badge tone={stage.tone} dot>{lang === "ar" ? stage.ar : stage.en}</Badge></div>
          </div>
        </div>
      }
      footer={({ close }) => (
        <>
          {dirty && <span className="rp-dirty">{tr("Unsaved changes", "تغييرات غير محفوظة")}</span>}
          <Button variant="ghost" onPress={() => (dirty ? setDraft(contact) : close())}>{dirty ? tr("Discard", "تجاهل") : tr("Close", "إغلاق")}</Button>
          <Button isDisabled={!dirty} onPress={() => {
            onSave?.(draft); close();
            toast({ tone: "success", title: tr("Contact updated", "تم تحديث جهة الاتصال"), description: name });
          }}>{tr("Save changes", "حفظ التغييرات")}</Button>
        </>
      )}
    >
      <div className="rp-actions">
        {[[<Icon.Mail />, tr("Email", "بريد")], [<Icon.Phone />, tr("Call", "اتصال")], [<Icon.FileText />, tr("Note", "ملاحظة")], [<Icon.Calendar />, tr("Meeting", "اجتماع")]].map(([ic, l], i) => (
          <div className="rp-action" key={i}>
            <Tooltip content={l}><IconButton label={l}>{ic}</IconButton></Tooltip>
            <span>{l}</span>
          </div>
        ))}
      </div>

      <div className="rp-sections">
        <Disclosure title={tr("About this contact", "عن جهة الاتصال")} defaultExpanded>
          <div className="rp-fields">
            <TextField label={tr("Email", "البريد الإلكتروني")} type="email" value={draft.email} onChange={set("email")} />
            <TextField label={tr("Phone", "الهاتف")} value={draft.phone} onChange={set("phone")} />
            <Select label={tr("Contact owner", "مسؤول جهة الاتصال")} items={OWNERS} selectedKey={draft.owner} onSelectionChange={set("owner")}>
              {(o) => <Item id={o.id} textValue={lang === "ar" ? o.ar : o.en}>{lang === "ar" ? o.ar : o.en}</Item>}
            </Select>
            <Select label={tr("Deal stage", "مرحلة الصفقة")} items={STAGES} selectedKey={draft.stage} onSelectionChange={set("stage")}>
              {(s) => <Item id={s.id} textValue={lang === "ar" ? s.ar : s.en}>{lang === "ar" ? s.ar : s.en}</Item>}
            </Select>
          </div>
        </Disclosure>
        <Disclosure title={tr("Deals", "الصفقات")} badge={<Badge tone="neutral">{f.number(2)}</Badge>} defaultExpanded>
          <div className="rp-assoc">
            <div className="rp-assoc-item">
              <div><b>{contact.company} {tr("annual plan", "الخطة السنوية")}</b><span className="tv-desc">{tr("Closes", "الإغلاق")} {tr("30 Nov 2026", "٣٠ نوفمبر ٢٠٢٦")}</span></div>
              <div className="rp-assoc-end"><b>{f.money(contact.value)}</b><Badge tone={stage.tone}>{lang === "ar" ? stage.ar : stage.en}</Badge></div>
            </div>
            <div className="rp-assoc-item">
              <div><b>{tr("Pilot: two warehouses", "تجربة: مستودعان")}</b><span className="tv-desc">{tr("Closes", "الإغلاق")} {tr("15 Nov 2026", "١٥ نوفمبر ٢٠٢٦")}</span></div>
              <div className="rp-assoc-end"><b>{f.money(Math.round(contact.value * 0.12))}</b><Badge tone="success">{tr("Won", "تم الفوز")}</Badge></div>
            </div>
          </div>
        </Disclosure>
        <Disclosure title={tr("Company", "الشركة")}>
          <div className="rp-assoc-item">
            <div className="rp-company"><span className="rp-company-icon"><Icon.Building /></span><div><b>{contact.company}</b><span className="tv-desc">{contact.email.split("@")[1]}</span></div></div>
            <Link standalone href="#record-panel">{tr("View", "عرض")}</Link>
          </div>
        </Disclosure>
      </div>

      <Tabs>
        <TabList aria-label={tr("Record activity", "نشاط السجل")}>
          <Tab id="activity">{tr("Activity", "النشاط")}</Tab>
          <Tab id="notes">{tr("Notes", "الملاحظات")}</Tab>
          <Tab id="emails">{tr("Emails", "الرسائل")}</Tab>
        </TabList>
        <TabPanel id="activity">
          <ol className="timeline">
            {timeline.map((e, i) => (
              <li key={i}>
                <span className="timeline-icon">{e.icon}</span>
                <div className="timeline-body">
                  <p className="timeline-title">{e.title}</p>
                  <p className="tv-desc">{[e.who, e.meta].filter(Boolean).join(tr(", ", "، "))}</p>
                  {e.body && <p className="timeline-note">{e.body}</p>}
                </div>
              </li>
            ))}
          </ol>
        </TabPanel>
        <TabPanel id="notes"><TextField label={tr("Add a note", "أضف ملاحظة")} multiline placeholder={tr("What happened on the last call?", "ماذا حدث في آخر مكالمة؟")} /></TabPanel>
        <TabPanel id="emails"><p className="tv-desc">{tr("3 emails in the last 30 days. Last reply 2 days ago.", "٣ رسائل خلال آخر ٣٠ يومًا. آخر رد منذ يومين.")}</p></TabPanel>
      </Tabs>
    </Drawer>
  );
}
