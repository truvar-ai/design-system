import React, { useMemo, useState } from "react";
import * as RAC from "react-aria-components";
import {
  CallSessionProvider, CallPlayer, MiniPlayer, Transcript, CallLogs, CostBreakdown, JsonView, CodeBlock, CopyButton, LiveCall,
  WorkflowBuilder, Badge, StatTile, Tabs, TabList, Tab, TabPanel, Table, TableHeader, Column, TableBody, Row, Cell, Avatar, toast, useFormat, formatClock,
} from "../../components/index.jsx";
import * as Icon from "../../components/icons.jsx";
import { useTr, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { TURNS, EVENTS, LOGS, COST, MINUTES, METADATA, LIVE_SCRIPT, VARS, CALL_LIST, OUTCOMES, CHANNELS, getRecording } from "../voiceData.js";

const useL = () => { const lang = useLang(); return (o) => (lang === "ar" ? o.ar : o.en); };
const ChannelIcon = ({ ch }) => (ch === "phone" ? <Icon.Phone /> : ch === "whatsapp" ? <Icon.Send className="tv-flip" /> : <Icon.Globe />);

/* ---------------- Call review (composite) ---------------- */
export function CallReview() {
  const tr = useTr(); const L = useL(); const f = useFormat(); const { locale } = RAC.useLocale();
  const recording = useMemo(getRecording, []);
  const [sel, setSel] = useState("c1");
  const call = CALL_LIST.find((c) => c.id === sel);
  const o = OUTCOMES[call.outcome];
  return (
    <>
      <ViewHeader viewId="call-review" intro={tr(
        "Review a call the way your team will: the stereo recording with the agent and customer on separate channels, a transcript that follows the audio, logs you can jump from, and what the call cost.",
        "راجع المكالمة كما سيراجعها فريقك: التسجيل الستيريو مع الوكيل والعميل على قناتين منفصلتين، ونص يتابع الصوت، وسجلات تنتقل منها إلى لحظة بعينها، وتكلفة المكالمة.")} />
      <div className="cr">
        <aside className="cr-list">
          <p className="cr-list-title">{tr("Recent calls", "أحدث المكالمات")}</p>
          <RAC.GridList aria-label={tr("Recent calls", "أحدث المكالمات")} selectionMode="single" disallowEmptySelection selectedKeys={[sel]}
            onSelectionChange={(k) => { const v = [...k][0]; if (v) setSel(v); }} className="cr-gridlist" items={CALL_LIST}>
            {(c) => (
              <RAC.GridListItem id={c.id} textValue={L(c.who)} className="cr-item">
                <span className="cr-item-icon"><ChannelIcon ch={c.channel} /></span>
                <span className="cr-item-text"><b dir="auto">{L(c.who)}</b><span className="tv-desc">{L(c.when)} · <span dir="ltr">{formatClock(c.dur, locale)}</span></span></span>
                <Badge tone={OUTCOMES[c.outcome].tone}>{L(OUTCOMES[c.outcome])}</Badge>
              </RAC.GridListItem>
            )}
          </RAC.GridList>
        </aside>
        <section className="cr-main" aria-label={tr("Call details", "تفاصيل المكالمة")}>
          <header className="cr-head">
            <div className="cr-head-who">
              <Avatar name={L(call.who)} size={44} />
              <div><h2 className="cr-title" dir="auto">{L(call.who)}</h2><p className="tv-desc" style={{ margin: 0 }}>{L(call.when)}</p></div>
            </div>
            <div className="cr-head-badges">
              <Badge tone="neutral"><ChannelIcon ch={call.channel} />{L(CHANNELS[call.channel])}</Badge>
              <Badge tone={o.tone} dot>{L(o)}</Badge>
              <span className="cr-id"><code dir="ltr">{METADATA.id.slice(0, 13)}…</code><CopyButton text={METADATA.id} size="sm" label={tr("Copy call ID", "نسخ معرّف المكالمة")} /></span>
            </div>
          </header>
          <CallSessionProvider key={sel} recording={recording}>
            <CallPlayer events={EVENTS.map((e) => ({ ...e, label: L(e.label) }))} filename={`call-${sel}`}
              side={<Transcript turns={TURNS} events={EVENTS} maxHeight={460} />} />
            <Tabs>
              <TabList aria-label={tr("Call details", "تفاصيل المكالمة")}>
                <Tab id="transcript">{tr("Transcript", "النص")}</Tab>
                <Tab id="logs">{tr("Logs", "السجلات")}</Tab>
                <Tab id="analysis">{tr("Analysis", "التحليل")}</Tab>
                <Tab id="cost">{tr("Cost", "التكلفة")}</Tab>
                <Tab id="meta">{tr("Metadata", "البيانات الوصفية")}</Tab>
              </TabList>
              <TabPanel id="transcript"><Transcript turns={TURNS} events={EVENTS} /></TabPanel>
              <TabPanel id="logs"><CallLogs logs={LOGS} /></TabPanel>
              <TabPanel id="analysis">
                <div className="stack">
                  <div className="cr-summary">
                    <Icon.CheckCircle className="cr-summary-icon" />
                    <div><b>{tr("Goal achieved", "تم تحقيق الهدف")}</b><p className="body" style={{ margin: "4px 0 0" }}>{tr("Nadia moved her appointment to Monday at 2 pm and asked for a WhatsApp reminder, which was scheduled.", "نقلت نادية موعدها إلى الاثنين الثانية ظهرًا وطلبت تذكيرًا على واتساب، وتمت جدولته.")}</p></div>
                  </div>
                  <div className="stat-grid">
                    <StatTile label={tr("Median response time", "متوسط زمن الاستجابة")} value={f.number(535, { style: "unit", unit: "millisecond", unitDisplay: "short" })} />
                    <StatTile label={tr("Turns", "الأدوار")} value={f.number(12)} />
                    <StatTile label={tr("Interruptions", "المقاطعات")} value={f.number(1)} />
                    <StatTile label={tr("Sentiment", "الانطباع")} value={tr("Positive", "إيجابي")} />
                  </div>
                  <p className="tv-desc" style={{ margin: 0 }}>{tr("Two responses took about 3 seconds while tools ran. They're marked with hatching when Skip silence is on.", "استغرق ردّان نحو ٣ ثوانٍ أثناء عمل الأدوات، ويظهران مظللين عند تفعيل تخطي الصمت.")}</p>
                </div>
              </TabPanel>
              <TabPanel id="cost"><div style={{ maxWidth: 560 }}><CostBreakdown items={COST} minutes={MINUTES} /></div></TabPanel>
              <TabPanel id="meta"><JsonView value={METADATA} title="call.json" /></TabPanel>
            </Tabs>
          </CallSessionProvider>
        </section>
      </div>
    </>
  );
}

/* ---------------- Player sizes ---------------- */
export function PlayerView() {
  const tr = useTr(); const L = useL(); const { locale } = RAC.useLocale();
  const recording = useMemo(getRecording, []);
  return (
    <>
      <ViewHeader viewId="call-player" intro={tr(
        "One player in three sizes. The agent plays on the left channel and the customer on the right, each with its own colour, mute and solo. Time always runs left to right, as in every audio editor, including in Arabic.",
        "مشغل واحد بثلاثة أحجام. الوكيل على القناة اليسرى والعميل على اليمنى، ولكل منهما لونه وكتمه واستماعه المنفرد. ويسير الوقت دائمًا من اليسار لليمين كما في كل برامج الصوت، حتى في العربية.")} />
      <Spec id="mini-player" name={tr("Mini player", "مشغل مصغّر")} primitive="CallSession + Slider" note={tr("For table rows and cards. Play, scrub and time in one line.", "لصفوف الجداول والبطاقات: تشغيل وتمرير ووقت في سطر واحد.")} wide>
        <div className="tv-table-scroll">
          <Table aria-label={tr("Calls", "المكالمات")}>
            <TableHeader>
              <Column isRowHeader>{tr("Caller", "المتصل")}</Column>
              <Column>{tr("Outcome", "النتيجة")}</Column>
              <Column>{tr("Recording", "التسجيل")}</Column>
            </TableHeader>
            <TableBody items={CALL_LIST.slice(0, 3)}>
              {(c) => (
                <Row id={c.id}>
                  <Cell><b dir="auto">{L(c.who)}</b></Cell>
                  <Cell><Badge tone={OUTCOMES[c.outcome].tone} dot>{L(OUTCOMES[c.outcome])}</Badge></Cell>
                  <Cell><CallSessionProvider recording={recording}><MiniPlayer /></CallSessionProvider></Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
      </Spec>
      <Spec id="stereo-player" name={tr("Stereo player", "مشغل ستيريو")} primitive="wavesurfer.js (split channels) + Web Audio" wide
        note={tr("Click or drag the waveform to seek. Mute or solo a channel on the left. The diamonds are call events (tools, interruptions, hang-up); select one to jump to it. Skip silence jumps over long pauses and shades them. Download gives stereo or mono WAV.", "اضغط على الموجة أو اسحبها للانتقال. اكتم قناة أو استمع لها منفردة من اليسار. المعيّنات أحداث المكالمة (أدوات، مقاطعات، إنهاء)، واختر أحدها للانتقال إليه. «تخطي الصمت» يقفز فوق الفترات الطويلة ويظللها. والتنزيل بصيغة ستيريو أو أحادية WAV.")}>
        <CallSessionProvider recording={recording}>
          <CallPlayer events={EVENTS.map((e) => ({ ...e, label: L(e.label) }))} side={<Transcript turns={TURNS} events={EVENTS} maxHeight={420} />} />
        </CallSessionProvider>
      </Spec>
      <Spec id="expanded-player" name={tr("Expanded player", "المشغل الموسّع")} primitive="Modal"
        note={tr("The expand button opens a large waveform with the transcript beside it. It shares the same playback, so audio continues where you were.", "زر التوسيع يفتح موجة كبيرة مع النص بجوارها، ويشارك نفس التشغيل فيستمر الصوت من حيث كنت.")}>
        <p className="body" style={{ margin: 0 }}>{tr("Use the expand icon at the end of the stereo player above.", "استخدم أيقونة التوسيع في نهاية مشغل الستيريو بالأعلى.")}</p>
      </Spec>
    </>
  );
}

/* ---------------- Workflow ---------------- */
export function WorkflowView() {
  const tr = useTr();
  return (
    <>
      <ViewHeader viewId="workflow" intro={tr(
        "Design call flows visually. Drag nodes, connect them, and edit the selected node on the side. Say nodes use the prompt editor, so variables stay single chips.",
        "صمّم مسارات المكالمات بصريًا: اسحب العقد واربطها وعدّل العقدة المحددة من اللوحة الجانبية. عقد «قل» تستخدم محرر الأوامر فتبقى المتغيرات وحدات واحدة.")} />
      <Spec id="workflow-builder" name={tr("Workflow builder", "منشئ سير العمل")} primitive="@xyflow/react" wide
        note={tr("Mouse or touch: drag to move, drag from a dot to connect, Backspace deletes the selection. The canvas stays left to right in Arabic; the side panel mirrors.", "بالفأرة أو اللمس: اسحب للتحريك، واسحب من نقطة للربط، ومفتاح الحذف يحذف المحدد. تبقى اللوحة من اليسار لليمين في العربية، وتنعكس اللوحة الجانبية.")}>
        <WorkflowBuilder vars={VARS} />
      </Spec>
    </>
  );
}

/* ---------------- Live call ---------------- */
export function LiveCallView() {
  const tr = useTr(); const L = useL();
  return (
    <>
      <ViewHeader viewId="live-call" intro={tr(
        "The test-call widget for agent builders and website embeds: connecting, live with a timer, who's speaking, your microphone level, response latency and a running transcript.",
        "أداة المكالمة التجريبية لمنشئي الوكلاء ولتضمينها في المواقع: الاتصال، والمكالمة المباشرة بمؤقت، ومن يتحدث، ومستوى ميكروفونك، وزمن الاستجابة، ونص متتابع.")} />
      <Spec id="live-widget" name={tr("Live call", "مكالمة مباشرة")} primitive="LiveCall"
        note={tr("Latency turns gold above 800 ms and red above 1.3 s, with the number always shown. In your app, connect onStart and onEnd to your calling client.", "يتحول زمن الاستجابة إلى الذهبي فوق ٨٠٠ ملّي ثانية وإلى الأحمر فوق ١٫٣ ثانية، مع عرض الرقم دائمًا. في تطبيقك اربط onStart و onEnd بعميل الاتصال.")}>
        <LiveCall agentName={L({ en: "Taysir", ar: "تيسير" })} script={LIVE_SCRIPT} />
      </Spec>
    </>
  );
}

/* ---------------- Developer ---------------- */
const SNIPPETS = (id) => [
  { id: "curl", label: "cURL", lang: "bash", code: `curl https://api.truvar.ai/v1/calls/${id} \\\n  -H "Authorization: Bearer $TRUVAR_API_KEY"` },
  { id: "js", label: "JavaScript", lang: "js", code: `import Truvar from "@truvar/sdk";\n\nconst truvar = new Truvar({ apiKey: process.env.TRUVAR_API_KEY });\n\n// Fetch a call with its recording and transcript\nconst call = await truvar.calls.get("${id}");\nconsole.log(call.analysis.summary);` },
  { id: "py", label: "Python", lang: "py", code: `from truvar import Truvar\n\ntruvar = Truvar(api_key=os.environ["TRUVAR_API_KEY"])\n\n# Fetch a call with its recording and transcript\ncall = truvar.calls.get("${id}")\nprint(call.analysis.summary)` },
];
export function DeveloperView() {
  const tr = useTr();
  return (
    <>
      <ViewHeader viewId="developer" intro={tr("Tools for the people integrating with Truvar: payloads, code samples and IDs, all copyable. Code is always left to right.", "أدوات لمن يربطون أنظمتهم مع Truvar: بيانات وأمثلة كود ومعرّفات، كلها قابلة للنسخ. والكود دائمًا من اليسار لليمين.")} />
      <Spec id="json-viewer" name={tr("JSON viewer", "عارض JSON")} primitive="JsonView" wide note={tr("Collapsible objects and arrays, colour by type, and one-click copy of the whole payload.", "كائنات ومصفوفات قابلة للطي، وألوان حسب النوع، ونسخ البيانات كاملة بضغطة.")}>
        <JsonView value={METADATA} title="GET /v1/calls/:id" />
      </Spec>
      <Spec id="code-samples" name={tr("Code samples", "أمثلة الكود")} primitive="CodeBlock + Tabs" wide note={tr("Tabs per language with line numbers and light syntax colouring.", "تبويب لكل لغة مع أرقام الأسطر وتلوين خفيف.")}>
        <CodeBlock tabs={SNIPPETS(METADATA.id)} />
      </Spec>
      <Spec id="copy-id" name={tr("Copyable IDs", "معرّفات قابلة للنسخ")} primitive="CopyButton">
        <div className="stack">
          {[["Call ID", "معرّف المكالمة", METADATA.id], ["Assistant ID", "معرّف المساعد", METADATA.assistantId]].map(([en, ar, v]) => (
            <div key={v} className="copy-row"><span className="tv-desc">{tr(en, ar)}</span><code dir="ltr">{v}</code><CopyButton text={v} size="sm" onCopied={(ok) => ok || toast({ tone: "warning", title: tr("Couldn't copy", "تعذّر النسخ") })} /></div>
          ))}
        </div>
      </Spec>
    </>
  );
}
