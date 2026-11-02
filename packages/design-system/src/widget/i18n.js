// Strings and formatting for the website widget. Language follows React Aria's locale (I18nProvider),
// so the widget can speak Arabic on an English site and the other way round.
import { useLocale } from "react-aria-components";
import { dateFormat, numberFormat } from "../core/format.js";

const S = {
  en: {
    widget: "Chat with us", open: "Open chat", close: "Close chat", minimize: "Minimize", back: "Back", menu: "More options",
    online: "Online", away: "Away", offline: "Offline", repliesInstantly: "Replies instantly", aiAgent: "AI agent", teammate: "Team",
    hi: "Hi there", howHelp: "How can we help today?", askAnything: "Ask anything", askSub: "Our AI agent can answer, book and follow up for you.",
    continueChat: "Continue your conversation", talkNow: (n) => `Call ${n} now`, talkSub: "Talk it through. No waiting on hold.",
    message: "Message…", send: "Send", attach: "Attach a file", record: "Record a voice note", stopSend: "Send voice note",
    cancelRecording: "Delete recording", recording: "Recording", suggestions: "Suggested replies",
    play: "Play voice note", pause: "Pause voice note", transcript: "Transcript", showTranscript: "Show transcript", hideTranscript: "Hide transcript",
    working: "Working on it", stepsDone: (n, f = String) => `Done in ${f(n)} ${n === 1 ? "step" : "steps"}`, showSteps: "Show steps", hideSteps: "Hide steps",
    pickTime: "Pick a time", chosen: "Chosen", noSlots: "No times left this day.",
    submit: "Continue", required: "Required", sentDetails: "Details shared",
    confirm: "Confirm", change: "Change", confirmed: "Confirmed", cancelled: "Cancelled", needsApproval: "Needs your OK",
    choose: "Choose", typing: (n) => `${n} is typing`,
    rateTitle: "How did we do?", rateThanks: "Thanks for the feedback!", rateLabel: "Rate this conversation",
    rating: ["Very poor", "Poor", "Okay", "Good", "Excellent"],
    call: "Voice call", startCall: "Start a voice call", connecting: "Connecting…", live: "On call", ended: "Call ended", endCall: "End call",
    mute: "Mute", unmute: "Unmute", speaker: "Speaker", listening: "Listening", speaking: (n) => `${n} is speaking`, youSpeaking: "You're speaking", you: "You",
    callSummary: "Call summary", returnToChat: "Back to chat",
    poweredBy: (n) => `Powered by ${n}`, privacy: "By chatting you agree to our privacy policy. Calls may be recorded.",
    newMessage: (n) => `${n} new ${n === 1 ? "message" : "messages"}`, newChat: "Start a new chat", emailChat: "Email me this chat", human: "Talk to a person",
    dismiss: "Dismiss",
  },
  ar: {
    widget: "تحدث معنا", open: "افتح المحادثة", close: "أغلق المحادثة", minimize: "تصغير", back: "رجوع", menu: "خيارات أخرى",
    online: "متصل", away: "بعيد", offline: "غير متصل", repliesInstantly: "يرد فورًا", aiAgent: "وكيل ذكي", teammate: "الفريق",
    hi: "أهلًا بك", howHelp: "كيف نقدر نساعدك اليوم؟", askAnything: "اسأل أي شيء", askSub: "وكيلنا الذكي يجيب ويحجز ويتابع نيابةً عنك.",
    continueChat: "أكمل محادثتك", talkNow: (n) => `اتصل بـ${n} الآن`, talkSub: "تحدث مباشرة بدون انتظار.",
    message: "اكتب رسالة…", send: "إرسال", attach: "إرفاق ملف", record: "سجّل رسالة صوتية", stopSend: "أرسل الرسالة الصوتية",
    cancelRecording: "احذف التسجيل", recording: "جارٍ التسجيل", suggestions: "ردود مقترحة",
    play: "شغّل الرسالة الصوتية", pause: "أوقف الرسالة الصوتية", transcript: "النص", showTranscript: "اعرض النص", hideTranscript: "أخفِ النص",
    working: "جارٍ التنفيذ", stepsDone: (n, f = String) => (n === 1 ? "تم في خطوة واحدة" : n === 2 ? "تم في خطوتين" : `تم في ${f(n)} خطوات`), showSteps: "اعرض الخطوات", hideSteps: "أخفِ الخطوات",
    pickTime: "اختر موعدًا", chosen: "تم الاختيار", noSlots: "لا مواعيد متاحة في هذا اليوم.",
    submit: "متابعة", required: "مطلوب", sentDetails: "تمت مشاركة البيانات",
    confirm: "تأكيد", change: "تغيير", confirmed: "تم التأكيد", cancelled: "أُلغي", needsApproval: "بانتظار موافقتك",
    choose: "اختيار", typing: (n) => `${n} يكتب`,
    rateTitle: "كيف كانت تجربتك؟", rateThanks: "شكرًا على رأيك!", rateLabel: "قيّم هذه المحادثة",
    rating: ["سيئة جدًا", "سيئة", "مقبولة", "جيدة", "ممتازة"],
    call: "مكالمة صوتية", startCall: "ابدأ مكالمة صوتية", connecting: "جارٍ الاتصال…", live: "في مكالمة", ended: "انتهت المكالمة", endCall: "إنهاء المكالمة",
    mute: "كتم", unmute: "إلغاء الكتم", speaker: "مكبر الصوت", listening: "يستمع", speaking: (n) => `${n} يتحدث`, youSpeaking: "أنت تتحدث", you: "أنت",
    callSummary: "ملخص المكالمة", returnToChat: "العودة للمحادثة",
    poweredBy: (n) => `مدعوم من ${n}`, privacy: "باستخدامك المحادثة فأنت توافق على سياسة الخصوصية. قد تُسجَّل المكالمات.",
    newMessage: (n) => (n === 1 ? "رسالة جديدة" : `${n} رسائل جديدة`), newChat: "ابدأ محادثة جديدة", emailChat: "أرسل لي المحادثة بالبريد", human: "تحدث مع موظف",
    dismiss: "إغلاق",
  },
};

export function useWidget() {
  const { locale, direction } = useLocale();
  const lang = locale.startsWith("ar") ? "ar" : "en";
  const time = (d) => dateFormat(locale, { hour: "numeric", minute: "2-digit" }).format(d);
  const num = (v) => numberFormat(locale).format(v);
  // 0:07, 1:12: always Latin digit order inside an LTR span, localised digits
  const clock = (s) => {
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${num(m)}:${numberFormat(locale, { minimumIntegerDigits: 2 }).format(r)}`;
  };
  return { t: S[lang], lang, locale, dir: direction, rtl: direction === "rtl", time, num, clock };
}
