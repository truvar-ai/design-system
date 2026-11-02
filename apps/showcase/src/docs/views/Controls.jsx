"use client";
import { useState } from "react";
import { today, getLocalTimeZone, isWeekend, Time } from "@internationalized/date";
import {
  Button, IconButton, Tooltip, ToggleButton, ToggleButtonGroup, SegmentButton, Toolbar, Separator, Link, FileTrigger,
  TextField, SearchField, NumberField, PhoneField, Checkbox, CheckboxGroup, Switch, RadioGroup, Radio, RadioCard, Slider, Form,
  DateField, TimeField, DatePicker, DateRangePicker, Calendar, RangeCalendar, Badge, toast, } from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useT, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { SettingRowsSpec, PromptEditorSpec, CalendarPickersSpec } from "./Phase2.jsx";

export function Buttons() {
  const tr = useTr(); const t = useT();
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState([]);
  const [following, setFollowing] = useState(true);
  const save = () => { setSaving(true); setTimeout(() => { setSaving(false); toast({ tone: "success", title: tr("Draft saved", "تم حفظ المسودة") }); }, 1800); };
  return (
    <>
      <ViewHeader viewId="buttons" intro={t.actionsIntro} />
      <Spec id="button" name={tr("Button", "زر")} primitive="Button" note={tr("Variants for every level of emphasis. `isPending` shows the orbit while work runs and keeps focus on the button.", "أنواع لكل مستوى من الأهمية. `isPending` يعرض المدار أثناء التنفيذ ويُبقي التركيز على الزر.")}>
        <div className="stack">
          <div className="row">
            <Button>{t.run}</Button>
            <Button variant="secondary">{t.save}</Button>
            <Button variant="ghost">{t.view}</Button>
            <Button variant="danger">{tr("Remove", "إزالة")}</Button>
            <Button variant="danger-solid">{tr("Delete", "حذف")}</Button>
          </div>
          <div className="row">
            <Button size="sm">{tr("Small", "صغير")}</Button>
            <Button size="sm" variant="secondary"><Icon.Plus />{tr("Add filter", "إضافة تصفية")}</Button>
            <Button isDisabled>{t.exporting}</Button>
            <Button isPending={saving} onPress={save}>{saving ? tr("Saving", "جارٍ الحفظ") : tr("Save draft", "حفظ المسودة")}</Button>
          </div>
        </div>
      </Spec>
      <Spec id="icon-button" name={tr("Icon button and tooltip", "زر أيقونة وتلميح")} primitive="Button + TooltipTrigger" note={t.tooltipNote}>
        <div className="row">
          <Tooltip content={t.tipDownload}><IconButton label={t.download}><Icon.Download /></IconButton></Tooltip>
          <Tooltip content={t.tipCopy}><IconButton label={t.copy}><Icon.Copy /></IconButton></Tooltip>
          <Tooltip content={tr("Shown above", "يظهر بالأعلى")} placement="top"><IconButton label={tr("Info", "معلومات")}><Icon.Info /></IconButton></Tooltip>
          <Tooltip content={tr("Shown at the end", "يظهر في النهاية")} placement="end"><IconButton label={tr("More", "المزيد")}><Icon.More /></IconButton></Tooltip>
        </div>
      </Spec>
      <Spec id="toggle-button" name={tr("Toggle button", "زر تبديل")} primitive="ToggleButton" note={tr("Keeps an on/off state. Screen readers hear “pressed”.", "يحتفظ بحالة تشغيل أو إيقاف، وتعلن قارئات الشاشة أنه «مضغوط».")}>
        <div className="row">
          <ToggleButton isSelected={following} onChange={setFollowing} icon={following ? <Icon.Check /> : <Icon.Plus />}>
            {following ? tr("Following", "تتابع") : tr("Follow", "متابعة")}
          </ToggleButton>
          <ToggleButton icon={<Icon.Bell />}>{tr("Notify me", "أعلمني")}</ToggleButton>
        </div>
      </Spec>
      <Spec id="toggle-group" name={tr("Toggle button group", "مجموعة أزرار تبديل")} primitive="ToggleButtonGroup" note={tr("Single choice, used for view switchers and segmented filters.", "اختيار واحد، للتبديل بين طرق العرض والتصفية.")}>
        <div className="row">
          <ToggleButtonGroup aria-label={tr("View", "طريقة العرض")} selectionMode="single" disallowEmptySelection defaultSelectedKeys={["list"]}>
            <SegmentButton id="list" icon={<Icon.List />}>{tr("List", "قائمة")}</SegmentButton>
            <SegmentButton id="board" icon={<Icon.Kanban />}>{tr("Board", "لوحة")}</SegmentButton>
            <SegmentButton id="table" icon={<Icon.Table2 />}>{tr("Table", "جدول")}</SegmentButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup aria-label={tr("Period", "الفترة")} selectionMode="single" disallowEmptySelection defaultSelectedKeys={["30"]}>
            <SegmentButton id="7">{tr("7 days", "٧ أيام")}</SegmentButton>
            <SegmentButton id="30">{tr("30 days", "٣٠ يومًا")}</SegmentButton>
            <SegmentButton id="90">{tr("Quarter", "ربع سنة")}</SegmentButton>
          </ToggleButtonGroup>
        </div>
      </Spec>
      <Spec id="toolbar" name={tr("Toolbar", "شريط أدوات")} primitive="Toolbar" note={tr("One tab stop for the whole bar; arrow keys move between tools.", "نقطة تركيز واحدة للشريط كله، ومفاتيح الأسهم للتنقل بين الأدوات.")}>
        <Toolbar aria-label={tr("Text formatting", "تنسيق النص")}>
          <ToggleButton aria-label={tr("Bold", "عريض")} icon={<Icon.Bold />} />
          <ToggleButton aria-label={tr("Italic", "مائل")} icon={<Icon.Italic />} />
          <ToggleButton aria-label={tr("Underline", "تسطير")} icon={<Icon.Underline />} />
          <Separator orientation="vertical" />
          <ToggleButton aria-label={tr("Insert link", "إدراج رابط")} icon={<Icon.LinkIcon />} />
          <Separator orientation="vertical" />
          <Button size="sm" variant="ghost">{tr("Add AI summary", "إضافة ملخص ذكي")}</Button>
        </Toolbar>
      </Spec>
      <Spec id="link" name={tr("Link", "رابط")} primitive="Link">
        <div className="stack">
          <p className="body">{tr("Read the ", "اقرأ ")}<Link href="#data">{tr("table guidelines", "إرشادات الجداول")}</Link>{tr(" before you build a report.", " قبل بناء أي تقرير.")}</p>
          <Link standalone href="#overview">{tr("Open the CRM example", "افتح مثال إدارة العملاء")}<Icon.ChevronRight width={16} height={16} className="tv-flip" /></Link>
        </div>
      </Spec>
      <Spec id="file-trigger" name={tr("File trigger", "رفع ملف")} primitive="FileTrigger" note={tr("Any button can open the system file picker.", "أي زر يمكنه فتح منتقي الملفات في النظام.")}>
        <div className="stack">
          <FileTrigger allowsMultiple acceptedFileTypes={[".csv", ".xlsx"]} onSelect={(l) => setFiles(l ? [...l].map((x) => x.name) : [])}>
            <Button variant="secondary"><Icon.Upload />{tr("Upload spreadsheet", "رفع جدول بيانات")}</Button>
          </FileTrigger>
          {files.length > 0 && <div className="row">{files.map((n) => <Badge key={n} tone="navy">{n}</Badge>)}</div>}
        </div>
      </Spec>
    </>
  );
}

const PASTE_SAMPLES = ["+20 100 234 5678", "0020 100-234-5678", "(010) 0234 5678", "٠١٠٠٢٣٤٥٦٧٨", "tel:+971501234567", "+44 (0)20 7946 0958"];

function PhoneDemo() {
  const tr = useTr();
  const [value, setValue] = useState({ e164: "", country: "EG", isValid: false });
  const copy = async (s) => {
    try { await navigator.clipboard.writeText(s); toast({ tone: "info", title: tr("Copied. Now paste it into the field.", "تم النسخ. الصقه الآن في الحقل."), description: s }); }
    catch { toast({ tone: "warning", title: tr("Couldn't copy", "تعذّر النسخ"), description: tr("Select the sample and copy it yourself.", "حدّد المثال وانسخه يدويًا.") }); }
  };
  return (
    <div className="stack">
      <div className="grid2">
        <PhoneField label={tr("Mobile number", "رقم المحمول")} defaultCountry="EG" isRequired onChange={setValue}
          description={tr("Paste any format. We tidy it up.", "الصق الرقم بأي صيغة وسنرتبه.")} />
        <PhoneField label={tr("Office number", "رقم المكتب")} defaultCountry="SA" />
      </div>
      <div className="paste-samples">
        <span className="tv-desc">{tr("Try pasting:", "جرّب لصق:")}</span>
        {PASTE_SAMPLES.map((s) => <button key={s} type="button" className="paste-chip" dir="ltr" onClick={() => copy(s)}><Icon.Copy width={13} height={13} />{s}</button>)}
      </div>
      <div className="phone-output" aria-live="polite">
        <span className="tv-desc">{tr("Stored value", "القيمة المحفوظة")}</span>
        <code dir="ltr">{value.e164 || "—"}</code>
        <Badge tone={value.isValid ? "success" : "neutral"} dot>{value.isValid ? tr("Valid", "صحيح") : tr("Not valid yet", "غير صحيح بعد")}</Badge>
      </div>
    </div>
  );
}

export function Forms() {
  const tr = useTr(); const t = useT();
  return (
    <>
      <ViewHeader viewId="forms" intro={t.formsIntro} />
      <Spec id="text-field" name={t.textField} primitive="TextField">
        <div className="grid2">
          <TextField label={t.wfName} placeholder={t.wfPh} description={t.wfDesc} />
          <TextField label={t.email} type="email" isRequired placeholder="you@company.com"
            validate={(v) => v && !v.includes("@") ? t.emailErr : null} />
          <TextField label={tr("Company", "الشركة")} defaultValue="Nile Foods" isDisabled />
          <TextField label={tr("Deal name", "اسم الصفقة")} defaultValue="X" isInvalid errorMessage={tr("Use at least 3 characters so your team can find it.", "استخدم ٣ أحرف على الأقل ليجدها فريقك.")} />
          <div className="span2"><TextField label={t.goal} multiline placeholder={t.goalPh} /></div>
        </div>
      </Spec>
      <Spec id="search-field" name={tr("Search field", "حقل بحث")} primitive="SearchField" note={tr("Escape clears it; Enter submits.", "مفتاح Esc يمسحه، ومفتاح Enter يرسله.")}>
        <div className="grid2"><SearchField label={tr("Search contacts", "ابحث في جهات الاتصال")} placeholder={tr("Name, company or email", "الاسم أو الشركة أو البريد")} /></div>
      </Spec>
      <Spec id="number-field" name={tr("Number field", "حقل رقمي")} primitive="NumberField" note={tr("Arrow keys and the buttons step the value. Currency and units follow the locale.", "مفاتيح الأسهم والأزرار تغيّر القيمة، والعملة والوحدات تتبع اللغة.")}>
        <div className="grid2">
          <NumberField label={tr("Deal value", "قيمة الصفقة")} defaultValue={250000} step={5000} minValue={0} formatOptions={{ style: "currency", currency: "EGP", maximumFractionDigits: 0 }} />
          <NumberField label={tr("Seats", "عدد المقاعد")} defaultValue={12} minValue={1} maxValue={500} description={tr("Between 1 and 500.", "بين ١ و٥٠٠.")} />
        </div>
      </Spec>
      <Spec id="phone-field" name={tr("Phone number", "رقم الهاتف")} primitive="TextField + Select + Autocomplete" wide
        note={tr("Flag and dialling code, formatting as you type, and clean-up of pasted numbers: spaces, dashes, brackets, a 00 prefix, “(0)”, tel: links and Arabic digits. A pasted +code switches the country. It always stores one format: +201002345678.", "علم ورمز الدولة، وتنسيق أثناء الكتابة، وتنظيف الأرقام الملصقة: المسافات والشرطات والأقواس وبادئة 00 و«(0)» وروابط tel: والأرقام العربية. لصق رمز دولة يغيّر الدولة تلقائيًا. ويُحفظ الرقم دائمًا بصيغة واحدة: \u2066+201002345678\u2069.")}>
        <PhoneDemo />
      </Spec>
      <Spec id="checkbox" name={t.checkSwitch} primitive="Checkbox, Switch">
        <div className="stack">
          <Checkbox defaultSelected>{t.c1}</Checkbox>
          <Checkbox isIndeterminate>{t.c2}</Checkbox>
          <Checkbox isDisabled>{t.c3}</Checkbox>
          <Switch defaultSelected>{t.sw}</Switch>
        </div>
      </Spec>
      <Spec id="checkbox-group" name={tr("Checkbox group", "مجموعة مربعات")} primitive="CheckboxGroup">
        <CheckboxGroup label={tr("Send alerts by", "إرسال التنبيهات عبر")} defaultValue={["email", "app"]} description={tr("Pick at least one.", "اختر وسيلة واحدة على الأقل.")} isRequired>
          <Checkbox value="email">{tr("Email", "البريد الإلكتروني")}</Checkbox>
          <Checkbox value="app">{tr("In-app notification", "إشعار داخل التطبيق")}</Checkbox>
          <Checkbox value="sms">{tr("SMS", "رسالة نصية")}</Checkbox>
          <Checkbox value="whatsapp">WhatsApp</Checkbox>
        </CheckboxGroup>
      </Spec>
      <Spec id="radio" name={t.radio} primitive="RadioGroup">
        <RadioGroup label={t.format} defaultValue="summary" orientation="horizontal">
          <Radio value="summary">{t.summary}</Radio><Radio value="detailed">{t.detailed}</Radio><Radio value="raw">{t.raw}</Radio>
        </RadioGroup>
      </Spec>
      <Spec id="radio-cards" name={tr("Radio cards", "بطاقات خيارات")} primitive="RadioGroup + Radio" note={tr("Same behaviour, bigger targets for important choices.", "نفس السلوك، بمساحة أكبر للاختيارات المهمة.")}>
        <RadioGroup label={tr("Plan", "الخطة")} defaultValue="growth" orientation="horizontal" cards>
          <RadioCard value="starter" title={tr("Starter", "البداية")} description={tr("Up to 5 users, core reports.", "حتى ٥ مستخدمين وتقارير أساسية.")} />
          <RadioCard value="growth" title={tr("Growth", "النمو")} badge={<Badge tone="accent">{tr("Popular", "الأكثر طلبًا")}</Badge>} description={tr("Up to 50 users, the AI assistant.", "حتى ٥٠ مستخدمًا والمساعد الذكي.")} />
          <RadioCard value="enterprise" title={tr("Enterprise", "المؤسسات")} description={tr("Unlimited users, SSO, audit log.", "عدد غير محدود، دخول موحد، سجل تدقيق.")} />
        </RadioGroup>
      </Spec>
      <Spec id="slider" name={tr("Slider and range", "شريط تمرير ونطاق")} primitive="Slider">
        <div className="grid2">
          <Slider label={t.threshold} defaultValue={80} minValue={50} maxValue={99} formatOptions={{ style: "unit", unit: "percent" }} />
          <Slider label={tr("Deal size", "حجم الصفقة")} defaultValue={[200000, 1200000]} minValue={0} maxValue={2500000} step={50000}
            thumbLabels={[tr("Minimum", "الحد الأدنى"), tr("Maximum", "الحد الأقصى")]}
            formatOptions={{ style: "currency", currency: "EGP", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }} />
        </div>
      </Spec>
      <SettingRowsSpec />
      <PromptEditorSpec />
      <Spec id="form" name={tr("Form validation", "التحقق من النموذج")} primitive="Form" note={tr("Submit it empty: errors appear under each field and focus moves to the first one.", "أرسله فارغًا: تظهر الأخطاء تحت كل حقل وينتقل التركيز إلى أولها.")}>
        <Form onSubmit={(e) => { e.preventDefault(); toast({ tone: "success", title: tr("Workspace created", "تم إنشاء مساحة العمل") }); }}>
          <div className="grid2">
            <TextField name="ws" label={tr("Workspace name", "اسم مساحة العمل")} isRequired />
            <TextField name="owner" type="email" label={tr("Owner email", "بريد المالك")} isRequired />
          </div>
          <Checkbox name="terms" isRequired>{tr("I agree to the data processing terms", "أوافق على شروط معالجة البيانات")}</Checkbox>
          <div className="row"><Button type="submit">{tr("Create workspace", "إنشاء مساحة العمل")}</Button><Button type="reset" variant="ghost">{tr("Reset", "إعادة تعيين")}</Button></div>
        </Form>
      </Spec>
    </>
  );
}

export function Dates() {
  const tr = useTr(); const t = useT();
  const lang = useLang();
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const now = today(getLocalTimeZone());
  let sendDate = now.add({ days: 3 });
  while (isWeekend(sendDate, locale)) sendDate = sendDate.add({ days: 1 });
  return (
    <>
      <ViewHeader viewId="dates" intro={tr("Date order, numerals, first day of the week and weekends all follow the reader's locale. Switch to Arabic to see Saturday-first weeks and Friday–Saturday weekends.", "ترتيب التاريخ والأرقام وأول أيام الأسبوع والعطلات كلها تتبع لغة القارئ. انتقل إلى العربية لترى الأسبوع يبدأ يوم السبت والعطلة يومي الجمعة والسبت.")} />
      <Spec id="date-field" name={tr("Date field", "حقل تاريخ")} primitive="DateField" note={tr("Type each part, or use arrow keys to change it.", "اكتب كل جزء أو استخدم مفاتيح الأسهم لتغييره.")}>
        <div className="grid2"><DateField label={tr("Contract start", "بداية العقد")} defaultValue={now} /></div>
      </Spec>
      <Spec id="time-field" name={tr("Time field", "حقل وقت")} primitive="TimeField">
        <div className="grid2"><TimeField label={tr("Daily digest at", "الملخص اليومي الساعة")} defaultValue={new Time(9, 0)} /></div>
      </Spec>
      <Spec id="date-picker" name={t.date} primitive="DatePicker + Calendar" note={t.dateNote}>
        <div className="grid2"><DatePicker label={t.sendOn} defaultValue={sendDate} minValue={now} isDateUnavailable={(d) => isWeekend(d, locale)} description={t.sendDesc} /></div>
      </Spec>
      <Spec id="date-range-picker" name={tr("Date range picker", "منتقي نطاق التاريخ")} primitive="DateRangePicker">
        <div className="grid2"><DateRangePicker label={tr("Report period", "فترة التقرير")} defaultValue={{ start: now.subtract({ days: 30 }), end: now }} /></div>
      </Spec>
      <Spec id="calendar" name={tr("Calendar", "التقويم")} primitive="Calendar">
        <Calendar aria-label={tr("Meeting date", "تاريخ الاجتماع")} defaultValue={now} minValue={now} isDateUnavailable={(d) => isWeekend(d, locale)} />
      </Spec>
      <CalendarPickersSpec />
      <Spec id="range-calendar" name={tr("Range calendar", "تقويم النطاق")} primitive="RangeCalendar">
        <RangeCalendar aria-label={tr("Campaign dates", "تواريخ الحملة")} defaultValue={{ start: now.add({ days: 2 }), end: now.add({ days: 9 }) }} />
      </Spec>
    </>
  );
}
