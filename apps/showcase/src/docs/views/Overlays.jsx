"use client";
import { useState } from "react";
import {
  Button, IconButton, Tooltip, Modal, ConfirmDialog, Drawer, InfoPopover, MenuButton, MenuItem, MenuSeparator, MenuSection,
  SelectableMenuItem, Submenu, TextField, Checkbox, Select, Item, Switch, toast, Banner, useFormat,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useT, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { SheetSpec } from "./Phase2.jsx";

export function Overlays() {
  const tr = useTr(); const t = useT(); const lang = useLang(); const f = useFormat();
  const [confirm, setConfirm] = useState(false);
  const [del, setDel] = useState(false);
  const [big, setBig] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [sort, setSort] = useState(new Set(["value"]));
  const startLabel = lang === "ar" ? "فتح من اليمين" : "Open on the left";
  const endLabel = lang === "ar" ? "فتح من اليسار" : "Open on the right";
  return (
    <>
      <ViewHeader viewId="overlays" intro={tr("Overlays trap focus while open, close with Escape and return focus to whatever opened them.", "الطبقات تحبس التركيز أثناء فتحها، وتُغلق بمفتاح Esc، وتعيد التركيز إلى ما فتحها.")} />
      <Spec id="dialog" name={t.dialog} primitive="DialogTrigger + Modal" note={t.dialogNote}>
        <Modal trigger={<Button variant="secondary">{t.share}</Button>} title={t.shareTitle}>
          {({ close }) => (
            <>
              <p className="body muted">{t.shareBody}</p>
              <TextField label={t.emails} placeholder="name@company.com" autoFocus />
              <Checkbox defaultSelected>{t.notify}</Checkbox>
              <div className="tv-dialog-actions">
                <Button variant="ghost" onPress={close}>{t.cancel}</Button>
                <Button onPress={() => { close(); toast({ tone: "success", title: tr("Report shared", "تمت مشاركة التقرير") }); }}>{t.share}</Button>
              </div>
            </>
          )}
        </Modal>
      </Spec>
      <Spec id="confirm-dialog" name={tr("Confirmation", "تأكيد")} primitive="Modal + Dialog" note={tr("For consequential but reversible actions. The confirm label repeats the action.", "للإجراءات المهمة القابلة للتراجع. زر التأكيد يكرر اسم الإجراء.")}>
        <Button onPress={() => setConfirm(true)}>{tr("Publish workflow", "نشر سير العمل")}</Button>
        <ConfirmDialog isOpen={confirm} onOpenChange={setConfirm} icon={<Icon.Send className="tv-flip" />} title={tr("Publish “Weekly churn report”?", "نشر «تقرير فقدان العملاء الأسبوعي»؟")}
          confirmLabel={tr("Publish workflow", "نشر سير العمل")} onConfirm={() => toast({ tone: "success", title: tr("Workflow published", "تم نشر سير العمل"), description: tr("First run on Monday at 9:00.", "أول تشغيل يوم الاثنين الساعة ٩:٠٠.") })}>
          <p>{tr("It will run every Monday and email 14 people. You can pause it at any time.", "سيعمل كل يوم اثنين ويرسل بريدًا إلى ١٤ شخصًا. يمكنك إيقافه مؤقتًا في أي وقت.")}</p>
        </ConfirmDialog>
      </Spec>
      <Spec id="delete-dialog" name={tr("Destructive confirmation", "تأكيد الحذف")} primitive="Modal + Dialog (alertdialog)" note={tr("For actions you can't undo: the person types the name to unlock the button, and clicking outside doesn't close it.", "للإجراءات التي لا يمكن التراجع عنها: يكتب الشخص الاسم لتفعيل الزر، والضغط خارج النافذة لا يغلقها.")}>
        <Button variant="danger" onPress={() => setDel(true)}><Icon.Trash />{tr("Delete workspace", "حذف مساحة العمل")}</Button>
        <ConfirmDialog isOpen={del} onOpenChange={setDel} tone="danger" icon={<Icon.AlertTriangle />} requireText="Nile Foods"
          title={tr("Delete the Nile Foods workspace?", "حذف مساحة عمل Nile Foods؟")} confirmLabel={tr("Delete workspace", "حذف مساحة العمل")}
          onConfirm={() => toast({ tone: "danger", title: tr("Workspace deleted", "تم حذف مساحة العمل") })}>
          <p>{tr("This removes 1,240 contacts, 86 deals and every report. It can't be undone.", "سيؤدي هذا إلى حذف ١٬٢٤٠ جهة اتصال و٨٦ صفقة وكل التقارير، ولا يمكن التراجع عنه.")}</p>
        </ConfirmDialog>
      </Spec>
      <Spec id="full-dialog" name={tr("Large dialog", "نافذة كبيرة")} primitive="Modal" note={tr("Wider on desktop and full screen on phones; small dialogs become bottom sheets on phones.", "أعرض على الحاسوب وبملء الشاشة على الهاتف، والنوافذ الصغيرة تصبح أوراقًا سفلية على الهاتف.")}>
        <Button variant="secondary" onPress={() => setBig(true)}>{tr("Connect a data source", "ربط مصدر بيانات")}</Button>
        <ConfirmDialog isOpen={big} onOpenChange={setBig} size="full" title={tr("Connect a data source", "ربط مصدر بيانات")} confirmLabel={tr("Connect", "ربط")}
          onConfirm={() => toast({ tone: "success", title: tr("HubSpot connected", "تم ربط HubSpot"), description: tr("First sync takes about 10 minutes.", "تستغرق المزامنة الأولى نحو ١٠ دقائق.") })}>
          <div className="stack">
            <Banner tone="info" title={tr("Read-only access", "صلاحية قراءة فقط")}>{tr("Truvar never writes to your CRM unless you turn on two-way sync.", "لا يكتب Truvar في نظامك إلا إذا فعّلت المزامنة الثنائية.")}</Banner>
            <div className="grid2">
              <Select label={tr("Source", "المصدر")} defaultSelectedKey="hs" items={[{ id: "hs", n: "HubSpot" }, { id: "sf", n: "Salesforce" }]}>{(s) => <Item id={s.id}>{s.n}</Item>}</Select>
              <TextField label={tr("Account ID", "معرّف الحساب")} defaultValue="44871203" />
            </div>
            <Switch>{tr("Two-way sync", "مزامنة ثنائية")}</Switch>
          </div>
        </ConfirmDialog>
      </Spec>
      <Spec id="drawer" name={tr("Drawer", "لوحة جانبية")} primitive="Modal (start / end)" note={tr("Opens from the start or end edge, so it mirrors in Arabic. See the full HubSpot-style example in Record panel.", "تُفتح من بداية الشاشة أو نهايتها، فتنعكس في العربية. شاهد المثال الكامل بأسلوب HubSpot في لوحة السجل.")}>
        <div className="row">
          <Button variant="secondary" onPress={() => setDrawer("start")}>{startLabel}</Button>
          <Button variant="secondary" onPress={() => setDrawer("end")}>{endLabel}</Button>
        </div>
        <Drawer isOpen={!!drawer} onOpenChange={(o) => !o && setDrawer(null)} side={drawer ?? "end"} width={400}
          title={tr("Filters", "عوامل التصفية")} subtitle={tr("Narrow the contacts list", "ضيّق قائمة جهات الاتصال")}
          footer={({ close }) => <><Button variant="ghost" onPress={close}>{tr("Reset", "إعادة تعيين")}</Button><Button onPress={close}>{tr("Show 48 contacts", "عرض ٤٨ جهة اتصال")}</Button></>}>
          <Select label={tr("Owner", "المسؤول")} items={t.people.map((n, i) => ({ id: i, n }))}>{(p) => <Item id={p.id}>{p.n}</Item>}</Select>
          <Checkbox defaultSelected>{tr("Only open deals", "الصفقات المفتوحة فقط")}</Checkbox>
          <Checkbox>{tr("Has a meeting this week", "لديه اجتماع هذا الأسبوع")}</Checkbox>
          <Switch>{tr("Include archived", "تضمين المؤرشف")}</Switch>
        </Drawer>
      </Spec>
      <SheetSpec />
      <Spec id="popover" name={tr("Popover", "نافذة منبثقة")} primitive="DialogTrigger + Popover + OverlayArrow" note={tr("Non-modal: for short explanations next to what they explain.", "غير مقيدة: لشرح قصير بجوار ما تشرحه.")}>
        <div className="row">
          <span className="body">{tr("Win rate", "معدل الفوز")} <b>{f.number(0.67, { style: "percent" })}</b></span>
          <InfoPopover title={tr("How win rate works", "كيف يُحسب معدل الفوز")}
            trigger={<IconButton label={tr("About win rate", "عن معدل الفوز")}><Icon.Info /></IconButton>}>
            <p style={{ margin: 0 }}>{tr("Deals won divided by deals closed in the period. Open deals don't count.", "الصفقات الناجحة مقسومة على الصفقات المغلقة في الفترة. الصفقات المفتوحة لا تُحتسب.")}</p>
          </InfoPopover>
        </div>
      </Spec>
      <Spec id="menu" name={t.menu} primitive="MenuTrigger + Menu + SubmenuTrigger" note={tr("Sections, a single-choice group and a submenu. Type a letter to jump.", "أقسام ومجموعة اختيار واحد وقائمة فرعية. اكتب حرفًا للانتقال.")}>
        <div className="row">
          <MenuButton label={t.actions} onAction={(k) => toast({ tone: "info", title: String(k) })}>
            <MenuItem id="edit" icon={<Icon.Pencil />}>{t.edit}</MenuItem>
            <MenuItem id="dup" icon={<Icon.Copy />}>{t.duplicate}</MenuItem>
            <Submenu label={tr("Move to", "نقل إلى")} icon={<Icon.Folder />}>
              <MenuItem id="m-sales">{tr("Sales", "المبيعات")}</MenuItem>
              <MenuItem id="m-ops">{tr("Operations", "العمليات")}</MenuItem>
              <MenuItem id="m-archive">{tr("Archive", "الأرشيف")}</MenuItem>
            </Submenu>
            <MenuSeparator />
            <MenuItem id="del" icon={<Icon.Trash />} danger>{t.del}</MenuItem>
          </MenuButton>
          <MenuButton label={tr("Sort", "ترتيب")}>
            <MenuSection title={tr("Sort by", "الترتيب حسب")} selectionMode="single" selectedKeys={sort} onSelectionChange={setSort}>
              <SelectableMenuItem id="value">{tr("Deal value", "قيمة الصفقة")}</SelectableMenuItem>
              <SelectableMenuItem id="activity">{tr("Last activity", "آخر نشاط")}</SelectableMenuItem>
              <SelectableMenuItem id="name">{tr("Name", "الاسم")}</SelectableMenuItem>
            </MenuSection>
          </MenuButton>
          <MenuButton label={t.more} icon={<Icon.More />}>
            <MenuItem id="rename">{t.rename}</MenuItem>
            <MenuItem id="archive">{t.archive}</MenuItem>
          </MenuButton>
        </div>
      </Spec>
      <Spec id="tooltip" name={t.tooltip} primitive="TooltipTrigger" note={t.tooltipNote}>
        <div className="row">
          {[["top", "Above", "بالأعلى"], ["bottom", "Below", "بالأسفل"], ["start", "Start", "البداية"], ["end", "End", "النهاية"]].map(([p, en, ar]) => (
            <Tooltip key={p} content={tr(`Tooltip: ${en.toLowerCase()}`, `تلميح: ${ar}`)} placement={p}><Button variant="secondary" size="sm">{tr(en, ar)}</Button></Tooltip>
          ))}
        </div>
      </Spec>
    </>
  );
}
