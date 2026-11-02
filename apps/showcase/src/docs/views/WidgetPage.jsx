"use client";
// Website widget: the AI agent a business embeds on its own site. This page runs it on a sample clinic website,
// with a setup panel, a phone preview, the embed code and each building block on its own.
// The agent here is a script: no API calls. The real backend drives the same props later.
import { useState, useRef, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { I18nProvider } from "react-aria-components";
import {
  WebWidget, WidgetScope, AgentSteps, SlotPicker, WidgetApproval, InlineForm, ChoiceCards, ResultCard, WidgetItem, WidgetCall,
  TextField, SegmentedControl, Select, Item, SwitchRow, Button, CodeBlock, toast,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useLang } from "../i18n.jsx";
import { ViewHeader, Spec } from "../ui.jsx";
import { dateFormat, numberFormat } from "@truvar-ai/design-system";

const useTr = () => { const lang = useLang(); return (en, ar) => (lang === "ar" ? ar : en); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0;
const uid = () => "w" + ++n;
const WIDE = "(min-width: 1000px)";
const useWide = () => useSyncExternalStore((cb) => { const q = matchMedia(WIDE); q.addEventListener("change", cb); return () => q.removeEventListener("change", cb); },
  () => matchMedia(WIDE).matches, () => true);

const ACCENTS = [
  { id: "#0f6e5c", en: "Teal", ar: "أزرق مخضر" }, { id: "#0b1f5c", en: "Navy", ar: "كحلي" }, { id: "#16a34a", en: "Green", ar: "أخضر" },
  { id: "#6d3fd6", en: "Violet", ar: "بنفسجي" }, { id: "#d9480f", en: "Orange", ar: "برتقالي" }, { id: "#111827", en: "Black", ar: "أسود" },
];
const MONA = { name: "Mona Adel", avatar: "https://randomuser.me/api/portraits/women/68.jpg" };

/* ---------- The scripted agent ---------- */
function useDemoAgent({ L, locale, agentName }) {
  const [items, setItems] = useState([]);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [call, setCall] = useState(null);
  const [handoff, setHandoff] = useState(false);
  const epoch = useRef(0);
  const ctx = useRef({});
  const alive = (e) => e === epoch.current;
  const push = (it) => { const item = { id: uid(), time: new Date(), from: "agent", type: "text", ...it }; setItems((x) => [...x, item]); return item.id; };
  const patch = (id, ch) => setItems((x) => x.map((it) => (it.id === id ? { ...it, ...(typeof ch === "function" ? ch(it) : ch) } : it)));

  const say = async (e, text, extra = {}, ms = 900) => {
    setTyping(handoff ? MONA.name : true); await sleep(ms); if (!alive(e)) return; setTyping(false);
    return push({ text, ...extra });
  };
  const steps = async (e, labels, each = 750) => {
    const id = push({ type: "steps", steps: labels.map((l, i) => ({ label: l, state: i === 0 ? "running" : "pending" })) });
    for (let i = 0; i < labels.length; i++) {
      await sleep(each); if (!alive(e)) return;
      patch(id, (it) => ({ steps: it.steps.map((s, j) => ({ ...s, state: j <= i ? "done" : j === i + 1 ? "running" : s.state })) }));
    }
    await sleep(250);
  };

  // The next four days with open times
  const days = (count = 4, from = 1) => Array.from({ length: count }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + from + i);
    const times = [[10, 0], [11, 30], [13, 0], [15, 0], [17, 30], [19, 30]].filter((_, j) => (i + j) % 3 !== 1);
    return {
      id: d.toDateString(), weekday: dateFormat(locale, { weekday: "short" }).format(d), date: numberFormat(locale).format(d.getDate()),
      slots: times.map(([h, m]) => ({ id: `${h}:${m}`, label: dateFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(2026, 0, 1, h, m)) })),
    };
  });
  const SERVICES = () => [
    { id: "clean", icon: <Icon.Sparkles />, title: L("Cleaning and polish", "تنظيف وتلميع"), subtitle: L("45 min · Dr. Sara", "٤٥ دقيقة · د. سارة"), price: L("EGP 600", "٦٠٠ ج.م."), mins: 45 },
    { id: "check", icon: <Icon.Search />, title: L("Check-up and X-ray", "كشف وأشعة"), subtitle: L("30 min · Dr. Sara", "٣٠ دقيقة · د. سارة"), price: L("EGP 450", "٤٥٠ ج.م."), mins: 30 },
    { id: "white", icon: <Icon.Star />, title: L("Teeth whitening", "تبييض الأسنان"), subtitle: L("60 min · Dr. Omar", "٦٠ دقيقة · د. عمر"), price: L("EGP 2,500", "٢٬٥٠٠ ج.م."), mins: 60 },
  ];

  const flows = {
    async book(e) {
      await say(e, L("Happy to help. What's the visit for?", "يسعدني ذلك. ما سبب الزيارة؟"));
      if (!alive(e)) return;
      push({ type: "cards", title: L("Services", "الخدمات"), cards: SERVICES(), flow: "book" });
      setSuggestions([L("Not sure, I have tooth pain", "لست متأكدًا، عندي ألم في السن")]);
    },
    async service(e, svc) {
      ctx.current.service = svc;
      await steps(e, [L("Checking Dr. Sara's calendar", "أراجع تقويم د. سارة"), L(`Finding ${svc.mins}-minute gaps`, `أبحث عن فترات ${svc.mins} دقيقة`), L("Found 15 open times", "وجدت ١٥ موعدًا متاحًا")]);
      if (!alive(e)) return;
      await say(e, L("Here are the next open times. Which suits you?", "هذه أقرب المواعيد المتاحة. أيها يناسبك؟"), {}, 600);
      push({ type: "slots", days: days() });
      setSuggestions([L("Anything in the evening?", "هل يوجد موعد مسائي؟")]);
    },
    async picked(e, label) {
      ctx.current.when = label;
      await say(e, L("Great choice. Who should I book it for?", "اختيار ممتاز. باسم من أحجز؟"), {}, 700);
      if (!alive(e)) return;
      push({ type: "form", title: L("Your details", "بياناتك"), fields: [
        { name: "name", label: L("Full name", "الاسم الكامل"), required: true, autoComplete: "name" },
        { name: "phone", label: L("Mobile (for the WhatsApp confirmation)", "الموبايل (لتأكيد واتساب)"), type: "phone", required: true },
      ], submitLabel: L("Continue", "متابعة") });
    },
    async details(e, v) {
      ctx.current.person = v;
      const s = ctx.current.service ?? SERVICES()[1];
      await steps(e, [L("Holding the time for 5 minutes", "أحجز الموعد مؤقتًا لمدة ٥ دقائق")], 700);
      if (!alive(e)) return;
      await say(e, L("Please check everything before I book it:", "راجع التفاصيل قبل أن أؤكد الحجز:"), {}, 500);
      push({ type: "confirm", title: L("Book this appointment?", "تأكيد حجز الموعد؟"), rows: [
        [L("Service", "الخدمة"), s.title], [L("When", "الموعد"), ctx.current.when], [L("With", "مع"), s.subtitle.split("·")[1]?.trim()],
        [L("Where", "المكان"), L("26 El Nile St, Zamalek", "٢٦ شارع النيل، الزمالك")], [L("Price", "السعر"), s.price],
      ], note: L("Pay at the clinic. Free to cancel up to 24 hours before.", "الدفع في العيادة. الإلغاء مجاني حتى ٢٤ ساعة قبل الموعد."),
      confirmLabel: L("Confirm booking", "أكّد الحجز") });
    },
    async confirmed(e) {
      const s = ctx.current.service ?? SERVICES()[1];
      await steps(e, [L("Booking with Dr. Sara", "أحجز مع د. سارة"), L("Sending the WhatsApp confirmation", "أرسل تأكيد واتساب"), L("Setting a reminder for the day before", "أضبط تذكيرًا قبل الموعد بيوم")], 650);
      if (!alive(e)) return;
      push({ type: "result", title: L("You're booked!", "تم الحجز!"), subtitle: L(`See you ${ctx.current.when}`, `نراك ${ctx.current.when}`),
        rows: [[L("Booking", "رقم الحجز"), "#ND-4821"], [L("Service", "الخدمة"), s.title]],
        actions: [{ id: "calendar", label: L("Add to calendar", "أضف للتقويم"), icon: <Icon.Calendar /> }, { id: "map", label: L("Directions", "الاتجاهات"), icon: <Icon.MapPin /> }] });
      ctx.current.booked = true;
      await say(e, L("Anything else I can help with?", "هل أستطيع مساعدتك في شيء آخر؟"), {}, 700);
      setSuggestions([L("No, that's all", "لا، شكرًا"), L("Reschedule", "تغيير الموعد"), L("Talk to a person", "التحدث مع موظف")]);
    },
    async prices(e) {
      await steps(e, [L("Looking up today's price list", "أراجع قائمة الأسعار")], 700);
      if (!alive(e)) return;
      await say(e, L("Here's what most people book. Tap one to see times.", "هذه أكثر الخدمات طلبًا. اختر واحدة لترى المواعيد."), {}, 500);
      push({ type: "cards", title: L("Prices", "الأسعار"), cards: SERVICES().map((c) => ({ ...c, actionLabel: L("Book", "احجز") })), flow: "book" });
      setSuggestions([L("Do you take insurance?", "هل تقبلون التأمين؟")]);
    },
    async reschedule(e) {
      await steps(e, [L("Finding your booking", "أبحث عن حجزك"), L("Checking new times with Dr. Sara", "أراجع مواعيد د. سارة الجديدة")]);
      if (!alive(e)) return;
      await say(e, ctx.current.booked ? L("Found it. Pick a new time and I'll move it for you.", "وجدته. اختر موعدًا جديدًا وسأنقله لك.")
        : L("Found your booking for a check-up. Pick a new time:", "وجدت حجزك لكشف. اختر موعدًا جديدًا:"), {}, 500);
      push({ type: "slots", days: days(3, 2), reschedule: true });
    },
    async moved(e, label) {
      ctx.current.when = label;
      push({ type: "confirm", title: L("Move your appointment?", "نقل موعدك؟"), rows: [[L("New time", "الموعد الجديد"), label], [L("With", "مع"), L("Dr. Sara", "د. سارة")]],
        confirmLabel: L("Move it", "انقله"), reschedule: true });
    },
    async movedDone(e) {
      await steps(e, [L("Moving the booking", "أنقل الحجز"), L("Updating the WhatsApp reminder", "أحدّث تذكير واتساب")], 650);
      if (!alive(e)) return;
      push({ type: "result", title: L("Moved", "تم النقل"), subtitle: ctx.current.when });
      setSuggestions([L("No, that's all", "لا، شكرًا")]);
    },
    async human(e) {
      await steps(e, [L("Summarising the chat for the team", "ألخص المحادثة للفريق"), L("Finding someone available", "أبحث عن موظف متاح")], 800);
      if (!alive(e)) return;
      push({ type: "event", text: L(`${MONA.name} from the front desk joined`, `انضمت ${MONA.name} من الاستقبال`), icon: <Icon.UserCheck /> });
      setHandoff(true);
      setTyping(MONA.name); await sleep(1400); if (!alive(e)) return; setTyping(false);
      push({ from: "human", author: { ...MONA, role: L("Front desk", "الاستقبال") }, text: L("Hi! I'm Mona. I've read the chat. How can I help?", "أهلًا! أنا منى، قرأت المحادثة. كيف أقدر أساعدك؟") });
      setSuggestions([]);
    },
    async wrap(e) {
      await say(e, L("Glad I could help. See you soon 😊", "سعيد بمساعدتك. نراك قريبًا 😊"), {}, 700);
      if (!alive(e)) return;
      push({ type: "rating" });
      setSuggestions([]);
    },
    async other(e, text) {
      await steps(e, [L("Searching the clinic's answers", "أبحث في إجابات العيادة")], 800);
      if (!alive(e)) return;
      const insurance = /insur|تأمين/i.test(text);
      await say(e, insurance
        ? L("Yes, we take AXA, Allianz and MetLife. Bring your card and we'll check it at reception.", "نعم، نقبل AXA وAllianz وMetLife. أحضر بطاقتك وسنتحقق منها في الاستقبال.")
        : L("We're open Saturday to Thursday, 10 AM to 10 PM, at 26 El Nile St, Zamalek. Want me to book you in?", "نعمل من السبت إلى الخميس، من ١٠ صباحًا حتى ١٠ مساءً، في ٢٦ شارع النيل بالزمالك. هل أحجز لك موعدًا؟"), {}, 500);
      setSuggestions([L("Book an appointment", "احجز موعدًا"), L("Prices", "الأسعار")]);
    },
  };

  const route = (text) => {
    const s = text.toLowerCase();
    if (/no,? that|that's all|thank|لا، شكر|شكر/.test(s)) return "wrap";
    if (/resched|move|change|تغيير|نقل|تأجيل/.test(s)) return "reschedule";
    if (/person|human|someone|موظف|شخص/.test(s)) return "human";
    if (/price|cost|how much|سعر|أسعار|الأسعار|بكم/.test(s)) return "prices";
    if (/book|appoint|evening|pain|حجز|احجز|موعد|ألم|مسائي/.test(s)) return "book";
    return "other";
  };
  const run = (name, ...a) => { const e = epoch.current; setSuggestions([]); flows[name](e, ...a); };

  const reset = useCallback(() => { epoch.current++; ctx.current = {}; setItems([]); setTyping(false); setSuggestions([]); setCall(null); setHandoff(false); }, []);
  const api = {
    items, typing, suggestions, call,
    send(text) {
      push({ from: "visitor", text, status: "read" });
      if (handoff) { setTimeout(() => push({ from: "human", author: { ...MONA, role: L("Front desk", "الاستقبال") }, text: L("Got it, one moment while I check.", "تمام، لحظة أتحقق.") }), 1600); return; }
      run(route(text), text);
    },
    home(id) {
      const label = { book: L("Book an appointment", "احجز موعدًا"), reschedule: L("Reschedule or cancel", "تغيير الموعد أو إلغاؤه"), prices: L("Prices and insurance", "الأسعار والتأمين"), human: L("Talk to a person", "التحدث مع موظف") }[id];
      push({ from: "visitor", text: label, status: "read" });
      run(id);
    },
    action(item, act, payload) {
      if (item.type === "cards" && act === "choose") { patch(item.id, { selected: payload.id }); push({ from: "visitor", text: payload.title, status: "read" }); run("service", payload); }
      if (item.type === "slots" && act === "pick") { patch(item.id, { selected: payload }); push({ from: "visitor", text: payload.label, status: "read" }); run(item.reschedule ? "moved" : "picked", payload.label); }
      if (item.type === "form" && act === "submit") { patch(item.id, { submitted: payload }); run("details", payload); }
      if (item.type === "confirm" && act === "confirm") { patch(item.id, { state: "confirmed" }); run(item.reschedule ? "movedDone" : "confirmed"); }
      if (item.type === "confirm" && act === "change") { patch(item.id, { state: "cancelled" }); run("service", ctx.current.service ?? SERVICES()[1]); }
      if (item.type === "rating" && act === "rate") patch(item.id, { value: payload });
      if (item.type === "result") toast({ tone: "success", title: act === "calendar" ? L("Added to your calendar", "أُضيف إلى تقويمك") : L("Opening Google Maps", "يفتح خرائط جوجل") });
    },
    voice({ duration }) {
      const e = epoch.current;
      const id = push({ from: "visitor", type: "voice", duration, status: "read" });
      (async () => {
        await steps(e, [L("Listening to your voice note", "أستمع لرسالتك الصوتية"), L("Checking tomorrow evening", "أراجع مواعيد الغد مساءً")], 750);
        if (!alive(e)) return;
        patch(id, { transcript: L("Hi, do you have anything tomorrow evening for a check-up?", "أهلًا، هل يوجد موعد كشف بكرة بالليل؟") });
        ctx.current.service = SERVICES()[1];
        await say(e, L("Yes! Tomorrow evening has two open check-up times:", "نعم! يوجد موعدان متاحان للكشف غدًا مساءً:"), {}, 500);
        const d = days(1)[0];
        push({ type: "slots", days: [{ ...d, slots: d.slots.slice(-2) }] });
      })();
    },
    attach(files) {
      const f = files[0];
      const e = epoch.current;
      push({ from: "visitor", type: "file", name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, status: "read" });
      (async () => {
        await steps(e, [L("Reading the file", "أقرأ الملف"), L("Adding it to your record", "أضيفه إلى ملفك")], 700);
        if (alive(e)) await say(e, L("Thanks. Dr. Sara will see it before your visit.", "شكرًا. ستطلع عليه د. سارة قبل زيارتك."), {}, 500);
      })();
    },
    startCall() {
      const e = epoch.current;
      const script = [
        ["agent", L(`Hi, this is ${agentName} from Nile Dental. How can I help?`, `أهلًا، معك ${agentName} من عيادة النيل. كيف أساعدك؟`), 3.2],
        ["visitor", L("I need a check-up this week, after work if possible.", "أحتاج كشفًا هذا الأسبوع، بعد العمل إن أمكن."), 3],
        ["agent", L("Wednesday at 7:30 PM is free with Dr. Sara. Shall I book it?", "الأربعاء ٧:٣٠ مساءً متاح مع د. سارة. هل أحجزه؟"), 3.4],
        ["visitor", L("Yes please.", "نعم من فضلك."), 1.6],
        ["agent", L("Done. You'll get the confirmation on WhatsApp now.", "تم. سيصلك التأكيد على واتساب الآن."), 3],
      ];
      setCall({ state: "connecting", elapsed: 0, captions: [], speaker: null });
      (async () => {
        await sleep(1500); if (!alive(e)) return;
        const t0 = Date.now();
        setCall((c) => c && { ...c, state: "live" });
        const tick = setInterval(() => setCall((c) => (c && c.state === "live" ? { ...c, elapsed: (Date.now() - t0) / 1000 } : (clearInterval(tick), c))), 250);
        for (const [who, text, secs] of script) {
          if (!alive(e)) return clearInterval(tick);
          setCall((c) => c && c.state === "live" && { ...c, speaker: who, captions: [...c.captions, { from: who, text }] });
          await sleep(secs * 1000);
          setCall((c) => c && c.state === "live" && { ...c, speaker: null });
          await sleep(350);
        }
      })();
    },
    endCall() {
      setCall((c) => {
        if (!c || c.state === "ended") return c;
        if (c.state === "live") push({ type: "call", duration: Math.round(c.elapsed), summary: L("Booked a check-up for Wednesday, 7:30 PM. Confirmation sent on WhatsApp.", "تم حجز كشف يوم الأربعاء ٧:٣٠ مساءً. أُرسل التأكيد على واتساب.") });
        return { ...c, state: "ended", speaker: null };
      });
    },
    mute: (m) => setCall((c) => c && { ...c, muted: m }),
    speaker: (s) => setCall((c) => c && { ...c, loud: s }),
    menu(k) {
      if (k === "new") api.reset();
      if (k === "email") push({ type: "event", text: L("Transcript sent to your email", "أُرسلت المحادثة إلى بريدك"), icon: <Icon.Mail /> });
      if (k === "human") run("human");
    },
    reset,
  };
  return api;
}

/* ---------- The sample customer website ---------- */
function ClinicSite({ L, compact }) {
  return (
    <div className="wsite">
      <header className="wsite-nav">
        <b className="wsite-logo"><Icon.Smile />{L("Nile Dental", "عيادة النيل")}</b>
        {!compact && <nav aria-label={L("Site", "الموقع")}><span>{L("Services", "الخدمات")}</span><span>{L("Doctors", "الأطباء")}</span><span>{L("Prices", "الأسعار")}</span><span>{L("Contact", "تواصل")}</span></nav>}
        <span className="wsite-cta">{L("Book now", "احجز الآن")}</span>
      </header>
      <section className="wsite-hero">
        <p className="wsite-kicker">{L("Zamalek, Cairo · Open till 10 PM", "الزمالك، القاهرة · مفتوح حتى ١٠ م")}</p>
        <h3>{L("Gentle dentistry, booked in a minute.", "رعاية أسنان لطيفة، وحجز في دقيقة.")}</h3>
        <p>{L("Check-ups, cleaning and whitening with Dr. Sara and Dr. Omar. Ask our assistant anything, day or night.", "كشف وتنظيف وتبييض مع د. سارة ود. عمر. اسأل مساعدنا أي شيء ليلًا أو نهارًا.")}</p>
      </section>
      <div className="wsite-cards">
        {[["Sparkles", L("Cleaning", "تنظيف"), L("from EGP 600", "من ٦٠٠ ج.م.")], ["Search", L("Check-up", "كشف"), L("from EGP 450", "من ٤٥٠ ج.م.")], ["Star", L("Whitening", "تبييض"), L("from EGP 2,500", "من ٢٬٥٠٠ ج.م.")]].map(([ic, t, p]) => {
          const I = Icon[ic];
          return <div key={t} className="wsite-card"><I /><b>{t}</b><span>{p}</span></div>;
        })}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export function WidgetPage() {
  const tr = useTr();
  const pageLang = useLang();
  const wide = useWide();
  const [cfg, setCfg] = useState({
    name: pageLang === "ar" ? "ليلى" : "Layla", accent: "#0f6e5c", position: "end", launcher: "icon", language: "page",
    teaser: true, teaserText: "", voiceNotes: true, call: true, attachments: true, powered: true,
  });
  const set = (k) => (v) => setCfg((c) => ({ ...c, [k]: v }));
  const wlang = cfg.language === "page" ? pageLang : cfg.language;
  const L = (en, ar) => (wlang === "ar" ? ar : en);
  const locale = wlang === "ar" ? "ar-EG" : "en-US";
  const agent = useDemoAgent({ L, locale, agentName: cfg.name });
  // A new language or agent name starts a fresh chat, so the script and the words match
  const { reset } = agent;
  useEffect(() => { reset(); }, [wlang, cfg.name, reset]);

  const [device, setDevice] = useState("desktop");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("home");
  const [teaserGone, setTeaserGone] = useState(false);
  const [seen, setSeen] = useState(0);
  useEffect(() => { if (open) setSeen(agent.items.length); }, [open, agent.items.length]);
  const unread = open ? 0 : agent.items.slice(seen).filter((i) => i.from !== "visitor" && i.type !== "steps").length;
  const last = [...agent.items].reverse().find((i) => i.type === "text");

  const props = {
    isOpen: open, onOpenChange: (o) => { setOpen(o); if (o) setTeaserGone(true); }, view, onViewChange: setView,
    agent: { name: cfg.name, subtitle: L("Replies instantly", "يرد فورًا"), status: "online" },
    business: { name: L("Nile Dental", "عيادة النيل") }, team: [MONA, { name: "Omar Fathy", avatar: "https://randomuser.me/api/portraits/men/32.jpg" }],
    accent: cfg.accent, position: cfg.position, launcher: cfg.launcher, launcherText: L("Ask us", "اسألنا"),
    teaser: cfg.teaser && !teaserGone ? (cfg.teaserText || L("Hi 👋 Need a dentist this week? I can book you in now.", "أهلًا 👋 تحتاج طبيب أسنان هذا الأسبوع؟ أقدر أحجز لك الآن.")) : null,
    onTeaserDismiss: () => setTeaserGone(true), unread,
    greeting: L("Hi there", "أهلًا بك"), subtitle: L("How can we help today?", "كيف نقدر نساعدك اليوم؟"),
    homeActions: [
      { id: "book", label: L("Book an appointment", "احجز موعدًا"), description: L("See open times and book in a minute", "شاهد المواعيد واحجز في دقيقة"), icon: <Icon.Calendar /> },
      { id: "reschedule", label: L("Reschedule or cancel", "تغيير الموعد أو إلغاؤه"), icon: <Icon.Clock /> },
      { id: "prices", label: L("Prices and insurance", "الأسعار والتأمين"), icon: <Icon.Tag /> },
      { id: "human", label: L("Talk to a person", "التحدث مع موظف"), icon: <Icon.Users /> },
    ],
    onHomeAction: agent.home, recent: last?.text,
    items: agent.items, typing: agent.typing, suggestions: agent.suggestions,
    onSend: agent.send, onVoiceNote: agent.voice, onAttach: agent.attach, onItemAction: agent.action,
    features: { voiceNotes: cfg.voiceNotes, call: cfg.call, attachments: cfg.attachments },
    call: agent.call, onCallStart: agent.startCall, onCallEnd: agent.endCall, onCallMute: agent.mute, onCallSpeaker: agent.speaker,
    menuItems: [
      { id: "new", label: L("Start a new chat", "ابدأ محادثة جديدة"), icon: <Icon.Plus /> },
      { id: "human", label: L("Talk to a person", "التحدث مع موظف"), icon: <Icon.Users /> },
      { id: "email", label: L("Email me this chat", "أرسل لي المحادثة بالبريد"), icon: <Icon.Mail /> },
    ],
    onMenuAction: agent.menu, poweredBy: cfg.powered ? "Truvar" : null,
  };
  const phoneFrame = wide && device === "phone";

  const embed = `<!-- ${L("Nile Dental", "Nile Dental")}: Truvar AI agent -->
<script>
  window.TruvarWidget = {
    workspace: "wk_nile_dental",
    agent: "${cfg.name}",
    accent: "${cfg.accent}",
    position: "${cfg.position}", // end = right in English, left in Arabic
    launcher: "${cfg.launcher}",
    language: "${cfg.language === "page" ? "auto" : cfg.language}",
    greeting: ${cfg.teaser ? JSON.stringify(cfg.teaserText || "auto") : "false"},
    features: { voiceNotes: ${cfg.voiceNotes}, call: ${cfg.call}, attachments: ${cfg.attachments} }
  };
</script>
<script async src="https://cdn.truvar.ai/widget/v1.js"></script>`;
  const react = `import { WebWidget } from "@truvar-ai/design-system/widget";
import "@truvar-ai/design-system/widget/styles.css";

<WebWidget
  agent={{ name: "${cfg.name}", status: "online" }}
  business={{ name: "Nile Dental" }}
  accent="${cfg.accent}"
  position="${cfg.position}"
  items={conversation.items}        // from the Truvar agent stream
  typing={conversation.typing}
  onSend={conversation.send}
  onVoiceNote={conversation.sendVoice}
  onItemAction={conversation.act}   // pick a slot, confirm, submit a form…
  call={call.state} onCallStart={call.start} onCallEnd={call.end}
/>`;

  const S = (k) => ACCENTS.find((a) => a.id === k);
  return (
    <>
      <ViewHeader viewId="widget" intro={tr(
        "The AI agent businesses put on their own website with one line of code. It doesn't just answer: it shows its steps, offers times, asks before it books, collects details, hands over to a person, and takes voice notes and voice calls. Try it on the sample clinic below.",
        "الوكيل الذكي الذي تضعه الشركات على موقعها بسطر كود واحد. لا يكتفي بالإجابة: يعرض خطواته، ويقترح المواعيد، ويستأذن قبل الحجز، ويجمع البيانات، ويحوّل لموظف، ويستقبل الرسائل الصوتية والمكالمات. جرّبه على موقع العيادة أدناه.")} />

      <div className="wdg-layout">
        <div className="wdg-preview">
          {wide && (
            <div className="wdg-preview-bar">
              <SegmentedControl aria-label={tr("Preview", "المعاينة")} value={device} onChange={(d) => { setDevice(d); setOpen(false); }}
                options={[{ id: "desktop", label: tr("Desktop", "كمبيوتر") }, { id: "phone", label: tr("Phone", "موبايل") }]} />
              <Button variant="ghost" size="sm" onPress={() => { agent.reset(); setView("home"); setTeaserGone(false); }}>{tr("Restart demo", "أعد العرض")}</Button>
            </div>
          )}
          <div className={phoneFrame ? "wdg-phone" : "wdg-browser"}>
            {!phoneFrame && <div className="wdg-browser-bar" aria-hidden="true"><i /><i /><i /><span dir="ltr">nile-dental.com</span></div>}
            <div className="wdg-stage" style={{ "--tvw-frame-h": phoneFrame ? "760px" : wide ? "680px" : "560px" }}>
              <ClinicSite L={L} compact={phoneFrame || !wide} />
              <I18nProvider locale={locale}>
                <WebWidget {...props} contained layout={phoneFrame ? "phone" : "auto"} />
              </I18nProvider>
            </div>
          </div>
          {!wide && <p className="tv-desc wdg-hint">{tr("Tap the chat button: on a phone the agent opens full screen, like an app.", "اضغط زر المحادثة: على الموبايل يفتح الوكيل بملء الشاشة مثل التطبيق.")}</p>}
        </div>

        <aside className="tv-card wdg-setup" aria-labelledby="wdg-setup-title">
          <h2 className="dash-h" id="wdg-setup-title">{tr("Set up", "الإعداد")}</h2>
          <TextField label={tr("Agent name", "اسم الوكيل")} value={cfg.name} onChange={set("name")} />
          <div className="wdg-field">
            <span className="tv-label" id="wdg-colour">{tr("Brand colour", "لون العلامة")}</span>
            <div className="wdg-swatches" role="radiogroup" aria-labelledby="wdg-colour">
              {ACCENTS.map((a) => (
                <button key={a.id} type="button" role="radio" aria-checked={cfg.accent === a.id} aria-label={tr(a.en, a.ar)} className="wdg-swatch"
                  style={{ "--c": a.id }} onClick={() => set("accent")(a.id)}>{cfg.accent === a.id && <Icon.Check />}</button>
              ))}
              <label className="wdg-swatch is-custom" aria-label={tr("Custom colour", "لون مخصص")} style={{ "--c": S(cfg.accent) ? "transparent" : cfg.accent }}>
                <input type="color" value={cfg.accent} onChange={(e) => set("accent")(e.target.value)} />
                {S(cfg.accent) ? <Icon.Plus /> : <Icon.Check />}
              </label>
            </div>
          </div>
          <div className="wdg-field">
            <span className="tv-label">{tr("Position", "الموضع")}</span>
            <SegmentedControl aria-label={tr("Position", "الموضع")} value={cfg.position} onChange={set("position")}
              options={[{ id: "start", label: wlang === "ar" ? tr("Right", "يمين") : tr("Left", "يسار") }, { id: "end", label: wlang === "ar" ? tr("Left", "يسار") : tr("Right", "يمين") }]} />
          </div>
          <div className="wdg-field">
            <span className="tv-label">{tr("Button", "الزر")}</span>
            <SegmentedControl aria-label={tr("Button", "الزر")} value={cfg.launcher} onChange={set("launcher")}
              options={[{ id: "icon", label: tr("Icon", "أيقونة") }, { id: "label", label: tr("Icon and text", "أيقونة ونص") }]} />
          </div>
          <Select label={tr("Language", "اللغة")} selectedKey={cfg.language} onSelectionChange={set("language")}>
            <Item id="page">{tr("Match the website", "مثل لغة الموقع")}</Item>
            <Item id="en">English</Item>
            <Item id="ar">العربية</Item>
          </Select>
          <div className="wdg-switches">
            <SwitchRow label={tr("Greeting pop-up", "رسالة ترحيب منبثقة")} isSelected={cfg.teaser} onChange={(v) => { set("teaser")(v); setTeaserGone(false); }} icon={<Icon.MessageSquare />} />
            {cfg.teaser && <TextField label={tr("Greeting", "نص الترحيب")} placeholder={tr("Hi 👋 Need a dentist this week?", "أهلًا 👋 تحتاج طبيب أسنان؟")} value={cfg.teaserText} onChange={set("teaserText")} />}
            <SwitchRow label={tr("Voice notes", "الرسائل الصوتية")} isSelected={cfg.voiceNotes} onChange={set("voiceNotes")} icon={<Icon.Mic />} />
            <SwitchRow label={tr("Live voice call", "مكالمة صوتية مباشرة")} isSelected={cfg.call} onChange={set("call")} icon={<Icon.Phone />} />
            <SwitchRow label={tr("File uploads", "رفع الملفات")} isSelected={cfg.attachments} onChange={set("attachments")} icon={<Icon.Paperclip />} />
            <SwitchRow label={tr("Show “Powered by Truvar”", "إظهار “مدعوم من Truvar”")} isSelected={cfg.powered} onChange={set("powered")} icon={<Icon.Zap />} />
          </div>
        </aside>
      </div>

      <Spec id="embed" name={tr("Add it to a website", "أضفه إلى موقع")} primitive="<script> · WebWidget" wide note={tr(
        "One snippet before `</body>`. The widget loads in its own Shadow DOM, so the website's styles can't break it and it can't touch the website. React apps can use the component directly.",
        "مقتطف واحد قبل `</body>`. يعمل الودجت داخل Shadow DOM خاص به، فلا تؤثر أنماط الموقع عليه ولا يؤثر هو على الموقع. ويمكن لتطبيقات React استخدام المكوّن مباشرة.")}>
        <CodeBlock tabs={[{ id: "html", label: "HTML", code: embed }, { id: "react", label: "React", code: react }]} />
      </Spec>

      <Blocks tr={tr} accent={cfg.accent} />
    </>
  );
}

/* ---------- Each building block on its own ---------- */
function Block({ id, name, primitive, note, accent, children }) {
  return (
    <Spec id={id} name={name} primitive={primitive} note={note}>
      <WidgetScope accent={accent} className="wdg-block">{children}</WidgetScope>
    </Spec>
  );
}
function Blocks({ tr, accent }) {
  const lang = useLang();
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const days = useMemo(() => [1, 2, 3].map((i) => {
    const fmt = (d, o) => dateFormat(locale, o).format(d); const d = new Date(); d.setDate(d.getDate() + i); return { id: "d" + i, weekday: fmt(d, { weekday: "short" }), date: fmt(d, { day: "numeric" }),
    slots: [[10, 0], [13, 0], [15, 30], [18, 0]].map(([h, m]) => ({ id: `${h}${m}`, label: fmt(new Date(2026, 0, 1, h, m), { hour: "numeric", minute: "2-digit" }) })) }; }), [locale]);
  const [slot, setSlot] = useState(null);
  const [approval, setApproval] = useState("pending");
  const [form, setForm] = useState(null);
  const [call, setCall] = useState({ state: "live", elapsed: 42, speaker: "agent", captions: [{ from: "visitor", text: tr("Is Wednesday evening free?", "هل الأربعاء مساءً متاح؟") }, { from: "agent", text: tr("Yes, 7:30 PM with Dr. Sara. Shall I book it?", "نعم، ٧:٣٠ مساءً مع د. سارة. هل أحجزه؟") }] });
  const agent = { name: tr("Layla", "ليلى") };

  return (
    <>
      <h2 className="dash-h wdg-blocks-title">{tr("Building blocks", "المكونات")}</h2>
      <Block accent={accent} id="w-steps" name={tr("Agent steps", "خطوات الوكيل")} primitive="AgentSteps" note={tr("Shows what the agent is doing while it does it, then folds into one line.", "تعرض ما ينفذه الوكيل أثناء التنفيذ، ثم تُطوى في سطر واحد.")}>
        <AgentSteps item={{ steps: [{ label: tr("Checking Dr. Sara's calendar", "أراجع تقويم د. سارة"), state: "done" }, { label: tr("Finding 45-minute gaps", "أبحث عن فترات ٤٥ دقيقة"), state: "running" }, { label: tr("Holding the time", "أحجز الموعد مؤقتًا"), state: "pending" }] }} />
      </Block>
      <Block accent={accent} id="w-slots" name={tr("Time slots", "المواعيد")} primitive="SlotPicker" note={tr("Days, then times. Picking one is the reply. Locks once chosen.", "الأيام ثم الأوقات. الاختيار هو الرد، ويُقفل بعده.")}>
        <SlotPicker item={{ days, selected: slot }} onAction={(_, __, p) => setSlot(p)} />
        {slot && <Button variant="ghost" size="sm" onPress={() => setSlot(null)}>{tr("Reset", "إعادة")}</Button>}
      </Block>
      <Block accent={accent} id="w-approval" name={tr("Approval", "الموافقة")} primitive="WidgetApproval" note={tr("Before anything that commits the visitor, the agent asks. Nothing is booked or paid without this OK.", "قبل أي التزام، يستأذن الوكيل. لا حجز ولا دفع بدون هذه الموافقة.")}>
        <WidgetApproval item={{ title: tr("Book this appointment?", "تأكيد حجز الموعد؟"), state: approval, rows: [[tr("Service", "الخدمة"), tr("Check-up and X-ray", "كشف وأشعة")], [tr("When", "الموعد"), tr("Wed, 7:30 PM", "الأربعاء ٧:٣٠ م")], [tr("Price", "السعر"), tr("EGP 450", "٤٥٠ ج.م.")]] }}
          onAction={(_, a) => setApproval(a === "confirm" ? "confirmed" : "cancelled")} />
        {approval !== "pending" && <Button variant="ghost" size="sm" onPress={() => setApproval("pending")}>{tr("Reset", "إعادة")}</Button>}
      </Block>
      <Block accent={accent} id="w-form" name={tr("Inline form", "نموذج داخل المحادثة")} primitive="InlineForm" note={tr("Collects details inside the chat, with real validation (the phone field checks the number for the country).", "يجمع البيانات داخل المحادثة مع تحقق فعلي (حقل الهاتف يتحقق من الرقم حسب الدولة).")}>
        <InlineForm item={{ title: tr("Your details", "بياناتك"), submitted: form, fields: [{ name: "name", label: tr("Full name", "الاسم الكامل"), required: true }, { name: "phone", label: tr("Mobile", "الموبايل"), type: "phone", required: true }] }}
          onAction={(_, __, v) => setForm(v)} />
        {form && <Button variant="ghost" size="sm" onPress={() => setForm(null)}>{tr("Reset", "إعادة")}</Button>}
      </Block>
      <Block accent={accent} id="w-cards" name={tr("Choice cards", "بطاقات الاختيار")} primitive="ChoiceCards" note={tr("Services or products, side by side. Swipe on phones.", "خدمات أو منتجات جنبًا إلى جنب، بالسحب على الموبايل.")}>
        <ChoiceCards item={{ cards: [
          { id: "a", icon: <Icon.Sparkles />, title: tr("Cleaning and polish", "تنظيف وتلميع"), subtitle: tr("45 min", "٤٥ دقيقة"), price: tr("EGP 600", "٦٠٠ ج.م.") },
          { id: "b", icon: <Icon.Search />, title: tr("Check-up and X-ray", "كشف وأشعة"), subtitle: tr("30 min", "٣٠ دقيقة"), price: tr("EGP 450", "٤٥٠ ج.م.") },
          { id: "c", icon: <Icon.Star />, title: tr("Whitening", "تبييض"), subtitle: tr("60 min", "٦٠ دقيقة"), price: tr("EGP 2,500", "٢٬٥٠٠ ج.م.") }] }} />
      </Block>
      <Block accent={accent} id="w-result" name={tr("Result", "النتيجة")} primitive="ResultCard" note={tr("What got done, with the next steps.", "ما تم إنجازه، مع الخطوات التالية.")}>
        <ResultCard item={{ title: tr("You're booked!", "تم الحجز!"), subtitle: tr("Wed, 7:30 PM with Dr. Sara", "الأربعاء ٧:٣٠ م مع د. سارة"), rows: [[tr("Booking", "رقم الحجز"), "#ND-4821"]],
          actions: [{ id: "cal", label: tr("Add to calendar", "أضف للتقويم"), icon: <Icon.Calendar /> }] }} />
      </Block>
      <Block accent={accent} id="w-messages" name={tr("Messages", "الرسائل")} primitive="WidgetItem" note={tr("Text, voice notes with a transcript, files, a teammate joining, the call summary and the rating.", "نص، ورسائل صوتية مع النص، وملفات، وانضمام موظف، وملخص المكالمة، والتقييم.")}>
        <div className="wdg-msgs">
          <div className="tvw-row is-out"><WidgetItem item={{ id: "v1", type: "voice", from: "visitor", duration: 9, transcript: tr("Do you have anything tomorrow evening?", "هل يوجد موعد بكرة بالليل؟") }} /></div>
          <div className="tvw-row"><WidgetItem item={{ id: "t1", type: "text", from: "agent", text: tr("Yes, 6:00 PM and 7:30 PM are open.", "نعم، ٦:٠٠ و٧:٣٠ مساءً متاحان.") }} /></div>
          <div className="tvw-row is-out"><WidgetItem item={{ id: "f1", type: "file", from: "visitor", name: "x-ray-2025.pdf", size: "820 KB" }} /></div>
          <div className="tvw-row"><WidgetItem item={{ id: "e1", type: "event", text: tr("Mona Adel from the front desk joined", "انضمت منى عادل من الاستقبال"), icon: <Icon.UserCheck /> }} /></div>
          <div className="tvw-row is-wide"><WidgetItem item={{ id: "c1", type: "call", duration: 72, summary: tr("Booked a check-up for Wednesday, 7:30 PM.", "تم حجز كشف يوم الأربعاء ٧:٣٠ مساءً.") }} /></div>
          <div className="tvw-row is-wide"><WidgetItem item={{ id: "r1", type: "rating" }} /></div>
        </div>
      </Block>
      <Block accent={accent} id="w-call" name={tr("Voice call", "المكالمة الصوتية")} primitive="WidgetCall" note={tr("A live call inside the widget, with captions so it works with the sound off.", "مكالمة مباشرة داخل الودجت، مع نص مباشر يعمل حتى بدون صوت.")}>
        <div className="wdg-callbox">
          <WidgetCall agent={agent} call={call} onMuteChange={(m) => setCall((c) => ({ ...c, muted: m }))} onSpeakerChange={(s) => setCall((c) => ({ ...c, loud: s }))}
            onEnd={() => setCall((c) => ({ ...c, state: "ended", speaker: null }))} onBack={() => setCall((c) => ({ ...c, state: "live", speaker: "agent" }))} />
        </div>
      </Block>
    </>
  );
}
