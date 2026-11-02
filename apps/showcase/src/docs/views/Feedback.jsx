"use client";
import { useState, useEffect } from "react";
import {
  Button, toast, Banner, NotificationCenter, ProgressBar, Meter, Badge, Skeleton, EmptyState, OrbitLoader,
  SegmentButton, ToggleButtonGroup, Avatar, useFormat,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { STAGES } from "../data.js";
import { useLang } from "../i18n.jsx";

export function useNotifications() {
  const tr = useTr();
  const f = useFormat();
  const [read, setRead] = useState(new Set());
  // Items with detail open a reading view in the panel and a full page at #inbox/<id>
  const done = (title) => (close) => { close?.(); toast({ tone: "success", title }); };
  const base = [
    { id: "n0", icon: <Icon.Mail />, title: tr("Mona Fathy replied: Pricing for 50 seats", "ردّت منى فتحي: تسعير ٥٠ مقعدًا"), time: f.relative(0),
      detail: {
        avatar: <Avatar name="Mona Fathy" size={40} />, from: "Mona Fathy · Sinai Retail", subject: tr("Re: Pricing for 50 seats", "رد: تسعير ٥٠ مقعدًا"),
        preview: tr("Thanks for the proposal. Before we sign, can you confirm…", "شكرًا على العرض. قبل التوقيع، هل يمكنك تأكيد…"),
        body: tr(
          <><p>Hi,</p><p>Thanks for the proposal. Before we sign, can you confirm two things?</p><ul><li>Is Arabic voice included in the Growth plan?</li><li>Can we start with 30 seats and add 20 in March?</li></ul><p>If both are yes, we can sign this week.</p><p>Mona</p></>,
          <><p>مرحبًا،</p><p>شكرًا على العرض. قبل التوقيع، هل يمكنك تأكيد أمرين؟</p><ul><li>هل الصوت العربي مشمول في خطة النمو؟</li><li>هل يمكن البدء بـ٣٠ مقعدًا وإضافة ٢٠ في مارس؟</li></ul><p>إذا كانت الإجابة نعم على الاثنين، يمكننا التوقيع هذا الأسبوع.</p><p>منى</p></>),
        actions: [{ label: tr("Reply", "رد"), onPress: done(tr("Reply drafted", "تمت صياغة الرد")) }, { label: tr("Open deal", "فتح الصفقة"), onPress: (close) => { close?.(); location.hash = "data"; } }],
        href: "#inbox/n0",
      } },
    { id: "n1", icon: <Icon.TrendUp />, title: tr("Delta Freight opened your proposal 3 times", "فتحت Delta Freight عرضك ٣ مرات"), time: f.relative(0),
      detail: {
        from: "Tarek Saleh · Delta Freight", preview: tr("Most time spent on the pricing page", "قضوا معظم الوقت في صفحة الأسعار"),
        body: tr(
          <><p>Tarek viewed the proposal 3 times today, for 11 minutes in total. Most of that time was on the pricing page.</p><p>Deals that get this attention close 2× more often when you follow up within a day.</p></>,
          <><p>شاهد طارق العرض ٣ مرات اليوم، لمدة ١١ دقيقة إجمالًا، معظمها في صفحة الأسعار.</p><p>الصفقات التي تحظى بهذا الاهتمام تُغلق بمعدل الضعف عند المتابعة خلال يوم.</p></>),
        actions: [{ label: tr("Call Tarek", "اتصل بطارق"), onPress: done(tr("Calling Tarek Saleh", "جارٍ الاتصال بطارق صالح")) }, { label: tr("Send follow-up", "أرسل متابعة"), onPress: done(tr("Follow-up scheduled", "تمت جدولة المتابعة")) }],
        href: "#inbox/n1",
      } },
    { id: "n2", icon: <Icon.Users />, title: tr("Laila assigned you 4 new leads", "أسندت إليك ليلى ٤ عملاء جدد"), time: f.relative(0),
      detail: {
        from: "Laila Mansour",
        body: <><p>{tr("These leads came from the Cairo webinar:", "جاء هؤلاء العملاء من ندوة القاهرة:")}</p><ul><li>Karim Mostafa · Giza Motors</li><li>Salma Adel · Red Sea Resorts</li><li>Mahmoud Gaber · Port Said Logistics</li><li>Yasmin Hosny · Mansoura Dairy</li></ul></>,
        actions: [{ label: tr("View leads", "عرض العملاء"), onPress: (close) => { close?.(); location.hash = "overview"; } }],
        href: "#inbox/n2",
      } },
    { id: "n3", icon: <Icon.CheckCircle />, title: tr("Alex Pharma signed the annual plan", "وقّعت Alex Pharma على الخطة السنوية"), time: f.relative(1),
      detail: {
        from: "Hany Ibrahim · Alex Pharma",
        body: tr(<p>The annual Growth plan is signed: 120 seats, EGP 2,100,000 a year, starting 1 December. Onboarding is booked for next Tuesday.</p>,
          <p>تم توقيع خطة النمو السنوية: ١٢٠ مقعدًا، بقيمة ٢٬١٠٠٬٠٠٠ ج.م. سنويًا، تبدأ في ١ ديسمبر. موعد التهيئة يوم الثلاثاء القادم.</p>),
        href: "#inbox/n3",
      } },
    { id: "n4", icon: <Icon.FileText />, title: tr("Weekly churn report is ready", "تقرير فقدان العملاء الأسبوعي جاهز"), time: f.relative(3) },
  ];
  const items = base.map((n, i) => ({ ...n, unread: i < 4 && !read.has(n.id) }));
  return {
    items,
    markAll: () => setRead(new Set(base.map((n) => n.id))),
    open: (id) => setRead((r) => new Set([...r, id])),
  };
}

export function Feedback() {
  const tr = useTr(); const lang = useLang();
  const [banners, setBanners] = useState({ info: true, success: true, warning: true, danger: true });
  const [upload, setUpload] = useState(0);
  const [loaded, setLoaded] = useState("loading");
  const notif = useNotifications();
  useEffect(() => {
    if (upload <= 0 || upload >= 100) return;
    const id = setTimeout(() => {
      const next = Math.min(100, upload + 7);
      setUpload(next);
      if (next === 100) toast({ tone: "success", title: tr("Upload complete", "اكتمل الرفع"), description: "q3-contacts.csv" });
    }, 160);
    return () => clearTimeout(id);
  }, [upload, tr]);
  return (
    <>
      <ViewHeader viewId="feedback" intro={tr("Tell people what happened, in plain words, at the right volume: toasts for passing confirmations, banners for things that need attention, dialogs only when a decision is needed.", "أخبر الناس بما حدث بكلمات بسيطة وبالقدر المناسب: إشعارات منبثقة للتأكيدات العابرة، وتنبيهات لما يحتاج انتباهًا، ونوافذ فقط عند الحاجة إلى قرار.")} />
      <Spec id="toast" name={tr("Toasts", "الإشعارات المنبثقة")} primitive="ToastQueue + ToastRegion" note={tr("They stack at the bottom end, pause while hovered or focused, and are announced to screen readers. F6 jumps to them.", "تتراكم أسفل نهاية الشاشة، وتتوقف عند المرور أو التركيز، وتُعلن لقارئات الشاشة. مفتاح F6 ينقلك إليها.")}>
        <div className="row">
          <Button variant="secondary" onPress={() => toast({ tone: "success", title: tr("Report sent to 14 people", "تم إرسال التقرير إلى ١٤ شخصًا") })}>{tr("Success", "نجاح")}</Button>
          <Button variant="secondary" onPress={() => toast({ tone: "danger", title: tr("Sync with HubSpot failed", "فشلت المزامنة مع HubSpot"), description: tr("The access token expired. Reconnect to resume.", "انتهت صلاحية رمز الوصول. أعد الربط للمتابعة."), action: { label: tr("Reconnect", "إعادة الربط"), onAction: () => toast({ tone: "success", title: tr("Reconnected", "تمت إعادة الربط") }) } })}>{tr("Error with action", "خطأ مع إجراء")}</Button>
          <Button variant="secondary" onPress={() => toast({ tone: "warning", title: tr("3 contacts have no owner", "٣ جهات اتصال بلا مسؤول"), description: tr("They won't get follow-up reminders.", "لن تصلها تذكيرات المتابعة.") })}>{tr("Warning", "تحذير")}</Button>
          <Button variant="secondary" onPress={() => toast({ tone: "info", title: tr("Deal archived", "تمت أرشفة الصفقة"), action: { label: tr("Undo", "تراجع"), onAction: () => toast({ tone: "info", title: tr("Deal restored", "تمت استعادة الصفقة") }) } })}>{tr("With undo", "مع تراجع")}</Button>
        </div>
      </Spec>
      <Spec id="banner" name={tr("Alert banners", "تنبيهات")} primitive="role=status / alert" note={tr("Inline, persistent messages. Colour always comes with an icon and words.", "رسائل ثابتة داخل الصفحة. اللون دائمًا مع أيقونة وكلمات.")}>
        <div className="stack">
          {banners.info && <Banner tone="info" title={tr("Scheduled maintenance on Friday", "صيانة مجدولة يوم الجمعة")} onDismiss={() => setBanners((b) => ({ ...b, info: false }))}>{tr("Reports pause from 02:00 to 03:00 Cairo time.", "تتوقف التقارير من ٠٢:٠٠ إلى ٠٣:٠٠ بتوقيت القاهرة.")}</Banner>}
          {banners.success && <Banner tone="success" title={tr("Salesforce is connected", "تم ربط Salesforce")} onDismiss={() => setBanners((b) => ({ ...b, success: false }))}>{tr("4,812 records imported. Duplicates were merged by email.", "تم استيراد ٤٬٨١٢ سجلًا ودمج المكرر حسب البريد.")}</Banner>}
          {banners.warning && <Banner tone="warning" title={tr("You've used 92% of your AI credits", "استخدمت ٩٢٪ من رصيد الذكاء الاصطناعي")} action={<Button size="sm">{tr("Add credits", "إضافة رصيد")}</Button>}>{tr("Credits reset on 1 November.", "يُعاد تعيين الرصيد في ١ نوفمبر.")}</Banner>}
          {banners.danger && <Banner tone="danger" title={tr("Payment failed", "فشل الدفع")} action={<><Button size="sm" variant="danger-solid">{tr("Update card", "تحديث البطاقة")}</Button><Button size="sm" variant="ghost">{tr("Contact billing", "تواصل مع الفوترة")}</Button></>}>{tr("We'll retry on 30 October. Update your card to avoid a pause.", "سنعيد المحاولة في ٣٠ أكتوبر. حدّث بطاقتك لتجنب الإيقاف.")}</Banner>}
          {!Object.values(banners).every(Boolean) && <div><Button variant="ghost" size="sm" onPress={() => setBanners({ info: true, success: true, warning: true, danger: true })}>{tr("Show all again", "إظهار الكل مجددًا")}</Button></div>}
        </div>
      </Spec>
      <Spec id="notifications" name={tr("Notification centre", "مركز الإشعارات")} primitive="DialogTrigger + Popover + GridList" note={tr("The same component sits in the top bar. The count is announced with the button label.", "نفس المكوّن موجود في الشريط العلوي، ويُعلن العدد مع اسم الزر.")}>
        <div className="row">
          <NotificationCenter items={notif.items} onMarkAllRead={notif.markAll} onOpenItem={notif.open} />
          <span className="tv-desc">{tr("Open the bell", "افتح الجرس")}</span>
        </div>
      </Spec>
      <Spec id="progress" name={tr("Progress bar", "شريط التقدم")} primitive="ProgressBar" note={tr("Determinate when you know how much is left; indeterminate when you don't.", "محدد عندما تعرف المتبقي، وغير محدد عندما لا تعرفه.")}>
        <div className="stack" style={{ maxWidth: 460 }}>
          <ProgressBar label={tr("Uploading q3-contacts.csv", "جارٍ رفع q3-contacts.csv")} value={upload} />
          <div><Button size="sm" variant="secondary" onPress={() => setUpload(1)} isDisabled={upload > 0 && upload < 100}>{tr("Start upload", "بدء الرفع")}</Button></div>
          <ProgressBar label={tr("Matching duplicates", "مطابقة السجلات المكررة")} isIndeterminate />
          <OrbitLoader label={tr("Searching", "جارٍ البحث")} />
        </div>
      </Spec>
      <Spec id="meter" name={tr("Meter", "مقياس")} primitive="Meter" note={tr("A known amount within a range. It turns warning, then danger, and says so in words.", "كمية معروفة ضمن نطاق، يتحول إلى تحذير ثم خطر ويقول ذلك بالكلمات.")}>
        <div className="stack" style={{ maxWidth: 460 }}>
          <Meter label={tr("Seats used", "المقاعد المستخدمة")} value={34} maxValue={50} valueLabel={tr("34 of 50", "٣٤ من ٥٠")} />
          <Meter label={tr("Storage", "مساحة التخزين")} value={81} statusText={{ warning: tr("Getting full", "تقترب من الامتلاء") }} />
          <Meter label={tr("AI credits", "رصيد الذكاء الاصطناعي")} value={92} statusText={{ danger: tr("Almost out", "على وشك النفاد") }} />
        </div>
      </Spec>
      <Spec id="badge" name={tr("Badges", "الشارات")} primitive="span" note={tr("Short status labels. Always a word, never colour alone.", "تسميات حالة قصيرة، دائمًا بكلمة وليس باللون وحده.")}>
        <div className="row">{STAGES.map((s) => <Badge key={s.id} tone={s.tone} dot>{lang === "ar" ? s.ar : s.en}</Badge>)}</div>
      </Spec>
      <Spec id="skeleton" name={tr("Loading skeleton", "هيكل التحميل")} primitive="div (aria-hidden)" note={tr("Shows the shape of what's coming. Pair it with a busy region so screen readers know.", "يعرض شكل المحتوى القادم، مع منطقة مشغولة لتعرف قارئات الشاشة.")}>
        <div className="stack">
          <ToggleButtonGroup aria-label={tr("State", "الحالة")} selectionMode="single" disallowEmptySelection selectedKeys={[loaded]} onSelectionChange={(k) => setLoaded([...k][0])}>
            <SegmentButton id="loading">{tr("Loading", "تحميل")}</SegmentButton>
            <SegmentButton id="loaded">{tr("Loaded", "تم التحميل")}</SegmentButton>
          </ToggleButtonGroup>
          <div className="skel-card" aria-busy={loaded === "loading"}>
            {loaded === "loading" ? <><Skeleton avatar lines={3} /><Skeleton lines={2} /></> : (
              <div className="stack">
                <div className="tv-cell-person"><Avatar name={tr("Nadia Kamel", "نادية كامل")} size={40} /><span><b>{tr("Nadia Kamel", "نادية كامل")}</b><span className="tv-desc">Nile Foods</span></span></div>
                <p className="body" style={{ margin: 0 }}>{tr("Asked for pricing on the annual plan and a pilot for two warehouses.", "طلبت أسعار الخطة السنوية وتجربة في مستودعين.")}</p>
              </div>
            )}
          </div>
        </div>
      </Spec>
      <Spec id="empty-state" name={tr("Empty state", "حالة فارغة")} primitive="div" note={tr("An empty screen is an invitation to act.", "الشاشة الفارغة دعوة لاتخاذ إجراء.")}>
        <div className="skel-card">
          <EmptyState title={tr("No reports yet", "لا توجد تقارير بعد")} action={<Button><Icon.Plus />{tr("Create a report", "إنشاء تقرير")}</Button>}>
            {tr("Reports turn your CRM data into a weekly email your team will actually read.", "التقارير تحول بيانات عملائك إلى رسالة أسبوعية يقرؤها فريقك فعلًا.")}
          </EmptyState>
        </div>
      </Spec>
    </>
  );
}
