// Conversation workflow builder on React Flow (@xyflow/react, MIT), styled with Truvar tokens.
import React, { useCallback, useMemo, useState } from "react";
import * as RAC from "react-aria-components";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, Handle, Position, useNodesState, useEdgesState, addEdge,
  MarkerType, useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as Icon from "../icons/icons.jsx";
import { PromptEditor, TokenFieldValue, toast, Badge } from "../core/index.jsx";
import { JsonView } from "./CallDetails.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");
const useLang = () => (RAC.useLocale().locale.startsWith("ar") ? "ar" : "en");
const L = (lang, o) => (o && typeof o === "object" ? (lang === "ar" ? o.ar : o.en) : o);

const KIND = {
  start: { icon: Icon.Play, en: "Start call", ar: "بدء المكالمة" },
  say: { icon: Icon.Waves, en: "Say", ar: "قل" },
  api: { icon: Icon.Zap, en: "API request", ar: "طلب API" },
  condition: { icon: Icon.GitBranch, en: "Condition", ar: "شرط" },
  branch: { icon: null, en: "Branch", ar: "فرع" },
  transfer: { icon: Icon.Phone, en: "Transfer call", ar: "تحويل المكالمة" },
  end: { icon: Icon.PhoneOff, en: "End call", ar: "إنهاء المكالمة" },
};

/* text segments → preview with variable chips */
function SegmentsPreview({ segments, vars }) {
  const lang = useLang();
  return (
    <p className="wf-say-text" dir="auto">
      {segments.map((s, i) => s.type === "token"
        ? <span key={i} className="tv-token wf-token"><span className="tv-token-brace">{"{ }"}</span>{L(lang, vars.find((v) => v.id === s.value)?.label) ?? s.text}</span>
        : <React.Fragment key={i}>{s.text}</React.Fragment>)}
    </p>
  );
}

function NodeShell({ kind, selected, children, handles = "both", tone }) {
  const lang = useLang(); const k = KIND[kind]; const I = k.icon;
  return (
    <div className={cx("wf-node", `is-${kind}`, selected && "is-selected", tone && `tone-${tone}`)}>
      {handles !== "out" && <Handle type="target" position={Position.Top} className="wf-handle" />}
      <div className="wf-node-head">{I && <span className="wf-node-icon"><I /></span>}<span>{k[lang]}</span></div>
      {children && <div className="wf-node-body">{children}</div>}
      {handles !== "in" && <Handle type="source" position={Position.Bottom} className="wf-handle" />}
    </div>
  );
}
const nodeTypes = {
  start: ({ selected }) => {
    const lang = useLang();
    return <div className={cx("wf-pill is-start", selected && "is-selected")}><Icon.Play width={14} height={14} />{KIND.start[lang]}<Handle type="source" position={Position.Bottom} className="wf-handle" /></div>;
  },
  say: ({ data, selected }) => <NodeShell kind="say" selected={selected}><SegmentsPreview segments={data.segments} vars={data.vars} /></NodeShell>,
  api: ({ data, selected }) => <NodeShell kind="api" selected={selected}><code className="wf-api" dir="ltr"><b>{data.method}</b> {data.url}</code></NodeShell>,
  condition: ({ data, selected }) => {
    const lang = useLang();
    return <div className={cx("wf-pill is-condition", selected && "is-selected")}><Handle type="target" position={Position.Top} className="wf-handle" /><Icon.GitBranch width={14} height={14} />{KIND.condition[lang]}<Handle type="source" position={Position.Bottom} className="wf-handle" /></div>;
  },
  branch: ({ data, selected }) => {
    const lang = useLang();
    return <div className={cx("wf-pill is-branch", selected && "is-selected")}><Handle type="target" position={Position.Top} className="wf-handle" />{L(lang, data.label)}<Handle type="source" position={Position.Bottom} className="wf-handle" /></div>;
  },
  transfer: ({ data, selected }) => <NodeShell kind="transfer" selected={selected}><span dir="ltr" className="wf-mono">{data.number}</span></NodeShell>,
  end: ({ data, selected }) => { const lang = useLang(); return <NodeShell kind="end" selected={selected} handles="in"><span className="wf-muted">{L(lang, data.note)}</span></NodeShell>; },
};

const edgeDefaults = { type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, className: "wf-edge" };

export function initialFlow(vars, lang = "en") {
  const ar = lang === "ar";
  const seg = (arr) => arr;
  const nodes = [
    { id: "start", type: "start", position: { x: 390, y: 0 }, data: {} },
    { id: "lookup", type: "api", position: { x: 330, y: 80 }, data: { method: "GET", url: "/crm/contacts/{phone}", saveAs: "contact" } },
    { id: "greet", type: "say", position: { x: 310, y: 200 }, data: { mode: "prompt", vars, segments: seg([
      ...(ar ? [
      { type: "text", text: "مرحبًا " }, { type: "token", text: "الاسم الأول", value: "first_name" }, { type: "text", text: "، معك " },
      { type: "token", text: "اسم الوكيل", value: "agent" }, { type: "text", text: " من " }, { type: "token", text: "الشركة", value: "company" },
      { type: "text", text: ". هل الوقت مناسب لتأكيد موعدك؟" }] : [
      { type: "text", text: "Hi " }, { type: "token", text: "First name", value: "first_name" }, { type: "text", text: ", this is " },
      { type: "token", text: "Agent name", value: "agent" }, { type: "text", text: " from " }, { type: "token", text: "Company", value: "company" },
      { type: "text", text: ". Is now a good time to confirm your appointment?" }])]) } },
    { id: "cond", type: "condition", position: { x: 380, y: 380 }, data: {} },
    { id: "yes", type: "branch", position: { x: 90, y: 470 }, data: { label: { en: "A: Confirms", ar: "أ: يؤكد" } } },
    { id: "no", type: "branch", position: { x: 370, y: 470 }, data: { label: { en: "B: Reschedule", ar: "ب: إعادة جدولة" } } },
    { id: "human", type: "branch", position: { x: 660, y: 470 }, data: { label: { en: "C: Wants a person", ar: "ج: يريد موظفًا" } } },
    { id: "book", type: "api", position: { x: 20, y: 560 }, data: { method: "POST", url: "/calendar/confirm", saveAs: "booking" } },
    { id: "offer", type: "say", position: { x: 300, y: 560 }, data: { mode: "exact", vars, segments: seg([{ type: "text", text: ar ? "يمكنني أن أعرض الأحد العاشرة صباحًا أو الاثنين الثانية ظهرًا. أيهما يناسبك؟" : "I can offer Sunday at 10 am or Monday at 2 pm. Which suits you?" }]) } },
    { id: "transfer", type: "transfer", position: { x: 610, y: 560 }, data: { number: "+20 2 2345 6789" } },
    { id: "end", type: "end", position: { x: 150, y: 720 }, data: { note: { en: "Send a WhatsApp confirmation", ar: "أرسل تأكيدًا عبر واتساب" } } },
  ];
  const e = (s, t, label) => ({ id: `${s}-${t}`, source: s, target: t, label, ...edgeDefaults });
  const edges = [e("start", "lookup"), e("lookup", "greet"), e("greet", "cond"), e("cond", "yes"), e("cond", "no"), e("cond", "human"),
    e("yes", "book"), e("no", "offer"), e("human", "transfer"), e("book", "end"), e("offer", "end")];
  return { nodes, edges };
}

const WT = {
  en: { name: "Appointment confirmation", env: "Environment", staging: "Staging", production: "Production", valid: "No issues", code: "Code", test: "Test call",
    publish: "Publish", add: "Add node", variables: "Variables", global: "Global prompt", inspector: "Node settings", pick: "Select a node to edit it.",
    prompt: "Prompt", exact: "Exact words", say: "What to say", method: "Method", url: "URL", saveAs: "Save response as", number: "Transfer to",
    label: "Branch condition", note: "After the call", del: "Delete node", published: "Published to production", publishedSub: "New calls use this version now.",
    sayHelp: "Prompt: the agent says something like this. Exact: word for word.", flowJson: "Workflow JSON", close: "Close", canvas: "Workflow canvas" },
  ar: { name: "تأكيد المواعيد", env: "البيئة", staging: "تجريبية", production: "الإنتاج", valid: "لا توجد مشكلات", code: "الكود", test: "مكالمة تجريبية",
    publish: "نشر", add: "إضافة عقدة", variables: "المتغيرات", global: "الأمر العام", inspector: "إعدادات العقدة", pick: "اختر عقدة لتعديلها.",
    prompt: "أمر", exact: "كلمات حرفية", say: "ماذا يقول", method: "الطريقة", url: "الرابط", saveAs: "حفظ الاستجابة باسم", number: "التحويل إلى",
    label: "شرط الفرع", note: "بعد المكالمة", del: "حذف العقدة", published: "تم النشر في الإنتاج", publishedSub: "تستخدم المكالمات الجديدة هذه النسخة الآن.",
    sayHelp: "أمر: يقول الوكيل شيئًا مشابهًا. حرفي: كلمة بكلمة.", flowJson: "JSON سير العمل", close: "إغلاق", canvas: "لوحة سير العمل" },
};

function Inspector({ node, update, remove, vars }) {
  const lang = useLang(); const t = WT[lang];
  const tokenValue = useMemo(() => node?.type === "say" ? new TokenFieldValue(node.data.segments) : null, [node?.id]);
  const [tv, setTv] = useState(tokenValue);
  React.useEffect(() => setTv(tokenValue), [tokenValue]);
  if (!node) return <div className="wf-inspector is-empty"><Icon.Cursor /><p className="tv-desc">{t.pick}</p></div>;
  const k = KIND[node.type]; const I = k.icon;
  return (
    <div className="wf-inspector">
      <div className="wf-inspector-head">
        <span className="wf-node-icon">{I ? <I /> : <Icon.GitBranch />}</span><b>{k[lang]}</b>
        <RAC.TooltipTrigger delay={300}>
          <RAC.Button className="tv-icon-btn" aria-label={t.del} onPress={() => remove(node.id)} isDisabled={node.type === "start"} style={{ marginInlineStart: "auto" }}><Icon.Trash /></RAC.Button>
          <RAC.Tooltip className="tv-tooltip" offset={6}>{t.del}</RAC.Tooltip>
        </RAC.TooltipTrigger>
      </div>
      {node.type === "say" && tv && (
        <>
          <RAC.ToggleButtonGroup aria-label={t.say} selectionMode="single" disallowEmptySelection selectedKeys={[node.data.mode]}
            onSelectionChange={(k2) => update(node.id, { mode: [...k2][0] })} className="tv-segmented tv-segmented--sm">
            {["prompt", "exact"].map((m) => <RAC.ToggleButton key={m} id={m} className="tv-segment-btn"><RAC.SelectionIndicator className="tv-segment-indicator" /><span className="tv-segment-label">{t[m]}</span></RAC.ToggleButton>)}
          </RAC.ToggleButtonGroup>
          <PromptEditor label={t.say} variables={vars} value={tv} description={t.sayHelp}
            onChange={(v) => { setTv(v); update(node.id, { segments: v.segments.map((s) => ({ ...s })) }); }} />
        </>
      )}
      {node.type === "api" && (
        <>
          <RAC.Select selectedKey={node.data.method} onSelectionChange={(m) => update(node.id, { method: m })} className="tv-field">
            <RAC.Label className="tv-label">{t.method}</RAC.Label>
            <RAC.Button className="tv-select-btn"><RAC.SelectValue /><Icon.ChevronDown /></RAC.Button>
            <RAC.Popover className="tv-popover" offset={6}><RAC.ListBox className="tv-listbox">{["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <RAC.ListBoxItem key={m} id={m} className="tv-item">{m}<Icon.Check className="tv-check-icon" /></RAC.ListBoxItem>)}</RAC.ListBox></RAC.Popover>
          </RAC.Select>
          <RAC.TextField value={node.data.url} onChange={(v) => update(node.id, { url: v })} className="tv-field"><RAC.Label className="tv-label">{t.url}</RAC.Label><RAC.Input className="tv-input" dir="ltr" /></RAC.TextField>
          <RAC.TextField value={node.data.saveAs} onChange={(v) => update(node.id, { saveAs: v })} className="tv-field"><RAC.Label className="tv-label">{t.saveAs}</RAC.Label><RAC.Input className="tv-input" dir="ltr" /></RAC.TextField>
        </>
      )}
      {node.type === "branch" && (
        <RAC.TextField value={L(lang, node.data.label)} onChange={(v) => update(node.id, { label: { en: v, ar: v } })} className="tv-field"><RAC.Label className="tv-label">{t.label}</RAC.Label><RAC.Input className="tv-input" dir="auto" /></RAC.TextField>
      )}
      {node.type === "transfer" && (
        <RAC.TextField value={node.data.number} onChange={(v) => update(node.id, { number: v })} className="tv-field"><RAC.Label className="tv-label">{t.number}</RAC.Label><RAC.Input className="tv-input" dir="ltr" type="tel" /></RAC.TextField>
      )}
      {node.type === "end" && (
        <RAC.TextField value={L(lang, node.data.note)} onChange={(v) => update(node.id, { note: { en: v, ar: v } })} className="tv-field"><RAC.Label className="tv-label">{t.note}</RAC.Label><RAC.Input className="tv-input" dir="auto" /></RAC.TextField>
      )}
      {(node.type === "start" || node.type === "condition") && <p className="tv-desc">{node.type === "start" ? (lang === "ar" ? "تبدأ كل مكالمة من هنا." : "Every call starts here.") : (lang === "ar" ? "يختار الفرع حسب رد المتصل." : "Picks a branch from what the caller says.")}</p>}
    </div>
  );
}

function Builder({ vars, height }) {
  const lang = useLang(); const t = WT[lang];
  const init = useMemo(() => initialFlow(vars, lang), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(init.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(init.edges);
  const [env, setEnv] = useState("staging");
  const [codeOpen, setCodeOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const rf = useReactFlow();
  const selected = nodes.find((n) => n.selected);
  const onConnect = useCallback((c) => setEdges((es) => addEdge({ ...c, ...edgeDefaults }, es)), []);
  const update = (id, patch) => setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  const remove = (id) => { setNodes((ns) => ns.filter((n) => n.id !== id)); setEdges((es) => es.filter((e) => e.source !== id && e.target !== id)); };
  const add = (type) => {
    const id = `${type}-${Date.now().toString(36)}`;
    const center = rf.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const data = { say: { mode: "prompt", vars, segments: [{ type: "text", text: lang === "ar" ? "اكتب ما يقوله الوكيل…" : "Write what the agent says…" }] },
      api: { method: "POST", url: "/webhook", saveAs: "result" }, condition: {}, branch: { label: { en: "New branch", ar: "فرع جديد" } },
      transfer: { number: "+20 " }, end: { note: { en: "", ar: "" } } }[type];
    setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), { id, type, position: center, data, selected: true }]);
  };
  const flowJson = { name: t.name, environment: env, nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position: { x: Math.round(position.x), y: Math.round(position.y) }, data: { ...data, vars: undefined } })), edges: edges.map(({ id, source, target }) => ({ id, source, target })) };

  return (
    <div className="wf" style={{ height }}>
      <div className="wf-top">
        <div className="wf-top-start">
          <span className="wf-flow-icon"><Icon.Phone /></span>
          <b className="wf-name">{t.name}</b>
          <RAC.Select selectedKey={env} onSelectionChange={setEnv} aria-label={t.env} className="tv-miniselect">
            <RAC.Button className={cx("wf-env", `is-${env}`)}><span className="wf-env-dot" /><RAC.SelectValue /><Icon.ChevronDown width={14} height={14} /></RAC.Button>
            <RAC.Popover className="tv-popover" offset={6}><RAC.ListBox className="tv-listbox">
              <RAC.ListBoxItem id="staging" textValue={t.staging} className="tv-item">{t.staging}<Icon.Check className="tv-check-icon" /></RAC.ListBoxItem>
              <RAC.ListBoxItem id="production" textValue={t.production} className="tv-item">{t.production}<Icon.Check className="tv-check-icon" /></RAC.ListBoxItem>
            </RAC.ListBox></RAC.Popover>
          </RAC.Select>
        </div>
        <div className="wf-top-end">
          <span className="wf-valid"><Icon.CheckCircle width={16} height={16} />{t.valid}</span>
          <RAC.Button className="tv-btn tv-btn--ghost tv-btn--sm" onPress={() => setCodeOpen(true)}><Icon.Code />{t.code}</RAC.Button>
          <RAC.Button className="tv-btn tv-btn--secondary tv-btn--sm" onPress={() => toast({ tone: "info", title: t.test, description: lang === "ar" ? "افتح «مكالمة مباشرة» لتجربة الوكيل." : "Open Live call to try the agent." })}><Icon.Play width={14} height={14} />{t.test}</RAC.Button>
          <RAC.Button className="tv-btn tv-btn--primary tv-btn--sm" onPress={() => setConfirm(true)}><Icon.Rocket />{t.publish}</RAC.Button>
        </div>
      </div>
      <div className="wf-main">
        <div className="wf-canvas" dir="ltr">
          <div className="wf-floating">
            <RAC.MenuTrigger>
              <RAC.Button className="tv-btn tv-btn--secondary tv-btn--sm"><Icon.Plus />{t.add}</RAC.Button>
              <RAC.Popover className="tv-popover" offset={6}><RAC.Menu className="tv-listbox" onAction={add}>
                {["say", "api", "condition", "branch", "transfer", "end"].map((k) => { const I = KIND[k].icon || Icon.GitBranch; return <RAC.MenuItem key={k} id={k} textValue={KIND[k][lang]} className="tv-item"><I />{KIND[k][lang]}</RAC.MenuItem>; })}
              </RAC.Menu></RAC.Popover>
            </RAC.MenuTrigger>
            <RAC.Button className="tv-btn tv-btn--secondary tv-btn--sm"><Icon.Braces />{t.variables}<Badge tone="neutral">{vars.length}</Badge></RAC.Button>
          </div>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
            nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.15 }} minZoom={0.4} maxZoom={1.8} proOptions={{ hideAttribution: true }}
            aria-label={t.canvas} deleteKeyCode={["Backspace", "Delete"]}>
            <Background gap={18} size={1.4} color="var(--border-strong)" className="wf-bg" />
            <Controls showInteractive={false} className="wf-controls" />
            <MiniMap pannable zoomable className="wf-minimap" style={{ width: 150, height: 100 }} nodeColor={(n) => (n.type === "say" ? "var(--chart-1)" : n.type === "api" ? "var(--chart-3)" : "var(--chart-2)")} maskColor="color-mix(in srgb, var(--surface) 70%, transparent)" />
          </ReactFlow>
        </div>
        <aside className="wf-side" aria-label={t.inspector}>
          <p className="wf-side-title">{t.inspector}</p>
          <Inspector node={selected} update={update} remove={remove} vars={vars} />
        </aside>
      </div>
      <RAC.ModalOverlay isOpen={codeOpen} onOpenChange={setCodeOpen} isDismissable className="tv-overlay">
        <RAC.Modal className="tv-modal tv-modal--full"><RAC.Dialog className="tv-dialog" aria-label={t.flowJson}>
          {({ close }) => (<><div className="tv-player-modal-head"><RAC.Heading slot="title" className="tv-drawer-title">{t.flowJson}</RAC.Heading><RAC.Button className="tv-icon-btn" aria-label={t.close} onPress={close}><Icon.X /></RAC.Button></div><JsonView value={flowJson} title="workflow.json" maxHeight={460} /></>)}
        </RAC.Dialog></RAC.Modal>
      </RAC.ModalOverlay>
      <RAC.ModalOverlay isOpen={confirm} onOpenChange={setConfirm} isDismissable className="tv-overlay">
        <RAC.Modal className="tv-modal"><RAC.Dialog className="tv-dialog" role="alertdialog">
          {({ close }) => (<>
            <div className="tv-dialog-icon is-primary"><Icon.Rocket /></div>
            <RAC.Heading slot="title">{lang === "ar" ? `نشر «${t.name}» في الإنتاج؟` : `Publish “${t.name}” to production?`}</RAC.Heading>
            <p className="tv-dialog-body">{lang === "ar" ? "ستستخدم المكالمات الجديدة هذه النسخة فورًا. المكالمات الجارية لن تتأثر." : "New calls will use this version right away. Calls in progress aren't affected."}</p>
            <div className="tv-dialog-actions">
              <RAC.Button className="tv-btn tv-btn--ghost" onPress={close}>{lang === "ar" ? "إلغاء" : "Cancel"}</RAC.Button>
              <RAC.Button className="tv-btn tv-btn--primary" onPress={() => { setEnv("production"); close(); toast({ tone: "success", title: t.published, description: t.publishedSub }); }}><Icon.Rocket />{t.publish}</RAC.Button>
            </div>
          </>)}
        </RAC.Dialog></RAC.Modal>
      </RAC.ModalOverlay>
    </div>
  );
}

export function WorkflowBuilder({ vars, height = 680 }) {
  return <ReactFlowProvider><Builder vars={vars} height={height} /></ReactFlowProvider>;
}
