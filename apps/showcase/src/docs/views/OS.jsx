"use client";
import React, { useEffect, useState } from "react";
import * as RAC from "react-aria-components";
import {
  SystemBar, VoiceDock, ListeningView, AgentTaskCard, ApprovalCard, DoneCard, NotificationCard, NotificationStack, OSTaskCard,
  AppWindow, AgentCursor, DeviceCard, SmartTile, PermissionRow, LockScreen, useNow, BrandAvatar, OrbitMark, SwitchRow, toast, WifiIcon, BatteryIcon, CloudIcon, MicIcon, CameraIcon, BluetoothIcon, LockIcon, LocationIcon, AirplaneIcon, MoonIcon, ShieldIcon,
  DevicesIcon, FaceIdIcon, KeyboardIcon, AppsIcon, LightIcon, ThermoIcon, TvIcon, DoorIcon, LaptopIcon, PhoneDeviceIcon, ServerCloudIcon,
  HomeIcon, SpreadsheetIcon, ChatIcon, CardIcon, TrashIcon, FolderIcon, GlobeIcon, HistoryIcon,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { OS_T } from "../osText.js";
import { numberFormat } from "@truvar-ai/design-system";

const useOS = () => OS_T[useLang()];
const cx = (...c) => c.filter(Boolean).join(" ");

function OSFrame({ children, className, label }) {
  return <div className={cx("os-frame", className)} role="region" aria-label={label}>{children}</div>;
}

/* steps animation: returns statuses for n steps, advancing every ms; last step becomes "approval" */
function useSteps(n, ms = 1200, run = true, loop = false) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!run) { setI(0); return; }
    const id = setInterval(() => setI((x) => (x >= n - 1 ? (loop ? 0 : x) : x + 1)), ms);
    return () => clearInterval(id);
  }, [n, ms, run, loop]);
  return Array.from({ length: n }, (_, k) => (k < i ? "done" : k === i ? (k === n - 1 ? "approval" : "active") : "pending"));
}

/* ---------------- Prototype ---------------- */
const STAGES = ["lock", "home", "listening", "working", "approval", "done"];
export function OSPrototype() {
  const tr = useTr(); const t = useOS(); const lang = useLang();
  const now = useNow();
  const [stage, setStage] = useState("lock");
  const [heardLen, setHeardLen] = useState(0);
  const working = stage === "working";
  const steps = useSteps(t.task.steps.length, 1100, working);
  useEffect(() => { if (working && steps[steps.length - 1] === "approval") { const id = setTimeout(() => setStage("approval"), 900); return () => clearTimeout(id); } }, [steps, working]);
  useEffect(() => {
    if (stage !== "listening") return;
    setHeardLen(0);
    const words = t.heard.split(" ").length;
    const id = setInterval(() => setHeardLen((l) => Math.min(words + 1, l + 1)), 180);
    return () => clearInterval(id);
  }, [stage, t.heard]);
  const words = t.heard.split(" ");
  const stageNames = { lock: tr("Lock", "القفل"), home: tr("Home", "الرئيسية"), listening: tr("Listening", "الاستماع"), working: tr("Working", "التنفيذ"), approval: tr("Approval", "الموافقة"), done: tr("Done", "تم") };

  const bar = <SystemBar user={t.user} time={now} devices={7} mic={stage === "listening" || stage === "approval"} battery={{ level: 0.86 }} wifi={3} cloud={working ? "syncing" : "synced"}
    labels={t.sys} onAssistant={() => setStage("listening")} />;
  const dock = <VoiceDock state={stage === "listening" ? "listening" : working ? "thinking" : "idle"} label={stage === "listening" ? t.talkListening : working ? t.talkThinking : t.talk}
    labels={t.sys} onTalk={() => setStage(stage === "listening" ? "working" : "listening")} onApps={() => toast({ tone: "info", title: t.sys.apps })} onKeyboard={() => toast({ tone: "info", title: t.sys.keyboard })} />;

  return (
    <>
      <ViewHeader viewId="os-prototype" intro={tr(
        "A clickable walk through Truvar OS built only from the kit: unlock, ask Taysir by voice, watch it work, approve before anything is sent, and see the result. Use the buttons inside the screen, or jump to a step.",
        "جولة تفاعلية في Truvar OS مبنية بالكامل من مكونات المكتبة: افتح الجهاز، واطلب من تيسير بصوتك، وتابعه وهو يعمل، ووافق قبل إرسال أي شيء، وشاهد النتيجة. استخدم الأزرار داخل الشاشة أو انتقل إلى أي خطوة.")} />
      <div className="os-proto-bar">
        <RAC.ToggleButtonGroup aria-label={tr("Step", "الخطوة")} selectionMode="single" disallowEmptySelection selectedKeys={[stage]} onSelectionChange={(k) => setStage([...k][0])} className="tv-segmented tv-segmented--sm">
          {STAGES.map((s) => <RAC.ToggleButton key={s} id={s} className="tv-segment-btn"><RAC.SelectionIndicator className="tv-segment-indicator" /><span className="tv-segment-label">{stageNames[s]}</span></RAC.ToggleButton>)}
        </RAC.ToggleButtonGroup>
        <RAC.Button className="tv-btn tv-btn--ghost tv-btn--sm" onPress={() => setStage("lock")}>{tr("Start over", "من البداية")}</RAC.Button>
      </div>
      <OSFrame label={tr("Truvar OS prototype", "نموذج Truvar OS")} className="os-frame--proto">
        {stage === "lock" ? (
          <LockScreen user={t.user} time={now} battery={{ level: 0.86 }} wifi={3} device="Terra 1 Pro" labels={{ ...t.lock, ...t.sys }} onUnlock={() => setStage("home")}
            notifications={<NotificationStack restLabel={t.lock.rest} rest={7}
              lead={<NotificationCard tone="gold" icon={<Icon.FileText />} title={t.lock.leadTitle} body={t.lock.leadBody} meta={<><OrbitMark size={14} />{t.lock.leadMeta}</>} onOpen={() => setStage("home")} />}
              icons={[{ icon: <Icon.Calendar />, count: "٣".replace("٣", lang === "ar" ? "٣" : "3") }, { icon: <Icon.Mail />, count: lang === "ar" ? "٣" : "3" }, { icon: <Icon.TrendUp />, count: lang === "ar" ? "١" : "1" }]} />} />
        ) : (
          <div className="os-screen">
            {bar}
            <div className="os-screen-main">
              {stage === "home" && (
                <div className="os-home">
                  <BrandAvatar size={96} />
                  <h2 className="os-greeting">{t.home.greeting[now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"]}</h2>
                  <p className="os-greeting-sub">{t.home.sub}</p>
                  <p className="tv-desc os-try">{t.home.try}</p>
                  <div className="os-suggest">
                    {t.home.suggestions.map(([cmd, meta], i) => (
                      <RAC.Button key={i} className={cx("os-suggest-card", i === 0 && "is-gold")} onPress={() => (i === 0 ? setStage("listening") : toast({ tone: "info", title: cmd }))}>
                        <span className="os-suggest-icon">{[<Icon.FileText key="filetext-0" />, <DevicesIcon key="devices-1" />, <Icon.Mail key="mail-2" />][i]}</span>
                        <b dir="auto">{cmd}</b><span className="tv-desc">{meta}</span>
                      </RAC.Button>
                    ))}
                  </div>
                </div>
              )}
              {stage === "listening" && (
                <ListeningView heard={words.slice(0, heardLen).join(" ")} partial={heardLen > words.length ? t.heardPartial : ""} labels={t.listen}
                  onRun={() => setStage("working")} onCancel={() => setStage("home")} />
              )}
              {stage === "working" && (
                <div className="os-center"><AgentTaskCard title={t.task.title} subtitle={t.task.subtitle} footnote={t.task.footnote} labels={t.task}
                  steps={t.task.steps.map((label, i) => ({ label, status: steps[i] }))} onWatch={() => toast({ tone: "info", title: t.task.watch })} onStop={() => setStage("home")} /></div>
              )}
              {stage === "approval" && (
                <div className="os-dim"><div className="os-center"><ApprovalCard {...t.approval} labels={t.approval}
                  onApprove={() => { toast({ tone: "success", title: tr("Sent to Khaled on WhatsApp", "اتبعت لخالد على واتساب") }); setStage("done"); }}
                  onDeny={() => setStage("home")} onEdit={() => toast({ tone: "info", title: t.approval.edit })} /></div></div>
              )}
              {stage === "done" && (
                <div className="os-center"><DoneCard title={t.done.title} subtitle={t.done.subtitle}
                  followUp={{ question: t.done.question, yes: t.done.yes, later: t.done.later, voiceHint: t.done.voiceHint, onYes: () => { toast({ tone: "success", title: tr("Invoice created and sessions booked", "تم عمل الفاتورة وحجز المواعيد") }); setStage("home"); }, onLater: () => setStage("home") }}
                  stats={t.done.stats.map(([label, value], i) => ({ label, value, highlight: i === 2 }))} labels={{}} /></div>
              )}
            </div>
            {stage !== "approval" && dock}
          </div>
        )}
      </OSFrame>
    </>
  );
}

/* ---------------- System UI ---------------- */
export function OSSystem() {
  const tr = useTr(); const t = useOS(); const now = useNow(); const lang = useLang();
  const icons = [
    [<WifiIcon key="wifi-3" strength={3} />, "Wi-Fi", "واي فاي"], [<WifiIcon key="wifi-4" strength={1} />, tr("Weak signal", "إشارة ضعيفة"), ""], [<WifiIcon key="wifi-5" off />, tr("Wi-Fi off", "واي فاي مقفول"), ""],
    [<BatteryIcon key="battery-6" level={0.86} />, tr("Battery", "البطارية"), ""], [<BatteryIcon key="battery-7" level={0.12} />, tr("Battery low", "البطارية ضعيفة"), ""], [<BatteryIcon key="battery-8" level={0.5} charging />, tr("Charging", "بيشحن"), ""],
    [<CloudIcon key="cloud-9" state="synced" />, tr("Synced", "متزامن"), ""], [<CloudIcon key="cloud-10" state="syncing" />, tr("Syncing", "بيتزامن"), ""], [<CloudIcon key="cloud-11" state="offline" />, tr("Offline", "مش متصل"), ""],
    [<MicIcon key="mic-12" />, tr("Microphone", "المايك"), ""], [<CameraIcon key="camera-13" />, tr("Camera", "الكاميرا"), ""], [<BluetoothIcon key="bluetooth-14" />, "Bluetooth", ""],
    [<LocationIcon key="location-15" />, tr("Location", "الموقع"), ""], [<AirplaneIcon key="airplane-16" />, tr("Airplane mode", "وضع الطيران"), ""], [<MoonIcon key="moon-17" />, tr("Do not disturb", "عدم الإزعاج"), ""],
    [<ShieldIcon key="shield-18" />, tr("Protected", "محمي"), ""], [<LockIcon key="lock-19" />, tr("Locked", "مقفول"), ""], [<FaceIdIcon key="faceid-20" />, tr("Face unlock", "فتح بالوجه"), ""],
    [<DevicesIcon key="devices-21" />, tr("Devices", "الأجهزة"), ""], [<LaptopIcon key="laptop-22" />, tr("Laptop", "لابتوب"), ""], [<PhoneDeviceIcon key="phonedevice-23" />, tr("Phone", "موبايل"), ""],
    [<ServerCloudIcon key="servercloud-24" />, tr("Cloud server", "سيرفر سحابي"), ""], [<HomeIcon key="home-25" />, tr("Home", "البيت"), ""], [<KeyboardIcon key="keyboard-26" />, tr("Keyboard", "الكيبورد"), ""],
    [<AppsIcon key="apps-27" />, tr("Apps", "التطبيقات"), ""], [<LightIcon key="light-28" />, tr("Lights", "النور"), ""], [<ThermoIcon key="thermo-29" />, tr("Temperature", "الحرارة"), ""],
    [<TvIcon key="tv-30" />, "TV", ""], [<DoorIcon key="door-31" />, tr("Door", "الباب"), ""], [<CardIcon key="card-32" />, tr("Payments", "الدفع"), ""],
  ];
  return (
    <>
      <ViewHeader viewId="os-system" intro={tr("The always-visible parts of Truvar OS. Icons carry their state (signal, charge, sync), and privacy indicators appear whenever the mic or camera is in use.", "الأجزاء الظاهرة دائمًا في Truvar OS. الأيقونات تحمل حالتها (الإشارة والشحن والمزامنة)، ومؤشرات الخصوصية تظهر كلما كان المايك أو الكاميرا شغّالين.")} />
      <Spec id="os-icons" name={tr("System icons", "أيقونات النظام")} primitive="SystemIcons" wide note={tr("Same rounded stroke as the rest of Truvar. Low battery turns red, charging turns green, syncing turns gold.", "نفس الخط الدائري لباقي Truvar. البطارية الضعيفة حمراء، والشحن أخضر، والمزامنة ذهبية.")}>
        <div className="os-icon-grid">{icons.map(([ic, en], i) => <figure key={i} className="os-icon-cell">{React.cloneElement(ic, { size: 26 })}<figcaption>{en}</figcaption></figure>)}</div>
      </Spec>
      <Spec id="os-statusbar" name={tr("System bar", "شريط النظام")} primitive="SystemBar" wide note={tr("The orbit opens Taysir. When the mic or camera is on, a dark pill says so, in words.", "المدار يفتح تيسير. لما المايك أو الكاميرا يشتغلوا، تظهر كبسولة داكنة تقول ده بالكلام.")}>
        <div className="stack os-bars">
          <div className="os-bar-stage"><SystemBar user={t.user} time={now} devices={7} labels={t.sys} /></div>
          <div className="os-bar-stage"><SystemBar user={t.user} time={now} devices={7} mic labels={t.sys} cloud="syncing" /></div>
          <div className="os-bar-stage"><SystemBar time={now} devices={2} camera mic battery={{ level: 0.12 }} wifi={1} cloud="offline" labels={t.sys} /></div>
          <div className="os-bar-stage"><SystemBar time={now} devices={7} battery={{ level: 0.54, charging: true }} labels={t.sys} /></div>
        </div>
      </Spec>
      <Spec id="os-dock" name={tr("Voice dock", "شريط الصوت")} primitive="VoiceDock" wide note={tr("One big target to talk, with apps and keyboard either side. Idle, listening and working states.", "زر كبير للكلام، والتطبيقات والكيبورد على الجانبين. حالات الانتظار والاستماع والعمل.")}>
        <div className="stack os-docks">
          <VoiceDock state="idle" label={t.talk} labels={t.sys} />
          <VoiceDock state="listening" label={t.talkListening} labels={t.sys} />
          <VoiceDock state="thinking" label={t.talkThinking} labels={t.sys} />
        </div>
      </Spec>
      <Spec id="os-notifications" name={tr("Notifications", "الإشعارات")} primitive="NotificationCard + NotificationStack" note={tr("The most useful item leads; the rest fold into a summary with counts per app.", "الأهم يظهر أولًا، والباقي يتجمع في ملخص بعدد لكل تطبيق.")}>
        <div style={{ maxWidth: 560 }}>
          <NotificationStack restLabel={t.lock.rest} rest={7}
            lead={<NotificationCard tone="gold" icon={<Icon.FileText />} title={t.lock.leadTitle} body={t.lock.leadBody} meta={<><OrbitMark size={14} />{t.lock.leadMeta}</>} onOpen={() => {}} />}
            icons={[{ icon: <Icon.Calendar />, count: lang === "ar" ? "٣" : "3" }, { icon: <Icon.Mail />, count: lang === "ar" ? "٣" : "3" }, { icon: <Icon.TrendUp />, count: lang === "ar" ? "١" : "1" }]} />
        </div>
      </Spec>
    </>
  );
}

/* ---------------- Lock screen ---------------- */
export function OSLock() {
  const tr = useTr(); const t = useOS(); const now = useNow(); const lang = useLang();
  return (
    <>
      <ViewHeader viewId="os-lock" intro={tr("Unlock with your face or a password. What Taysir prepared overnight waits on the lock screen; details can be hidden in Permissions.", "افتح بوجهك أو بكلمة السر. اللي جهّزه تيسير بالليل مستنيك على شاشة القفل، وممكن تخفي التفاصيل من الصلاحيات.")} />
      <Spec id="os-lockscreen" name={tr("Lock screen", "شاشة القفل")} primitive="LockScreen" wide>
        <OSFrame label={tr("Lock screen", "شاشة القفل")}>
          <LockScreen user={t.user} time={now} battery={{ level: 0.86 }} wifi={3} device="Terra 1 Pro" labels={{ ...t.lock, ...t.sys }}
            onUnlock={() => toast({ tone: "success", title: tr("Unlocked", "اتفتح") })}
            notifications={<NotificationStack restLabel={t.lock.rest} rest={7}
              lead={<NotificationCard tone="gold" icon={<Icon.FileText />} title={t.lock.leadTitle} body={t.lock.leadBody} meta={<><OrbitMark size={14} />{t.lock.leadMeta}</>} />}
              icons={[{ icon: <Icon.Calendar />, count: lang === "ar" ? "٣" : "3" }, { icon: <Icon.Mail />, count: lang === "ar" ? "٣" : "3" }, { icon: <Icon.TrendUp />, count: lang === "ar" ? "١" : "1" }]} />} />
        </OSFrame>
      </Spec>
    </>
  );
}

/* ---------------- Agent at work ---------------- */
export function OSAgent() {
  const tr = useTr(); const t = useOS();
  const steps = useSteps(t.task.steps.length, 1400, true, true);
  return (
    <>
      <ViewHeader viewId="os-agent" intro={tr("How Taysir shows its work: what it heard, what it's doing step by step, and a clear yes-or-no before anything leaves your device.", "إزاي تيسير بيوريك شغله: سمع إيه، وبيعمل إيه خطوة بخطوة، وسؤال واضح بأيوه أو لأ قبل ما أي حاجة تطلع من جهازك.")} />
      <Spec id="os-listening" name={tr("Listening", "الاستماع")} primitive="ListeningView" wide note={tr("The words appear as you speak; the unfinished part is lighter. Speech is understood on the device.", "الكلام بيظهر وإنت بتتكلّم، والجزء اللي لسه مخلصش أفتح. والفهم بيحصل على الجهاز.")}>
        <OSFrame label={tr("Listening", "الاستماع")} className="os-frame--short"><ListeningView heard={t.heard} partial={t.heardPartial} labels={t.listen} onRun={() => toast({ tone: "info", title: t.listen.run })} onCancel={() => {}} /></OSFrame>
      </Spec>
      <Spec id="os-task" name={tr("Task progress", "تقدّم المهمة")} primitive="AgentTaskCard" wide note={tr("Every step is visible. The last step is always the person's approval when something will be sent or paid.", "كل خطوة ظاهرة. وآخر خطوة دايمًا موافقتك لو في حاجة هتتبعت أو هتتدفع.")}>
        <div className="os-cardstage"><AgentTaskCard title={t.task.title} subtitle={t.task.subtitle} footnote={t.task.footnote} labels={t.task}
          steps={t.task.steps.map((label, i) => ({ label, status: steps[i] }))} onWatch={() => {}} onStop={() => {}} /></div>
      </Spec>
      <Spec id="os-approval" name={tr("Approval", "الموافقة")} primitive="ApprovalCard (alertdialog)" wide note={tr("Shows exactly what will be sent, to whom and where. Answer by tapping or by voice.", "بيوري بالظبط إيه اللي هيتبعت ولمين وفين. وترد بالضغط أو بصوتك.")}>
        <div className="os-cardstage"><ApprovalCard {...t.approval} labels={t.approval} onApprove={() => toast({ tone: "success", title: tr("Sent", "اتبعت") })} onDeny={() => {}} onEdit={() => {}} /></div>
      </Spec>
      <Spec id="os-done" name={tr("Done", "تم")} primitive="DoneCard" wide note={tr("The result first, then the obvious next step, then the day's tally. Gold marks the number that matters: apps you didn't have to open.", "النتيجة أولًا، ثم الخطوة التالية، ثم حصيلة اليوم. والذهبي يميّز الرقم المهم: برامج ماحتجتش تفتحها.")}>
        <div className="os-cardstage"><DoneCard title={t.done.title} subtitle={t.done.subtitle} labels={{}}
          followUp={{ question: t.done.question, yes: t.done.yes, later: t.done.later, voiceHint: t.done.voiceHint, onYes: () => {}, onLater: () => {} }}
          stats={t.done.stats.map(([label, value], i) => ({ label, value, highlight: i === 2 }))} /></div>
      </Spec>
    </>
  );
}

/* ---------------- Workspace + remote ---------------- */
function useTyping(text, run = true, speed = 140, pauseMs = 2200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let timer;
    const tick = (k) => { setN(k); timer = setTimeout(() => (k >= text.length ? (setN(text.length), timer = setTimeout(() => tick(0), pauseMs)) : tick(k + 1)), k >= text.length ? pauseMs : speed); };
    tick(0);
    return () => clearTimeout(timer);
  }, [text, run, speed, pauseMs]);
  return text.slice(0, n);
}
export function OSWorkspace() {
  const tr = useTr(); const t = useOS(); const lang = useLang();
  const P = t.ws.people;
  const typed = useTyping(P[3]);
  const typing = typed.length < P[3].length;
  const remoteTyped = useTyping(lang === "ar" ? "٩٣٬١٠٠" : "93,100", true, 260, 2400);
  const nf = (v) => numberFormat(lang === "ar" ? "ar-EG" : "en-US").format(v);
  return (
    <>
      <ViewHeader viewId="os-workspace" intro={tr("When Taysir works across apps, you see each window and its cursor. Nothing happens behind your back.", "لما تيسير يشتغل على أكتر من تطبيق، بتشوف كل شاشة والمؤشر بتاعه. مفيش حاجة بتحصل من وراك.")} />
      <Spec id="os-multiapp" name={tr("Working across apps", "العمل على أكتر من تطبيق")} primitive="AppWindow + AgentCursor" wide
        note={tr("The active window gets a navy frame and a “typing” badge. Rows being changed are highlighted until they're done.", "الشاشة النشطة ليها إطار كحلي وشارة «بيكتب». والصفوف اللي بتتغير بتفضل مميزة لحد ما تخلص.")}>
        <OSFrame label={tr("Workspace", "مساحة العمل")} className="os-frame--auto">
          <div className="os-screen-pad">
            <div className="os-ws-head os-card">
              <div className="os-ws-title"><BrandAvatar size={52} active activity="searching" /><div><h3 className="os-card-title">{t.ws.title}</h3><p className="tv-desc">{t.ws.sub}</p></div></div>
              <div className="os-ws-ask"><div><b>{t.ws.ask}</b><span className="tv-desc">{t.ws.askHint}</span></div>
                <div className="row"><RAC.Button className="tv-btn tv-btn--primary tv-btn--sm">{t.ws.yes}</RAC.Button><RAC.Button className="tv-btn tv-btn--secondary tv-btn--sm">{t.ws.later}</RAC.Button></div></div>
            </div>
            <div className="os-ws-grid">
              <AppWindow icon={<Icon.Mail width={16} height={16} />} title={t.ws.mail}>
                {P.map((p, i) => (
                  <div key={i} className={cx("os-row", i === 3 && "is-live")}><b dir="auto">{p}</b>
                    <span className={cx("os-chip", i >= 4 && "is-warn", i < 3 && "is-ok")}>{i < 3 ? t.ws.added : i === 3 ? <><span className="os-rec-dot" />{t.ws.adding}</> : t.ws.notPaid}</span></div>
                ))}
              </AppWindow>
              <AppWindow icon={<SpreadsheetIcon size={16} />} title={t.ws.sheet} badge={t.ws.typing} active>
                <div className="os-row os-row--head"><span>{t.ws.name}</span><span>{t.ws.pay}</span></div>
                {P.slice(0, 3).map((p, i) => <div key={i} className="os-row"><span dir="auto">{p}</span><b>{t.ws.paid} ✓</b></div>)}
                <div className="os-row is-live"><span className="os-typing" dir="auto">{typed}{typing && <span className="os-caret" />}</span><span>{!typing && <b>{t.ws.paid} ✓</b>}</span></div>
                <AgentCursor x={typing ? "38%" : "70%"} y={typing ? "78%" : "80%"} label={t.sys.assistant} />
              </AppWindow>
              <AppWindow icon={<Icon.Calendar width={16} height={16} />} title={t.ws.cal}>
                <p className="tv-desc" style={{ margin: "10px 16px 4px", fontWeight: 600 }}>{t.ws.calTitle}</p>
                {t.ws.slots.map(([a, b], i) => <div key={i} className={cx("os-slot", i === 2 && "is-pending")}>{a}<span>{b}</span></div>)}
              </AppWindow>
            </div>
          </div>
        </OSFrame>
      </Spec>
      <Spec id="os-remote" name={tr("Another device's screen", "شاشة جهاز تاني")} primitive="AppWindow + AgentCursor" wide
        note={tr("Watch Taysir work on another device and take control at any moment. The connection is encrypted.", "تابع تيسير وهو بيشتغل على جهاز تاني وخد التحكم في أي لحظة. والاتصال مشفّر.")}>
        <OSFrame label={tr("Remote device", "جهاز بعيد")} className="os-frame--auto">
          <div className="os-screen-pad os-remote">
            <div className="os-card os-remote-side">
              <div className="os-ws-title"><BrandAvatar size={48} active activity="searching" /><h3 className="os-card-title">{t.remote.title}</h3></div>
              <p className="os-remote-cmd" dir="auto">{t.remote.command}</p>
              <ol className="os-steps">
                {t.remote.steps.map((s, i) => <li key={i} className={cx("os-step", i < 2 ? "is-done" : i === 2 ? "is-active" : "is-pending")}><span className="os-step-mark">{i < 2 ? <Icon.Check /> : i === 2 ? <span className="os-step-spin" /> : null}</span><span className="os-step-label">{s}</span></li>)}
              </ol>
              <p className="os-privacy-note"><LockIcon size={14} />{t.remote.secure}</p>
              <RAC.Button className="tv-btn tv-btn--primary" onPress={() => toast({ tone: "info", title: t.remote.take })}>{t.remote.take}</RAC.Button>
              <p className="tv-desc os-voice-hint"><MicIcon size={14} />{t.remote.voice}</p>
            </div>
            <section className="os-remote-screen" aria-label={t.remote.viewing}>
              <header className="os-remote-head"><LaptopIcon size={18} /><b>{t.remote.viewing}</b><span className="os-window-badge is-gold"><span className="os-rec-dot" />{t.remote.working}</span>
                <span className="os-remote-actions"><RAC.Button className="tv-btn tv-btn--sm os-remote-take">{t.remote.take}</RAC.Button><RAC.Button className="tv-icon-btn os-remote-x" aria-label={t.remote.close}><Icon.X /></RAC.Button></span></header>
              <div className="os-remote-body">
                <div className="os-remote-app">
                  <div className="os-remote-titlebar"><span className="os-dots"><i /><i /><i /></span><b>{t.remote.report}</b></div>
                  <div className="os-row os-row--head"><span>{t.remote.branch}</span><span>{t.remote.sep}</span><span>{t.remote.oct}</span></div>
                  {[[142000, 158500], [96200, 101800], [88400, null], [54900, null]].map(([s, o], i) => (
                    <div key={i} className={cx("os-row os-row--3", i < 2 && "is-live", i === 2 && "is-live")}>
                      <b>{t.remote.branches[i]}</b><span>{nf(s)}</span>
                      <span>{o != null ? <b>{nf(o)} ✓</b> : i === 2 ? <span className="os-typing">{remoteTyped}<span className="os-caret" /></span> : ""}</span>
                    </div>
                  ))}
                  <div className="os-row os-row--3"><b>{t.remote.total}</b><b>{nf(381500)}</b><span className="tv-desc">{t.remote.calculating}</span></div>
                  <AgentCursor x="62%" y="64%" label={t.sys.assistant} />
                </div>
              </div>
            </section>
          </div>
        </OSFrame>
      </Spec>
    </>
  );
}

/* ---------------- Work + devices ---------------- */
export function OSHome() {
  const tr = useTr(); const t = useOS();
  const [tiles, setTiles] = useState([true, false, false, true]);
  const D = t.devices;
  return (
    <>
      <ViewHeader viewId="os-home" intro={tr("Where ongoing work and connected devices live. Jobs keep running on your cloud server even when this device is closed.", "مكان الشغل الجاري والأجهزة المتصلة. الشغل بيكمّل على سيرفرك في السحابة حتى لو الجهاز ده مقفول.")} />
      <Spec id="os-mywork" name={t.work.title} primitive="OSTaskCard" wide note={t.work.sub}>
        <div className="os-work-grid">
          {t.work.items.map(([title, status, tone, hl], i) => (
            <OSTaskCard key={i} title={title} status={status} tone={tone} highlight={hl} action={t.work.open} onAction={() => {}}
              icon={[<Icon.Users key="users-33" />, <Icon.FileText key="filetext-34" />, <GlobeIcon key="globe-35" size={22} />][i]} />
          ))}
          <div className="os-work-new"><span className="os-work-icon"><Icon.Plus /></span><div><h3 style={{ margin: 0 }} className="os-new-title">{t.work.newTitle}</h3><span className="tv-desc">{t.work.newHint}</span></div></div>
        </div>
        <div className="os-cloud-strip"><ServerCloudIcon size={18} /><span>{t.work.cloud}</span>{t.work.chips.map((c, i) => <span key={i} className="os-chip">{i === 0 ? <Icon.Clock width={13} height={13} /> : <HistoryIcon size={13} />}{c}</span>)}</div>
      </Spec>
      <Spec id="os-devices" name={D.title} primitive="DeviceCard + SmartTile" wide note={D.sub}>
        <div className="os-devices">
          <DeviceCard icon={<LaptopIcon />} name={D.laptop[0]} meta={D.laptop[1]} command={D.laptop[2]} action={D.laptop[3]} onAction={() => {}} />
          <DeviceCard icon={<ServerCloudIcon />} tone="navy" name={D.cloud[0]} meta={D.cloud[1]} command={D.cloud[2]} action={D.cloud[3]} onAction={() => {}} />
          <div className="os-this-device">
            <h3><LaptopIcon size={20} />Terra 1 Pro</h3>
            <BrandAvatar size={96} />
            <p>{D.here}</p>
            <span className="os-pill">{D.notApp}</span>
          </div>
          <DeviceCard icon={<PhoneDeviceIcon />} name={D.phone[0]} meta={D.phone[1]} command={D.phone[2]}><p className="tv-desc" style={{ margin: 0 }}>{D.phone[3]}</p></DeviceCard>
          <DeviceCard icon={<HomeIcon />} tone="gold" name={D.home[0]} meta={D.home[1]} command={D.home[2]}>
            <div className="os-tiles">
              {D.tiles.map(([label, on, off], i) => (
                <SmartTile key={i} icon={[<LightIcon key="light-36" />, <ThermoIcon key="thermo-37" />, <TvIcon key="tv-38" />, <DoorIcon key="door-39" />][i]} label={label} onLabel={on} offLabel={off}
                  isSelected={tiles[i]} onChange={(v) => setTiles((x) => x.map((y, j) => (j === i ? v : y)))} />
              ))}
            </div>
          </DeviceCard>
        </div>
        <div className="row" style={{ marginTop: 16 }}><RAC.Button className="tv-btn tv-btn--secondary"><Icon.Plus />{D.add}</RAC.Button><span className="tv-desc">{D.addHint}</span></div>
      </Spec>
    </>
  );
}

/* ---------------- Permissions ---------------- */
export function OSPermissions() {
  const tr = useTr(); const t = useOS(); const P = t.perms;
  const [vals, setVals] = useState(P.rows.map((r) => r[2]));
  const [where, setWhere] = useState("auto");
  const opts = ["auto", "ask", "never"].map((id) => ({ id, label: P.options[id] }));
  return (
    <>
      <ViewHeader viewId="os-permissions" intro={P.sub} />
      <Spec id="os-perms" name={P.title} primitive="PermissionRow (ToggleButtonGroup)" wide
        note={tr("Three clear choices per capability. Money and deleting are where people expect the strictest defaults: never, and ask first.", "تلات اختيارات واضحة لكل قدرة. الفلوس والمسح هما المكان اللي الناس متوقعة فيه أشد الإعدادات: لأ، ويسألني الأول.")}>
        <div className="os-card os-perm-card">
          <div className="os-perms">
            {P.rows.map(([label, desc], i) => (
              <PermissionRow key={i} icon={[<FolderIcon key="folder-40" />, <GlobeIcon key="globe-41" />, <ChatIcon key="chat-42" />, <DevicesIcon key="devices-43" />, <TrashIcon key="trash-44" />, <CardIcon key="card-45" />][i]} label={label} description={desc || undefined}
                sensitive={i === 3 || i === 5} value={vals[i]} onChange={(v) => setVals((x) => x.map((y, j) => (j === i ? v : y)))} options={opts} />
            ))}
          </div>
          <div className="os-perm-extras">
            <div className="tv-settings"><SwitchRow defaultSelected label={P.sensitive} /></div>
            <div className="tv-settings"><SwitchRow label={P.hideLock} /></div>
            <RAC.Select selectedKey={where} onSelectionChange={setWhere} className="tv-field os-where">
              <RAC.Label className="tv-label">{P.where}</RAC.Label>
              <RAC.Button className="tv-select-btn"><RAC.SelectValue /><Icon.ChevronDown /></RAC.Button>
              <RAC.Popover className="tv-popover" offset={6}><RAC.ListBox className="tv-listbox">{P.whereOpts.map(([id, l]) => <RAC.ListBoxItem key={id} id={id} textValue={l} className="tv-item">{l}<Icon.Check className="tv-check-icon" /></RAC.ListBoxItem>)}</RAC.ListBox></RAC.Popover>
            </RAC.Select>
          </div>
          <RAC.Link className="tv-link tv-link--standalone os-history"><HistoryIcon size={16} />{P.history}</RAC.Link>
        </div>
      </Spec>
    </>
  );
}
