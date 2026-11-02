// Sample workspace for the Conversations, Contacts and Team pages, in English and Arabic.
// One hook builds everything for the current language so names, messages and dates stay consistent across pages.
import { useMemo } from "react";
import { CONTACTS, OWNERS, stageOf } from "./data.js";
import { useLang } from "./i18n.jsx";
import { numberFormat } from "@truvar-ai/design-system";

const ago = (min) => new Date(Date.now() - min * 60000);
const fmtMoney = (lang, v) => numberFormat(lang === "ar" ? "ar-EG" : "en-US", { style: "currency", currency: "EGP", notation: "compact", maximumFractionDigits: 2 }).format(v);

// Where each contact can be reached and where they first came from
const REACH = {
  1: { main: "whatsapp", ids: [["whatsapp", "+20 100 234 5678"], ["email", "nadia@nilefoods.com"], ["instagram", "@nadia.kamel"], ["phone", "+20 100 234 5678"]], src: ["instagram", "Instagram ad", "إعلان إنستغرام", "Ramadan 2026"] },
  2: { main: "email", ids: [["email", "tarek@deltafreight.com"], ["phone", "+20 122 410 9876"], ["linkedin", "linkedin.com/in/tareksaleh"]], src: ["linkedin", "LinkedIn post", "منشور لينكدإن", "Logistics Week"] },
  3: { main: "instagram", ids: [["instagram", "@mona.sinairetail"], ["whatsapp", "+20 111 777 0021"]], src: ["instagram", "Instagram DM", "رسالة إنستغرام", null] },
  4: { main: "phone", ids: [["phone", "+20 109 552 3310"], ["email", "hany@alexpharma.com"], ["whatsapp", "+20 109 552 3310"]], src: ["google", "Google search", "بحث Google", "Brand keywords"] },
  5: { main: "messenger", ids: [["messenger", "Salma Adel"], ["facebook", "Red Sea Resorts"], ["email", "salma@redsearesorts.com"]], src: ["facebook", "Facebook lead form", "نموذج فيسبوك", "Summer offers"] },
  6: { main: "x", ids: [["x", "@karim_gm"], ["email", "karim@gizamotors.com"]], src: ["x", "Reply on X", "رد على إكس", null] },
  7: { main: "telegram", ids: [["telegram", "@ranayoussef"], ["email", "rana@cairofintech.io"], ["whatsapp", "+20 115 640 7788"]], src: ["webchat", "Website chat", "دردشة الموقع", "Pricing page"] },
  8: { main: "webchat", ids: [["webchat", "truvar.ai/pricing"], ["email", "ahmed@luxortextiles.com"]], src: ["webchat", "Website chat", "دردشة الموقع", "Pricing page"] },
  9: { main: "tiktok", ids: [["tiktok", "@aswansolar"], ["whatsapp", "+20 127 118 4402"]], src: ["tiktok", "TikTok video", "فيديو تيك توك", "Solar in 60s"] },
  10: { main: "google", ids: [["google", "Port Said Logistics"], ["phone", "+20 101 456 1290"]], src: ["google", "Google Business message", "رسالة من Google", null] },
  11: { main: "sms", ids: [["sms", "+20 112 980 3345"], ["email", "yasmin@mansouradairy.com"]], src: ["email", "Newsletter", "النشرة البريدية", "October digest"] },
  12: { main: "whatsapp", ids: [["whatsapp", "+20 120 334 7781"], ["viber", "+20 120 334 7781"]], src: ["youtube", "YouTube ad", "إعلان يوتيوب", "Hotel automation"] },
};

export function useCrmData() {
  const lang = useLang();
  return useMemo(() => build(lang), [lang]);
}

function build(lang) {
  const ar = lang === "ar";
  const tr = (en, a) => (ar ? a : en);
  const name = (o) => (ar ? o.ar : o.en);
  const team = OWNERS.map((o) => ({ id: o.id, name: name(o) }));
  const me = team[0]; // Amira, the signed-in user

  const contacts = {};
  for (const c of CONTACTS) {
    const r = REACH[c.id];
    const stage = stageOf(c.stage);
    contacts[c.id] = {
      id: c.id, name: name(c), title: ar ? c.titleAr : c.titleEn, company: c.company, email: c.email, phone: c.phone,
      location: tr(["Cairo", "Alexandria", "Giza", "Port Said", "Hurghada"][c.id % 5] + ", Egypt", ["القاهرة", "الإسكندرية", "الجيزة", "بورسعيد", "الغردقة"][c.id % 5] + "، مصر"),
      language: c.id % 3 === 0 ? tr("English", "الإنجليزية") : tr("Egyptian Arabic", "العربية المصرية"),
      identities: r.ids.map(([channel, handle]) => ({ channel, handle })),
      mainChannel: r.main,
      source: { channel: r.src[0], label: tr(r.src[1], r.src[2]), campaign: r.src[3], date: ago(60 * 24 * (30 + c.id * 6)) },
      deal: { name: tr(`${c.company}: Growth plan`, `${c.company}: خطة النمو`), stage: name(stage), tone: stage.tone, value: fmtMoney(lang, c.value), owner: name(OWNERS.find((o) => o.id === c.owner)) },
      stage: { label: name(stage), tone: stage.tone, id: c.stage }, value: c.value, owner: OWNERS.find((o) => o.id === c.owner),
      tags: [[tr("VIP", "مهم"), tr("Arabic voice", "صوت عربي")], [tr("Enterprise", "مؤسسات")], [tr("Retail", "تجزئة")], [tr("Customer", "عميل"), tr("Renewal", "تجديد")]][c.id % 4],
      lastActivity: ago(c.days * 60 * 24 + c.id * 13),
      summary: {
        1: tr("Wants Arabic voice for 3 branches. Price-sensitive; asked twice about the Growth plan. Ready to sign if onboarding starts this month.",
          "تريد الصوت العربي لـ٣ فروع. حساسة للسعر؛ سألت مرتين عن خطة النمو. مستعدة للتوقيع إذا بدأت التهيئة هذا الشهر."),
        2: tr("Reviewing the proposal with finance. Main concern is the yearly commitment; open to quarterly billing.",
          "يراجع العرض مع الإدارة المالية. قلقه الأساسي الالتزام السنوي؛ منفتح على الفوترة الربع سنوية."),
        3: tr("New lead from Instagram. Interested in WhatsApp automation for 2 stores. Asked for the price list.",
          "عميلة جديدة من إنستغرام. مهتمة بأتمتة واتساب لمتجرين. طلبت قائمة الأسعار."),
      }[c.id] ?? tr(`${c.company} is in ${name(stage)}. Talks mostly on ${r.main === "phone" ? "the phone" : r.main}; replies within a day. No open complaints.`,
        `${c.company} في مرحلة ${name(stage)}. يتواصل غالبًا عبر ${r.main === "phone" ? "الهاتف" : r.main}، ويرد خلال يوم. لا شكاوى مفتوحة.`),
    };
  }

  // Messages. m(from, kind, en, ar, minutesAgo, extra)
  let n = 0;
  const m = (from, kind, en, a, min, extra = {}) => ({ id: `m${++n}`, from, kind, text: en == null ? "" : tr(en, a), time: ago(min), ...extra });
  const A = me.name;
  const msgs = {
    c1: [
      m("contact", "text", "Hi! I saw your ad. Do you support Arabic voice calls?", "أهلًا! شفت إعلانكم. هل تدعمون المكالمات الصوتية بالعربي؟", 60 * 26, { channel: "whatsapp" }),
      m("ai", "text", "Hi Nadia 👋 Yes. Our voice agents speak Egyptian, Gulf and Levantine Arabic, and English. How many branches would use it?", "أهلًا يا نادية 👋 نعم. وكلاؤنا الصوتيون يتحدثون المصرية والخليجية والشامية والإنجليزية. كم فرعًا سيستخدمه؟", 60 * 26 - 1, { channel: "whatsapp", status: "read" }),
      m("contact", "text", "3 branches. Cairo, Giza and Alexandria.", "٣ فروع. القاهرة والجيزة والإسكندرية.", 60 * 25, { channel: "whatsapp" }),
      m("ai", "text", "Great. The Growth plan covers 3 branches with 5,000 call minutes a month. Shall I book a 20-minute demo?", "رائع. خطة النمو تغطي ٣ فروع مع ٥٬٠٠٠ دقيقة مكالمات شهريًا. هل أحجز لك عرضًا تجريبيًا لمدة ٢٠ دقيقة؟", 60 * 25 - 1, { channel: "whatsapp", status: "read" }),
      m("system", "event", "Demo booked for Tuesday, 11 am", "تم حجز العرض التجريبي يوم الثلاثاء، ١١ صباحًا", 60 * 25 - 2),
      m("contact", "image", "Here's our current call volume", "هذا حجم مكالماتنا الحالي", 45, { channel: "whatsapp", image: { alt: tr("Screenshot: calls per day chart", "لقطة شاشة: رسم المكالمات اليومية") } }),
      m("contact", "voice", null, null, 44, { channel: "whatsapp", voice: { duration: "0:42" } }),
      m("agent", "note", "She's ready to sign if onboarding starts this month. Loop in Omar for the contract.", "مستعدة للتوقيع إذا بدأت التهيئة هذا الشهر. أشرك عمر في العقد.", 40, { author: A }),
      m("contact", "text", "Can we start with 2 branches and add Alexandria next month?", "هل يمكن نبدأ بفرعين ونضيف الإسكندرية الشهر الجاي؟", 3, { channel: "whatsapp" }),
    ],
    c2: [
      m("contact", "text", "Hi Omar,\nAttached is our feedback on the proposal. The yearly commitment is our main concern.", "مرحبًا عمر،\nمرفق ملاحظاتنا على العرض. الالتزام السنوي هو قلقنا الأساسي.", 60 * 30, { channel: "email" }),
      m("contact", "file", null, null, 60 * 30 - 1, { channel: "email", file: { name: "Delta-Freight-feedback.pdf", size: "248 KB" } }),
      m("agent", "text", "Thanks Tarek. We can do quarterly billing for the first year. I'll send the updated terms today.", "شكرًا يا طارق. يمكننا الفوترة ربع السنوية في السنة الأولى. سأرسل الشروط المحدثة اليوم.", 60 * 29, { channel: "email", author: team[1].name, status: "read" }),
      m("contact", "text", "Any update on the terms?", "هل من جديد بخصوص الشروط؟", 60 * 4, { channel: "email" }),
    ],
    c3: [
      m("contact", "text", "Hello, how much is WhatsApp automation for 2 stores?", "مرحبًا، كم تكلفة أتمتة واتساب لمتجرين؟", 50, { channel: "instagram" }),
      m("ai", "text", "Hi Mona! It starts at EGP 4,500 a month for 2 stores, including the AI agent. Want me to send the full price list?", "أهلًا منى! تبدأ من ٤٬٥٠٠ ج.م. شهريًا لمتجرين، شاملة الوكيل الذكي. أرسل لك قائمة الأسعار الكاملة؟", 49, { channel: "instagram", status: "read" }),
      m("contact", "text", "Yes please 🙏", "أيوه لو سمحت 🙏", 12, { channel: "instagram" }),
    ],
    c4: [
      m("contact", "call", null, null, 60 * 5, { channel: "phone", call: { title: tr("Incoming call", "مكالمة واردة"), duration: "4:12", outcome: tr("Answered by AI · booked a callback", "رد الوكيل الذكي · حجز معاودة اتصال") } }),
      m("system", "event", "Callback scheduled for today, 3 pm", "تم تحديد معاودة الاتصال اليوم، ٣ مساءً", 60 * 5 - 5),
      m("contact", "voice", null, null, 35, { channel: "phone", voice: { duration: "1:05" }, text: tr("Voicemail: renewal questions", "بريد صوتي: أسئلة عن التجديد") }),
    ],
    c5: [
      m("contact", "text", "Do you have offers for hotels this summer?", "هل لديكم عروض للفنادق هذا الصيف؟", 60 * 8, { channel: "messenger" }),
      m("ai", "text", "Yes, 20% off the first 3 months for hotels that sign before August. Shall I share details?", "نعم، خصم ٢٠٪ على أول ٣ شهور للفنادق التي توقّع قبل أغسطس. أشاركك التفاصيل؟", 60 * 8 - 1, { channel: "messenger", status: "read" }),
    ],
    c6: [
      m("contact", "text", "@truvar your agent booked 40 test drives for us last week. Impressive.", "@truvar وكيلكم حجز لنا ٤٠ تجربة قيادة الأسبوع الماضي. مبهر.", 60 * 20, { channel: "x" }),
      m("ai", "text", "Thank you Karim! 🎉 Glad Giza Motors is seeing results.", "شكرًا يا كريم! 🎉 سعداء بنتائج Giza Motors.", 60 * 20 - 2, { channel: "x", status: "delivered" }),
    ],
    c7: [
      m("contact", "text", "Can your agent verify customers' national IDs during the call?", "هل يمكن لوكيلكم التحقق من الرقم القومي للعملاء أثناء المكالمة؟", 60 * 2, { channel: "telegram" }),
      m("agent", "text", "It can read the ID back and match it with your records through an API. I'll share the security docs.", "يمكنه قراءة الرقم ومطابقته مع سجلاتكم عبر واجهة برمجية. سأرسل لك مستندات الأمان.", 60 * 2 - 3, { channel: "telegram", author: A, status: "read" }),
      m("contact", "text", "Perfect, thanks!", "ممتاز، شكرًا!", 8, { channel: "telegram" }),
    ],
    c8: [
      m("contact", "text", "Is there a free trial?", "هل هناك فترة تجربة مجانية؟", 25, { channel: "webchat" }),
    ],
    c9: [
      m("contact", "text", "Loved the video! Can solar installers use this?", "الفيديو رائع! هل يمكن لشركات الطاقة الشمسية استخدام هذا؟", 60 * 3, { channel: "tiktok" }),
      m("ai", "text", "Absolutely, Dina! Installers use it to answer quote requests 24/7. Want a quick call?", "بالتأكيد يا دينا! يستخدمه المركّبون للرد على طلبات الأسعار على مدار الساعة. نرتب مكالمة سريعة؟", 60 * 3 - 1, { channel: "tiktok", status: "read" }),
    ],
    c10: [
      m("contact", "text", "What are your support hours?", "ما مواعيد الدعم لديكم؟", 60 * 30, { channel: "google" }),
      m("ai", "text", "Our AI agent answers around the clock; our team is available Sunday to Thursday, 9 am to 6 pm.", "وكيلنا الذكي يرد على مدار الساعة؛ وفريقنا متاح من الأحد إلى الخميس، ٩ صباحًا حتى ٦ مساءً.", 60 * 30 - 1, { channel: "google", status: "read" }),
    ],
    c11: [
      m("contact", "text", "Thanks, the invoice is paid.", "شكرًا، تم دفع الفاتورة.", 60 * 50, { channel: "sms" }),
      m("agent", "text", "Received, thank you Yasmin!", "تم الاستلام، شكرًا يا ياسمين!", 60 * 49, { channel: "sms", author: team[2].name, status: "delivered" }),
    ],
    c12: [
      m("contact", "text", "We'd like a quote for 4 hotels.", "نريد عرض سعر لـ٤ فنادق.", 60 * 24 * 2, { channel: "whatsapp" }),
      m("agent", "text", "Sure Sherif, I'll prepare it today.", "أكيد يا شريف، سأجهزه اليوم.", 60 * 24 * 2 - 5, { channel: "whatsapp", author: team[3].name, status: "read" }),
    ],
  };

  const conv = (id, cid, extra) => {
    const list = msgs[id];
    const last = [...list].reverse().find((x) => x.kind !== "event" && x.kind !== "note");
    const c = contacts[cid];
    return {
      id, contact: { id: cid, name: c.name }, channel: c.mainChannel, time: last.time, lastFrom: last.from,
      preview: last.text || (last.kind === "voice" ? tr("Voice message", "رسالة صوتية") : last.kind === "image" ? tr("Photo", "صورة") : last.kind === "file" ? last.file.name : last.kind === "call" ? last.call.title : ""),
      unread: 0, status: "open", assignee: null, ai: "ai", ...extra,
    };
  };
  const conversations = [
    conv("c1", 1, { unread: 2, assignee: me, ai: "human", priority: "high", tags: ["VIP"] }),
    conv("c2", 2, { unread: 1, assignee: team[1], ai: "human", sla: { label: tr("Waiting 4 h", "ينتظر ٤ س"), overdue: true } }),
    conv("c3", 3, { unread: 1 }),
    conv("c4", 4, { assignee: me, ai: "human" }),
    conv("c5", 5, {}),
    conv("c6", 6, {}),
    conv("c7", 7, { unread: 1, assignee: me, ai: "human" }),
    conv("c8", 8, { unread: 1, sla: { label: tr("25 min", "٢٥ د"), overdue: false } }),
    conv("c9", 9, { assignee: team[2] }),
    conv("c10", 10, {}),
    conv("c11", 11, { status: "closed", assignee: team[2], ai: "human" }),
    conv("c12", 12, { status: "snoozed", assignee: team[3], ai: "human", windowClosed: true }),
  ];
  // The WhatsApp window is 24 hours from the customer's last message
  conversations.find((c) => c.id === "c12").windowClosed = true;

  const savedReplies = [
    { id: "price", title: tr("Price list", "قائمة الأسعار"), text: tr("Here's our price list: truvar.ai/pricing. Growth starts at EGP 4,500 a month.", "هذه قائمة أسعارنا: truvar.ai/pricing. خطة النمو تبدأ من ٤٬٥٠٠ ج.م. شهريًا.") },
    { id: "demo", title: tr("Book a demo", "حجز عرض تجريبي"), text: tr("Pick a time that suits you for a 20-minute demo: truvar.ai/demo", "اختر الوقت المناسب لعرض تجريبي لمدة ٢٠ دقيقة: truvar.ai/demo") },
    { id: "hours", title: tr("Support hours", "مواعيد الدعم"), text: tr("Our team is available Sunday to Thursday, 9 am to 6 pm. The AI agent answers anytime.", "فريقنا متاح من الأحد إلى الخميس، ٩ صباحًا حتى ٦ مساءً. والوكيل الذكي يرد في أي وقت.") },
  ];
  const templates = [
    { id: "followup", title: tr("Follow-up on your quote", "متابعة عرض السعر"), text: tr("Hi {{name}}, following up on your quote. Is now a good time to talk?", "مرحبًا {{name}}، نتابع عرض السعر. هل الوقت مناسب للحديث؟") },
    { id: "reminder", title: tr("Appointment reminder", "تذكير بموعد"), text: tr("Reminder: your demo is tomorrow at 11 am.", "تذكير: عرضك التجريبي غدًا الساعة ١١ صباحًا.") },
  ];
  const suggest = (c) => new Promise((res) => setTimeout(() => res(
    c.id === "c1" ? tr("Yes, of course. We can start with Cairo and Giza this month, and add Alexandria next month at the same rate. Shall I send the updated quote?",
      "أكيد. نقدر نبدأ بالقاهرة والجيزة هذا الشهر ونضيف الإسكندرية الشهر القادم بنفس السعر. أرسل لك عرض السعر المحدث؟")
      : tr(`Thanks ${c.contact.name.split(" ")[0]}! Let me check that and get back to you within the hour.`, `شكرًا يا ${c.contact.name.split(" ")[0]}! سأتحقق من ذلك وأعود إليك خلال ساعة.`)), 900));

  // Contact timelines
  const timelineFor = (id) => {
    const c = contacts[id];
    const conv1 = msgs["c" + id] ?? [];
    return [
      ...conv1.filter((x) => x.from === "contact" && x.kind === "text").slice(-2).map((x, i) => ({ id: "tm" + i, type: "message", channel: x.channel, title: tr(`Message from ${c.name.split(" ")[0]}`, `رسالة من ${c.name.split(" ")[0]}`), body: x.text, time: x.time })),
      { id: "t1", type: "ai", title: tr("AI agent qualified the lead", "أهّل الوكيل الذكي العميل"), body: c.summary, time: ago(60 * 26) },
      { id: "t2", type: "call", title: tr("Outbound call · 6:40", "مكالمة صادرة · ٦:٤٠"), author: me.name, body: tr("Walked through pricing and onboarding timeline.", "شرحنا الأسعار والجدول الزمني للتهيئة."), time: ago(60 * 24 * 2) },
      { id: "t3", type: "stage", title: tr(`Deal moved to ${c.stage.label}`, `انتقلت الصفقة إلى ${c.stage.label}`), author: c.deal.owner, time: ago(60 * 24 * 3) },
      { id: "t4", type: "meeting", title: tr("Demo · 30 min", "عرض تجريبي · ٣٠ دقيقة"), author: me.name, body: tr("Attendees: 3. Next step: send the proposal.", "الحضور: ٣. الخطوة التالية: إرسال العرض."), time: ago(60 * 24 * 5) },
      { id: "t5", type: "email", title: tr("Proposal sent", "تم إرسال العرض"), author: c.deal.owner, channel: "email", time: ago(60 * 24 * 6) },
      { id: "t6", type: "note", title: tr("Note", "ملاحظة"), author: team[1].name, body: tr("Decision maker is the CFO. Keep finance in the loop.", "صاحب القرار هو المدير المالي. أبقِ المالية على اطلاع."), time: ago(60 * 24 * 8) },
      { id: "t7", type: "form", title: tr(`Came in from ${c.source.label}`, `جاء من ${c.source.label}`), body: c.source.campaign ? tr(`Campaign: ${c.source.campaign}`, `الحملة: ${c.source.campaign}`) : undefined, time: c.source.date },
    ];
  };

  // Roles and permissions
  const resources = [
    { id: "contacts", group: tr("CRM", "إدارة العملاء"), label: tr("Contacts", "جهات الاتصال") },
    { id: "deals", group: tr("CRM", "إدارة العملاء"), label: tr("Deals", "الصفقات") },
    { id: "conversations", group: tr("CRM", "إدارة العملاء"), label: tr("Conversations", "المحادثات"), actions: ["view", "create", "edit", "delete", "export"] },
    { id: "calls", group: tr("Engagement", "التواصل"), label: tr("Calls and recordings", "المكالمات والتسجيلات"), actions: ["view", "create", "delete", "export"] },
    { id: "agents", group: tr("Engagement", "التواصل"), label: tr("AI agents", "الوكلاء الأذكياء") },
    { id: "campaigns", group: tr("Engagement", "التواصل"), label: tr("Campaigns", "الحملات") },
    { id: "reports", group: tr("Workspace", "مساحة العمل"), label: tr("Reports and dashboards", "التقارير ولوحات المؤشرات"), actions: ["view", "create", "export"] },
    { id: "channels", group: tr("Workspace", "مساحة العمل"), label: tr("Channels and integrations", "القنوات والتكاملات"), actions: ["view", "create", "edit", "delete"], scoped: false },
    { id: "team", group: tr("Workspace", "مساحة العمل"), label: tr("Team and roles", "الفريق والأدوار"), actions: ["view", "create", "edit", "delete"], scoped: false },
    { id: "billing", group: tr("Workspace", "مساحة العمل"), label: tr("Billing", "الفوترة"), actions: ["view", "edit"], scoped: false },
  ];
  const ALL = ["view", "create", "edit", "delete", "export"];
  const full = Object.fromEntries(resources.map((r) => [r.id, { actions: r.actions ?? ALL, scope: "all" }]));
  const P = (map) => Object.fromEntries(resources.map((r) => [r.id, map[r.id] ?? { actions: [], scope: "own" }]));
  const roles = [
    { id: "owner", name: tr("Owner", "المالك"), description: tr("Everything, including billing and deleting the workspace", "كل شيء، بما في ذلك الفوترة وحذف مساحة العمل"), members: 1, system: true, tone: "accent", perms: full },
    { id: "admin", name: tr("Admin", "مسؤول"), description: tr("Everything except billing", "كل شيء عدا الفوترة"), members: 2, system: true, tone: "accent",
      perms: { ...full, billing: { actions: ["view"], scope: "all" } } },
    { id: "manager", name: tr("Sales manager", "مدير المبيعات"), description: tr("Their team's contacts, deals and reports", "جهات اتصال فريقه وصفقاته وتقاريره"), members: 2, tone: "navy",
      perms: P({ contacts: { actions: ALL, scope: "team" }, deals: { actions: ALL, scope: "team" }, conversations: { actions: ALL, scope: "team" }, calls: { actions: ["view", "create", "export"], scope: "team" },
        agents: { actions: ["view"], scope: "all" }, campaigns: { actions: ["view", "create", "edit"], scope: "team" }, reports: { actions: ["view", "create", "export"], scope: "team" }, team: { actions: ["view"], scope: "all" } }) },
    { id: "agent", name: tr("Sales agent", "مندوب مبيعات"), description: tr("Their own contacts, deals and conversations", "جهات اتصاله وصفقاته ومحادثاته فقط"), members: 5, tone: "navy",
      perms: P({ contacts: { actions: ["view", "create", "edit"], scope: "own" }, deals: { actions: ["view", "create", "edit"], scope: "own" }, conversations: { actions: ["view", "create", "edit"], scope: "own" },
        calls: { actions: ["view", "create"], scope: "own" }, reports: { actions: ["view"], scope: "own" } }) },
    { id: "support", name: tr("Support agent", "موظف دعم"), description: tr("All conversations; contacts read-only", "كل المحادثات؛ جهات الاتصال للقراءة فقط"), members: 3, tone: "navy",
      perms: P({ contacts: { actions: ["view"], scope: "all" }, conversations: { actions: ["view", "create", "edit"], scope: "all" }, calls: { actions: ["view", "create"], scope: "all" } }) },
    { id: "marketing", name: tr("Marketing", "التسويق"), description: tr("Custom role · campaigns and reports", "دور مخصص · الحملات والتقارير"), members: 2, tone: "neutral",
      perms: P({ contacts: { actions: ["view", "export"], scope: "all" }, campaigns: { actions: ALL, scope: "all" }, reports: { actions: ["view", "create", "export"], scope: "all" } }) },
    { id: "viewer", name: tr("Viewer", "مشاهد"), description: tr("Read-only access to reports", "قراءة التقارير فقط"), members: 1, system: true, tone: "neutral",
      perms: P({ reports: { actions: ["view"], scope: "all" } }) },
  ];
  const members = [
    { id: "amira", name: team[0].name, email: "amira@truvar.ai", role: "owner", teams: [tr("Sales", "المبيعات")], status: "active", last: ago(2) },
    { id: "omar", name: team[1].name, email: "omar@truvar.ai", role: "admin", teams: [tr("Sales", "المبيعات")], status: "active", last: ago(18) },
    { id: "laila", name: team[2].name, email: "laila@truvar.ai", role: "manager", teams: [tr("Sales", "المبيعات"), tr("Support", "الدعم")], status: "active", last: ago(60 * 3) },
    { id: "youssef", name: team[3].name, email: "youssef@truvar.ai", role: "agent", teams: [tr("Sales", "المبيعات")], status: "active", last: ago(60 * 26) },
    { id: "nour", name: tr("Nour El-Din", "نور الدين"), email: "nour@truvar.ai", role: "support", teams: [tr("Support", "الدعم")], status: "active", last: ago(45) },
    { id: "heba", name: tr("Heba Samy", "هبة سامي"), email: "heba@truvar.ai", role: "marketing", teams: [tr("Marketing", "التسويق")], status: "active", last: ago(60 * 50) },
    { id: "ziad", name: tr("Ziad Fawzy", "زياد فوزي"), email: "ziad@partner.com", role: "viewer", teams: [], status: "invited", last: null },
  ];

  return { me, team, contacts, conversations, messages: msgs, savedReplies, templates, suggest, timelineFor, resources, roles, members };
}
