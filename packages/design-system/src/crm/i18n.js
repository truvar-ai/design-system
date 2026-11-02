// Strings and formatting for the CRM kit. Language follows React Aria's locale (I18nProvider).
import { useLocale } from "react-aria-components";
import { dateFormat, numberFormat } from "../core/format.js";

const S = {
  en: {
    conversations: "Conversations", search: "Search conversations", mine: "Mine", unassigned: "Unassigned", all: "All",
    open: "Open", snoozed: "Snoozed", closed: "Closed", filter: "Filter", channels: "Channels", status: "Status", clearFilters: "Clear filters",
    noConversations: "No conversations match.", select: "Select", cancel: "Cancel", selected: (n) => `${n} selected`,
    assign: "Assign", assignTo: "Assign to", unassign: "Unassign", me: "Me", close: "Close", reopen: "Reopen", snooze: "Snooze",
    snoozeFor: { h1: "1 hour", tomorrow: "Tomorrow, 9 am", week: "Next week" }, back: "Back", details: "Contact details",
    you: "You", ai: "AI", aiAgent: "AI agent", note: "Note", today: "Today", yesterday: "Yesterday",
    sent: "Sent", delivered: "Delivered", read: "Read", failed: "Not delivered", retry: "Retry",
    reply: "Reply", internalNote: "Internal note", replyVia: "Reply via", typeReply: (c) => `Reply on ${c}…`,
    typeNote: "Note for your team. Type @ to mention someone.", send: "Send", attach: "Attach a file", emoji: "Emoji",
    savedReplies: "Saved replies", suggest: "Suggest a reply", suggestion: "AI suggestion", useIt: "Use", dismiss: "Dismiss",
    windowClosed: "The 24-hour WhatsApp window has closed. Send an approved template to restart the conversation.", template: "Template",
    sendTemplate: "Send template", enterHint: "Enter to send · Shift + Enter for a new line",
    aiActive: "AI agent is handling this conversation", aiActiveSub: "It answers, books and qualifies on its own.",
    takeOver: "Take over", youHandle: "You're handling this", aiResumesIn: (t) => `AI agent resumes in ${t} if no one replies`,
    aiPaused: "AI agent is paused for this conversation", handBack: "Hand back to AI", resumeAfter: "Resume AI after",
    never: "Don't resume", min: (n) => `${n} min`, hour: (n) => `${n} h`, aiResumed: "AI agent resumed after no reply",
    tookOver: (n) => `${n} took over from the AI agent`, handedBack: (n) => `${n} handed the conversation back to the AI agent`,
    summary: "AI summary", about: "About", identities: "Channels", source: "Source", firstTouch: "First contact", campaign: "Campaign",
    deal: "Deal", owner: "Owner", stage: "Stage", value: "Value", tags: "Tags", history: "Previous conversations", openProfile: "Open full profile",
    phone: "Phone", location: "Location", language: "Language", call: "Call", email: "Email", message: "Message", meeting: "Meeting", more: "More actions", edit: "Edit", save: "Save",
    activity: "Activity", logNote: "Add a note", allActivity: "All", empty: "Nothing here yet.",
    permissions: "Permissions", scope: "Access", scopes: { own: "Their own", team: "Their team", all: "Everyone's" },
    actions: { view: "View", create: "Create", edit: "Edit", delete: "Delete", export: "Export" }, allActions: "All actions",
    pipeline: "Pipeline", dropHere: "Drop a deal here", drag: "Drag to another stage", moveTo: "Move to", addDeal: "Add deal",
    calendar: "Calendar", previous: "Previous", next: "Next", view: "View", views: { month: "Month", week: "Week", day: "Day", agenda: "Agenda" },
    moreEvents: (n) => `${n} more`, newEvent: "New event", noEvents: "Nothing scheduled in the next two weeks.", allDay: "All day",
    copy: "Copy", copied: "Copied", calling: "Calling…", onHold: "On hold", mute: "Mute", hold: "Hold", hangUp: "End call",
    systemRole: "Built-in role, can't be changed", members: (n, f = String) => `${f(n)} ${n === 1 ? "member" : "members"}`,
  },
  ar: {
    conversations: "المحادثات", search: "ابحث في المحادثات", mine: "محادثاتي", unassigned: "غير مُسندة", all: "الكل",
    open: "مفتوحة", snoozed: "مؤجلة", closed: "مغلقة", filter: "تصفية", channels: "القنوات", status: "الحالة", clearFilters: "مسح التصفية",
    noConversations: "لا توجد محادثات مطابقة.", select: "تحديد", cancel: "إلغاء", selected: (n) => `${n} محددة`,
    assign: "إسناد", assignTo: "إسناد إلى", unassign: "إلغاء الإسناد", me: "أنا", close: "إغلاق", reopen: "إعادة فتح", snooze: "تأجيل",
    snoozeFor: { h1: "ساعة واحدة", tomorrow: "غدًا، ٩ صباحًا", week: "الأسبوع القادم" }, back: "رجوع", details: "بيانات العميل",
    you: "أنت", ai: "الذكاء الاصطناعي", aiAgent: "الوكيل الذكي", note: "ملاحظة", today: "اليوم", yesterday: "أمس",
    sent: "أُرسلت", delivered: "وصلت", read: "قُرئت", failed: "لم تُرسل", retry: "إعادة المحاولة",
    reply: "رد", internalNote: "ملاحظة داخلية", replyVia: "الرد عبر", typeReply: (c) => `اكتب ردًا عبر ${c}…`,
    typeNote: "ملاحظة لفريقك. اكتب @ للإشارة إلى زميل.", send: "إرسال", attach: "إرفاق ملف", emoji: "رموز تعبيرية",
    savedReplies: "ردود محفوظة", suggest: "اقترح ردًا", suggestion: "اقتراح الذكاء الاصطناعي", useIt: "استخدم", dismiss: "تجاهل",
    windowClosed: "انتهت نافذة واتساب البالغة ٢٤ ساعة. أرسل قالبًا معتمدًا لاستئناف المحادثة.", template: "القالب",
    sendTemplate: "إرسال القالب", enterHint: "Enter للإرسال · Shift + Enter لسطر جديد",
    aiActive: "الوكيل الذكي يتولى هذه المحادثة", aiActiveSub: "يرد ويحجز ويؤهل العملاء بنفسه.",
    takeOver: "تولَّ المحادثة", youHandle: "أنت تتولى هذه المحادثة", aiResumesIn: (t) => `يستأنف الوكيل الذكي بعد ${t} إن لم يرد أحد`,
    aiPaused: "الوكيل الذكي متوقف في هذه المحادثة", handBack: "أعدها للوكيل الذكي", resumeAfter: "استئناف الوكيل بعد",
    never: "لا تستأنف", min: (n) => `${n} دقيقة`, hour: (n) => `${n} ساعة`, aiResumed: "استأنف الوكيل الذكي بعد عدم الرد",
    tookOver: (n) => `تولى ${n} المحادثة من الوكيل الذكي`, handedBack: (n) => `أعاد ${n} المحادثة إلى الوكيل الذكي`,
    summary: "ملخص الذكاء الاصطناعي", about: "عن العميل", identities: "القنوات", source: "المصدر", firstTouch: "أول تواصل", campaign: "الحملة",
    deal: "الصفقة", owner: "المسؤول", stage: "المرحلة", value: "القيمة", tags: "الوسوم", history: "محادثات سابقة", openProfile: "فتح الملف الكامل",
    phone: "الهاتف", location: "الموقع", language: "اللغة", call: "اتصال", email: "بريد", message: "رسالة", meeting: "اجتماع", more: "إجراءات أخرى", edit: "تعديل", save: "حفظ",
    activity: "النشاط", logNote: "أضف ملاحظة", allActivity: "الكل", empty: "لا يوجد شيء بعد.",
    permissions: "الصلاحيات", scope: "نطاق الوصول", scopes: { own: "الخاصة به", team: "الخاصة بفريقه", all: "الجميع" },
    actions: { view: "عرض", create: "إنشاء", edit: "تعديل", delete: "حذف", export: "تصدير" }, allActions: "كل الإجراءات",
    pipeline: "مسار الصفقات", dropHere: "أفلت صفقة هنا", drag: "اسحب إلى مرحلة أخرى", moveTo: "نقل إلى", addDeal: "إضافة صفقة",
    calendar: "التقويم", previous: "السابق", next: "التالي", view: "العرض", views: { month: "شهر", week: "أسبوع", day: "يوم", agenda: "جدول" },
    moreEvents: (n) => `${n} أخرى`, newEvent: "حدث جديد", noEvents: "لا شيء مجدول في الأسبوعين القادمين.", allDay: "طوال اليوم",
    copy: "نسخ", copied: "تم النسخ", calling: "جارٍ الاتصال…", onHold: "قيد الانتظار", mute: "كتم", hold: "انتظار", hangUp: "إنهاء المكالمة",
    systemRole: "دور أساسي لا يمكن تعديله", members: (n, f = String) => (n === 1 ? "عضو واحد" : n === 2 ? "عضوان" : `${f(n)} ${n >= 3 && n <= 10 ? "أعضاء" : "عضو"}`),
  },
};

export function useCrm() {
  const { locale, direction } = useLocale();
  const lang = locale.startsWith("ar") ? "ar" : "en";
  const t = S[lang];
  const time = (d) => dateFormat(locale, { hour: "numeric", minute: "2-digit" }).format(d);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  // "10:42", "Yesterday", "Mon", "12 Oct": the way chat apps label a conversation's last message
  const when = (d, now = new Date()) => {
    if (sameDay(d, now)) return time(d);
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (sameDay(d, y)) return t.yesterday;
    if (now - d < 6 * 864e5) return dateFormat(locale, { weekday: "short" }).format(d);
    return dateFormat(locale, { day: "numeric", month: "short" }).format(d);
  };
  const day = (d, now = new Date()) => {
    if (sameDay(d, now)) return t.today;
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (sameDay(d, y)) return t.yesterday;
    return dateFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d);
  };
  const num = (v) => numberFormat(locale).format(v);
  return { t, lang, locale, rtl: direction === "rtl", time, when, day, num };
}
