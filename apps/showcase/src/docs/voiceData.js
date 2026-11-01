// Sample call: Taysir (AI agent, left channel) confirms an appointment with Nadia (customer, right channel).
import { synthCall } from "@truvar-ai/design-system/voice";

export const TURNS = [
  { id: "t1", speaker: "agent", start: 0.6, end: 4.4, latency: null, text: { en: "Hi Nadia, this is Taysir from Nile Clinics. I'm calling to confirm your appointment tomorrow at 10 am.", ar: "مرحبًا نادية، معك تيسير من عيادات النيل. أتصل لتأكيد موعدك غدًا الساعة العاشرة صباحًا." } },
  { id: "t2", speaker: "customer", start: 5.1, end: 7.4, text: { en: "Oh hi. Actually, I can't make it tomorrow.", ar: "أهلًا. في الحقيقة لن أستطيع الحضور غدًا." } },
  { id: "t3", speaker: "agent", start: 7.9, end: 11.6, latency: 510, text: { en: "No problem. Would you like to move it? I can check the next available times.", ar: "لا مشكلة. هل تريدين تغيير الموعد؟ يمكنني البحث عن أقرب المواعيد المتاحة." } },
  { id: "t4", speaker: "customer", start: 12.2, end: 14.0, text: { en: "Yes please, something next week.", ar: "نعم من فضلك، أي موعد الأسبوع القادم." } },
  { id: "t5", speaker: "agent", start: 17.4, end: 22.0, latency: 3380, text: { en: "I have Sunday at 10 am or Monday at 2 pm. Which suits you better?", ar: "لدي الأحد العاشرة صباحًا أو الاثنين الثانية ظهرًا. أيهما يناسبك أكثر؟" } },
  { id: "t6", speaker: "customer", start: 22.8, end: 24.6, text: { en: "Monday at 2 works.", ar: "الاثنين الثانية مناسب." } },
  { id: "t7", speaker: "agent", start: 25.0, end: 26.7, latency: 430, text: { en: "Great, Monday at 2 pm. Shall I…", ar: "ممتاز، الاثنين الثانية ظهرًا. هل أقوم…" } },
  { id: "t8", speaker: "customer", start: 26.6, end: 28.7, text: { en: "Can you send me a reminder on WhatsApp?", ar: "هل يمكنك إرسال تذكير لي على واتساب؟" } },
  { id: "t9", speaker: "agent", start: 29.2, end: 33.4, latency: 560, text: { en: "Of course. I'll send a WhatsApp reminder the day before your appointment.", ar: "بالتأكيد. سأرسل تذكيرًا على واتساب قبل الموعد بيوم." } },
  { id: "t10", speaker: "agent", start: 36.4, end: 39.8, latency: 2900, text: { en: "You're all set for Monday at 2 pm. Is there anything else I can help with?", ar: "تم تأكيد موعدك يوم الاثنين الثانية ظهرًا. هل هناك شيء آخر أساعدك فيه؟" } },
  { id: "t11", speaker: "customer", start: 40.6, end: 41.9, text: { en: "No, that's all. Thanks!", ar: "لا، هذا كل شيء. شكرًا!" } },
  { id: "t12", speaker: "agent", start: 42.3, end: 44.5, latency: 470, text: { en: "Thank you, Nadia. Have a lovely day.", ar: "شكرًا يا نادية. يومًا سعيدًا." } },
];
export const DURATION = 46.4;
export const EVENTS = [
  { t: 14.4, kind: "tool", label: { en: "Tool: check_availability", ar: "أداة: check_availability" } },
  { t: 26.6, kind: "interrupt", label: { en: "Caller interrupted", ar: "قاطع المتصل" } },
  { t: 33.8, kind: "tool", label: { en: "Tool: book_appointment", ar: "أداة: book_appointment" } },
  { t: 45.6, kind: "end", label: { en: "Customer ended the call", ar: "أنهى العميل المكالمة" } },
];

let cached = null;
export function getRecording() {
  if (!cached) cached = synthCall(TURNS, DURATION);
  return cached;
}

const clock = (t) => {
  const base = (15 * 3600 + 53 * 60 + 19.404) + t;
  const h = Math.floor(base / 3600), m = Math.floor((base % 3600) / 60), s = base % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0").replace(".", ":")}`;
};
export const LOGS = (() => {
  const out = [];
  const add = (t, level, msg) => out.push({ t, level, msg, clock: clock(t) });
  add(0, "checkpoint", "Call started (web, eu-central-1)");
  add(0.05, "log", "Model request started (truvar-voice-1, first message)");
  TURNS.forEach((tn) => {
    if (tn.speaker === "agent") {
      add(tn.start, "checkpoint", "Assistant speech started");
      add(tn.end, "checkpoint", "Assistant speech ended");
    } else {
      const words = tn.text.en.split(" ");
      add(tn.start + 0.6, "log", `Transcriber output: ${words.slice(0, 3).join(" ")}`);
      add(tn.end - 0.1, "log", `Transcriber output: ${tn.text.en}`);
      add(tn.end + 0.12, "checkpoint", "Model request started");
    }
  });
  add(14.4, "tool", "check_availability(range=\"next_week\") requested");
  add(17.1, "tool", "check_availability → 2 slots in 2.7 s");
  add(17.2, "warning", "Slow tool response (2.7 s). Filler phrase skipped.");
  add(26.6, "warning", "Caller interrupted assistant speech; stopping playback");
  add(33.8, "tool", "book_appointment(date=\"2026-11-02T14:00\") requested");
  add(36.2, "tool", "book_appointment → confirmed (#APT-48213)");
  add(36.25, "log", "WhatsApp reminder scheduled for 2026-11-01 14:00");
  add(45.6, "checkpoint", "Customer ended the call");
  add(45.9, "error", "Post-call webhook returned 502; retry 1 of 3 scheduled");
  return out.sort((a, b) => a.t - b.t);
})();

export const COST = [
  { label: { en: "Speech to text", ar: "تحويل الكلام إلى نص" }, cost: 0.0121, detail: { en: "Arabic + English, 0.77 min", ar: "عربي وإنجليزي، ٠٫٧٧ دقيقة" } },
  { label: { en: "AI model", ar: "نموذج الذكاء الاصطناعي" }, cost: 0.0284, detail: { en: "16,327 prompt tokens, 119 completion tokens", ar: "١٦٬٣٢٧ رمز إدخال، ١١٩ رمز إخراج" } },
  { label: { en: "Text to speech", ar: "تحويل النص إلى كلام" }, cost: 0.0196, detail: { en: "623 characters", ar: "٦٢٣ حرفًا" } },
  { label: { en: "Telephony", ar: "الاتصالات" }, cost: 0.0062, detail: { en: "Web call", ar: "مكالمة ويب" } },
  { label: { en: "Truvar platform", ar: "منصة Truvar" }, cost: 0.0387 },
];
export const MINUTES = DURATION / 60;

export const METADATA = {
  id: "2720e463-ad52-4dd5-9559-acb782d4b4c1",
  assistantId: "asst_taysir_appointments",
  type: "webCall",
  startedAt: "2026-10-27T15:53:19.404Z",
  endedAt: "2026-10-27T15:54:05.804Z",
  endedReason: "customer-ended-call",
  language: ["ar-EG", "en"],
  recording: { stereo: true, channels: { left: "assistant", right: "customer" }, sampleRate: 16000 },
  analysis: { successEvaluation: true, sentiment: "positive", summary: "Appointment moved to Monday 2 pm; WhatsApp reminder requested." },
  metrics: { turns: 12, interruptions: 1, medianLatencyMs: 535, toolCalls: 2 },
  customer: { name: "Nadia Kamel", phone: "+20 100 234 5678" },
};

export const LIVE_SCRIPT = [
  { speaker: "agent", dur: 3.2, latency: 640, text: { en: "Hi, this is Taysir from Nile Clinics. How can I help?", ar: "مرحبًا، معك تيسير من عيادات النيل. كيف أساعدك؟" } },
  { speaker: "customer", dur: 2.6, text: { en: "I'd like to book a check-up for next week.", ar: "أريد حجز فحص الأسبوع القادم." } },
  { speaker: "agent", dur: 3.4, latency: 720, text: { en: "Sure. I have Sunday at 10 am or Monday at 2 pm.", ar: "بالتأكيد. لدي الأحد العاشرة صباحًا أو الاثنين الثانية ظهرًا." } },
  { speaker: "customer", dur: 1.8, text: { en: "Monday, please.", ar: "الاثنين من فضلك." } },
  { speaker: "agent", dur: 3.0, latency: 580, text: { en: "Done. You're booked for Monday at 2 pm.", ar: "تم. موعدك الاثنين الثانية ظهرًا." } },
];

export const VARS = [
  { id: "first_name", label: { en: "First name", ar: "الاسم الأول" }, example: { en: "Nadia", ar: "نادية" } },
  { id: "agent", label: { en: "Agent name", ar: "اسم الوكيل" }, example: { en: "Taysir", ar: "تيسير" } },
  { id: "company", label: { en: "Company", ar: "الشركة" }, example: { en: "Nile Clinics", ar: "عيادات النيل" } },
  { id: "appt_time", label: { en: "Appointment time", ar: "موعد الحجز" }, example: { en: "tomorrow at 10 am", ar: "غدًا العاشرة صباحًا" } },
];

export const CALL_LIST = [
  { id: "c1", when: { en: "Today, 3:53 pm", ar: "اليوم، ٣:٥٣ م" }, who: { en: "Nadia Kamel", ar: "نادية كامل" }, channel: "web", dur: 46, outcome: "rescheduled", cost: 0.105 },
  { id: "c2", when: { en: "Today, 3:32 pm", ar: "اليوم، ٣:٣٢ م" }, who: { en: "Tarek Saleh", ar: "طارق صالح" }, channel: "phone", dur: 128, outcome: "confirmed", cost: 0.241 },
  { id: "c3", when: { en: "Today, 3:18 pm", ar: "اليوم، ٣:١٨ م" }, who: { en: "+20 111 *** 0021", ar: "+20 111 *** 0021" }, channel: "whatsapp", dur: 34, outcome: "voicemail", cost: 0.052 },
  { id: "c4", when: { en: "Today, 3:15 pm", ar: "اليوم، ٣:١٥ م" }, who: { en: "Salma Adel", ar: "سلمى عادل" }, channel: "phone", dur: 201, outcome: "transferred", cost: 0.386 },
  { id: "c5", when: { en: "Today, 2:58 pm", ar: "اليوم، ٢:٥٨ م" }, who: { en: "Karim Mostafa", ar: "كريم مصطفى" }, channel: "web", dur: 77, outcome: "confirmed", cost: 0.139 },
  { id: "c6", when: { en: "Today, 2:41 pm", ar: "اليوم، ٢:٤١ م" }, who: { en: "+966 50 *** 4567", ar: "+966 50 *** 4567" }, channel: "phone", dur: 12, outcome: "failed", cost: 0.018 },
];
export const OUTCOMES = {
  rescheduled: { en: "Rescheduled", ar: "أعيدت جدولته", tone: "accent" }, confirmed: { en: "Confirmed", ar: "تم التأكيد", tone: "success" },
  voicemail: { en: "Voicemail", ar: "بريد صوتي", tone: "neutral" }, transferred: { en: "Transferred", ar: "تم التحويل", tone: "navy" },
  failed: { en: "Failed", ar: "فشلت", tone: "danger" },
};
export const CHANNELS = { web: { en: "Web", ar: "ويب" }, phone: { en: "Phone", ar: "هاتف" }, whatsapp: { en: "WhatsApp", ar: "واتساب" } };
