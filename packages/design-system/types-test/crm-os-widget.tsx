import * as React from "react";
import {
  CHANNELS, ChannelBadge, ChannelIcon, ChannelLabel, ChannelAvatar, ConversationList, ConversationInbox, MessageThread, MessageBubble,
  Composer, AiAgentBar, useAiHandoff, ContactPanel, ActivityTimeline, PermissionMatrix, RoleList, CallSheet, ContactHeader,
  PropertyList, PipelineBoard, EventCalendar, channelName, useChannelName, useCrm, aiStart, aiTakeOver, aiHandBack, aiTouch,
  aiSetMinutes, RESUME_OPTIONS, PERMISSION_ACTIONS, PERMISSION_SCOPES, CALENDAR_VIEWS, ConversationItemContent,
} from "@truvar-ai/design-system/crm";
import type {
  ChannelId, Conversation, Message, MessageStatus, Contact, TeamMember, SavedReply, MessageTemplate, PermissionValue,
  PermissionResource, Role, ActivityItem, PipelineStage, PipelineDeal, CalendarEvent, PropertyItem, ComposerSendPayload,
  UseAiHandoffResult, AiHandoffState, PermissionAction, PermissionScope,
} from "@truvar-ai/design-system/crm";
import {
  SystemBar, VoiceDock, ListeningView, AgentTaskCard, ApprovalCard, DoneCard, NotificationCard, NotificationStack, OSTaskCard,
  AppWindow, AgentCursor, DeviceCard, SmartTile, PermissionRow, LockScreen, useNow, formatDay, formatTime, WifiIcon, BatteryIcon,
  CloudIcon, MicIcon, LaptopIcon, ShieldIcon,
} from "@truvar-ai/design-system/os";
import type { SystemBarLabels, AgentStep } from "@truvar-ai/design-system/os";
import {
  WebWidget, WidgetScope, AgentSteps, SlotPicker, WidgetApproval, InlineForm, ChoiceCards, ResultCard, WidgetItem, WidgetCall,
  WidgetThread, WidgetHome, WidgetComposer, WidgetLauncher, WidgetTeaser, AgentAvatar, onAccent, useWidget,
} from "@truvar-ai/design-system/widget";
import type { WidgetThreadItem, WidgetCallState, WidgetAgent, WidgetSlotSelection, WidgetActionArgs } from "@truvar-ai/design-system/widget";

/* ---------------- CRM: sample data ---------------- */
const ago = (min: number) => new Date(Date.now() - min * 60000);
const team: TeamMember[] = [{ id: "amira", name: "Amira Hassan" }, { id: "omar", name: "Omar Farouk" }];
const me = team[0]!;

const contacts: Record<number, Contact> = {
  1: {
    id: 1, name: "Nadia Kamel", title: "Head of Operations", company: "Nile Foods", email: "nadia@nilefoods.com", phone: "+20 100 234 5678",
    location: "Cairo, Egypt", language: "Egyptian Arabic",
    identities: [{ channel: "whatsapp", handle: "+20 100 234 5678" }, { channel: "instagram", handle: "@nadia.kamel" }],
    source: { channel: "instagram", label: "Instagram ad", campaign: "Ramadan 2026", date: ago(60 * 24 * 36) },
    deal: { name: "Nile Foods: Growth plan", stage: "Proposal sent", tone: "warning", value: "EGP 54K", owner: "Amira Hassan" },
    stage: { label: "Proposal sent", tone: "warning" }, tags: ["VIP", "Arabic voice"],
    history: [{ id: "h1", channel: "email", title: "Pricing question", time: ago(60 * 24 * 9) }],
    summary: "Wants Arabic voice for 3 branches.",
  },
};

const conversations: Conversation[] = [
  { id: "c1", contact: { id: 1, name: "Nadia Kamel" }, channel: "whatsapp", time: ago(3), lastFrom: "contact", preview: "Can we start with 2 branches?",
    unread: 2, status: "open", assignee: me, ai: "human", priority: "high", tags: ["VIP"] },
  { id: "c2", contact: { id: 2, name: "Tarek Saleh" }, channel: "email", time: ago(240), lastFrom: "agent", preview: "Any update on the terms?",
    unread: 1, status: "open", assignee: team[1], ai: "human", sla: { label: "Waiting 4 h", overdue: true } },
  { id: "c12", contact: { id: 12, name: "Sherif Lotfy" }, channel: "whatsapp", time: ago(2880), lastFrom: "ai", preview: "Sure Sherif", status: "snoozed",
    assignee: null, windowClosed: true },
];

const status: MessageStatus = "read";
const messages: Record<string, Message[]> = {
  c1: [
    { id: "m1", from: "contact", kind: "text", text: "Hi! Do you support Arabic voice calls?", channel: "whatsapp", time: ago(60 * 26) },
    { id: "m2", from: "ai", kind: "text", text: "Yes. How many branches would use it?", channel: "whatsapp", time: ago(60 * 25), status: "delivered" },
    { id: "m3", from: "system", kind: "event", text: "Demo booked for Tuesday, 11 am", time: ago(60 * 25 - 2) },
    { id: "m4", from: "contact", kind: "image", text: "Our call volume", channel: "whatsapp", time: ago(45), image: { alt: "Screenshot: calls per day chart" } },
    { id: "m5", from: "contact", kind: "voice", channel: "whatsapp", time: ago(44), voice: { duration: "0:42" } },
    { id: "m6", from: "agent", kind: "note", author: me.name, text: "She's ready to sign.", time: ago(40) },
    { id: "m7", from: "contact", kind: "file", channel: "email", time: ago(30), file: { name: "feedback.pdf", size: "248 KB" } },
    { id: "m8", from: "contact", kind: "call", channel: "phone", time: ago(20), call: { title: "Incoming call", duration: "4:12", outcome: "Answered by AI" } },
    { id: "m9", from: "agent", kind: "text", author: me.name, channel: "whatsapp", text: "Sent", time: new Date(), status },
  ],
  c2: [],
};

const savedReplies: SavedReply[] = [{ id: "price", title: "Price list", text: "Here's our price list: truvar.ai/pricing." }];
const templates: MessageTemplate[] = [{ id: "followup", title: "Follow-up on your quote", text: "Hi {{name}}, following up on your quote." }];

function suggest(c: Conversation): Promise<string> {
  return new Promise((res) => setTimeout(() => res(`Thanks ${c.contact.name.split(" ")[0]}!`), 900));
}

/* ---------------- CRM: components ---------------- */
export function InboxPage({ id }: { id?: string }) {
  const [call, setCall] = React.useState<Contact | null>(null);
  return (
    <>
      <ConversationInbox conversations={conversations} messages={messages} contacts={contacts} team={team} me={me}
        savedReplies={savedReplies} templates={templates} onSuggest={(c) => suggest(c)} initialId={id}
        profileHref={(c) => "#contact/" + c.id}
        onOpenChange={(cid) => history.replaceState(null, "", "#conversations/" + cid)}
        onViewChange={(v) => document.documentElement.toggleAttribute("data-chat-open", v === "thread")}
        onCall={(c) => setCall(c)} onEmail={(c) => console.log(c.email)}
        onSend={({ conversationId, text, channel }) => console.log(conversationId, text, channel)} aiResumeAfter={15} />
      <CallSheet isOpen={!!call} onOpenChange={(o) => !o && setCall(null)} contact={call}
        onEnd={(seconds) => console.log(seconds.toFixed(0))} />
    </>
  );
}

export function KitPieces() {
  const [sel, setSel] = React.useState("c1");
  const [calling, setCalling] = React.useState(false);
  const [role, setRole] = React.useState("manager");
  const handoff: UseAiHandoffResult = useAiHandoff({ initial: "human", resumeAfter: 1, onChange: (m, why) => console.log(m, why) });
  const nadia = contacts[1]!;
  const crm = useCrm();
  const nameOf = useChannelName();
  const ch: ChannelId = "whatsapp";
  const sample: Message[] = [...messages.c1!.slice(0, 2),
    { id: "k2", from: "agent", kind: "text", author: me.name, channel: "whatsapp", text: "This one couldn't be delivered", time: new Date(), status: "failed" }];

  const resources: PermissionResource[] = [
    { id: "contacts", group: "CRM", label: "Contacts" },
    { id: "calls", group: "Engagement", label: "Calls and recordings", actions: ["view", "create", "delete", "export"] },
    { id: "billing", group: "Workspace", label: "Billing", actions: ["view", "edit"], scoped: false },
  ];
  const roles: Role[] = [
    { id: "owner", name: "Owner", description: "Everything", members: 1, system: true, tone: "accent" },
    { id: "manager", name: "Sales manager", description: "Their team's records", members: 2, tone: "navy" },
  ];
  const [perms, setPerms] = React.useState<PermissionValue>({
    contacts: { actions: ["view", "create"], scope: "team" }, calls: { actions: ["view"], scope: "own" }, billing: { actions: [], scope: "all" },
  });
  const timeline: ActivityItem[] = [
    { id: "t1", type: "ai", title: "AI agent qualified the lead", body: nadia.summary, time: ago(60 * 26) },
    { id: "t2", type: "message", channel: "whatsapp", title: "Message from Nadia", body: "Hello", time: ago(5) },
  ];
  const about: PropertyItem[] = [
    { id: "email", label: "Email", value: nadia.email, ltr: true, type: "email" },
    { id: "owner", label: "Owner", value: nadia.deal?.owner, editable: false },
  ];

  return (
    <div>
      <ul>{CHANNELS.map((c) => <li key={c}><ChannelBadge channel={c} size={32} /><ChannelIcon channel={c} size={18} label={nameOf(c)} /><ChannelLabel channel={c} /><span>{channelName(c, crm.lang)}</span></li>)}</ul>
      <ChannelAvatar avatar={<span>N</span>} channel={ch} size={44} />
      <ConversationList items={conversations} selectedId={sel} onSelect={setSel} />
      <ConversationList items={conversations} selecting selectedKeys={new Set(["c1"])} onSelectionChange={(k) => console.log(k === "all" ? "all" : k.size)} label="Bulk" />
      {conversations[0] && <ConversationItemContent c={conversations[0]} />}
      <MessageThread messages={sample} label={nadia.name} onRetry={(m) => console.log(m.id)} />
      <MessageBubble m={sample[0]!} showAuthor={false} />
      <AiAgentBar mode={handoff.mode} minutes={handoff.minutes} remaining={handoff.remaining}
        onTakeOver={handoff.takeOver} onHandBack={handoff.handBack} onMinutesChange={handoff.setMinutes} options={RESUME_OPTIONS} />
      <Composer channels={["whatsapp", "instagram", "email"]} onSend={({ text, mode, channel, files, template }: ComposerSendPayload) => `${text}${mode}${channel}${files?.length}${template}`}
        onSuggest={() => suggest(conversations[0]!)} savedReplies={savedReplies} />
      <Composer channels={["whatsapp"]} windowClosed templates={templates} onChannelChange={(c) => console.log(c)} />
      <ContactPanel contact={nadia} profileHref="#contact/1" onCall={() => setCalling(true)} onClose={() => {}} />
      <ContactPanel contact={null} />
      <ContactHeader contact={nadia} onMessage={() => {}} onCall={() => setCalling(true)} onEmail={() => {}} />
      <ContactHeader layout="sidebar" contact={nadia} onNote={() => {}} onMeeting={() => {}} extra={<b>x</b>} />
      <CallSheet isOpen={calling} onOpenChange={setCalling} contact={nadia} />
      <PropertyList title="About this contact" items={about} onSave={(v) => console.log(v.email)} />
      <ActivityTimeline items={timeline} onAddNote={(n) => console.log(n)} labels={{ note: "Notes" }} />
      <RoleList roles={roles} selectedId={role} onSelect={(rid) => setRole(rid)} />
      <PermissionMatrix resources={resources} value={perms} onChange={setPerms} readOnly={false} actions={PERMISSION_ACTIONS} />
      <span>{PERMISSION_SCOPES.join()}{CALENDAR_VIEWS.join()}</span>
    </div>
  );
}

// Generic board and calendar keep your own fields
interface MyDeal extends PipelineDeal { contactId: number }
interface MyEvent extends CalendarEvent { notes?: string }

export function Planning() {
  const stages: PipelineStage[] = [
    { id: "lead", label: "New lead", tone: "neutral", probability: 10 },
    { id: "won", label: "Won", tone: "success", probability: 100 },
  ];
  const [deals, setDeals] = React.useState<MyDeal[]>([
    { id: "d1", stage: "lead", title: "Growth plan", company: "Nile Foods", value: 54000, contact: { name: "Nadia" }, owner: { name: "Amira Hassan" }, closeDate: new Date(), contactId: 1 },
  ]);
  const [events] = React.useState<MyEvent[]>([{ id: "e1", title: "Demo", start: new Date(), end: new Date(), type: "demo", notes: "n" }]);
  const [date, setDate] = React.useState(() => new Date());
  return (
    <>
      <PipelineBoard stages={stages} deals={deals} format={(v) => v.toFixed(0)} label="Pipeline"
        onChange={(next, info) => { setDeals(next); console.log(info.ids, info.to); }}
        onOpen={(d) => { location.hash = "contact/" + d.contactId; }} onAdd={(s) => console.log(s.id)} />
      <EventCalendar events={events} types={{ demo: { label: "Demos", tone: "violet" } }} date={date} onDateChange={setDate}
        onSelectSlot={(start, end) => console.log(start, end)} onSelectEvent={(e) => console.log(e.notes)} view="week" onViewChange={(v) => console.log(v)} />
    </>
  );
}

const handoffState: AiHandoffState = aiSetMinutes(aiTouch(aiHandBack(aiTakeOver(aiStart("ai", null)))), 5);
const action: PermissionAction = "view";
const scope: PermissionScope = "all";
console.log(handoffState.resumeAt, action, scope);

/* ---------------- OS ---------------- */
const sys: SystemBarLabels = {
  assistant: "Taysir", status: "System status", micOn: "Mic on", cameraOn: "Camera on", devices: "Connected devices",
  cloud: { synced: "Cloud synced", syncing: "Syncing", offline: "Offline" }, wifi: "Wi-Fi", battery: "Battery", charging: "charging",
};
const dock = { dock: "Taysir dock", apps: "All apps", keyboard: "Type instead" };
const listen = { listening: "Listening…", hint: "Done?", run: "Run", cancel: "Cancel", privacy: "Your voice stays on this device." };
const task = { watch: "Watch it", stop: "Stop", status: { done: "done", active: "in progress", pending: "not started", approval: "needs your OK" } };
const approval = { approve: "Yes, send it", approveHint: "or say “Send”", deny: "No, wait", denyHint: "or say “No”", listening: "Taysir is listening", edit: "Edit the message" };
const lock = { locked: "Locked", faceUnlock: "Look at the camera", password: "or type your password", passwordLabel: "Password", unlock: "Unlock", wifi: "Wi-Fi", battery: "Battery" };

export function OSDemo() {
  const now = useNow();
  const [tile, setTile] = React.useState(true);
  const [val, setVal] = React.useState<"auto" | "ask" | "never">("ask");
  const steps: AgentStep[] = [
    { label: "Found Khaled's email", status: "done" }, { label: "Writing the quote", status: "active" }, { label: "Waiting for your OK", status: "approval" },
  ];
  return (
    <div>
      <SystemBar user="Abdelrahman" time={now} devices={7} mic battery={{ level: 0.86 }} wifi={3} cloud="syncing" labels={sys} onAssistant={() => {}} />
      <SystemBar time={now} devices={2} camera mic battery={{ level: 0.12, charging: true }} wifi={1} cloud="offline" labels={sys} />
      <VoiceDock state="listening" label="Listening…" labels={dock} onTalk={() => {}} onApps={() => {}} onKeyboard={() => {}} />
      <ListeningView heard="Prepare a quote" partial="once I approve" labels={listen} onRun={() => {}} onCancel={() => {}} />
      <AgentTaskCard title="Preparing your quote" subtitle="For Al Nour" footnote="Carry on." labels={task} steps={steps} onWatch={() => {}} onStop={() => {}} />
      <ApprovalCard title="Send the quote to Khaled?" subtitle="On WhatsApp" recipient={{ name: "Khaled Mostafa", org: "Al Nour Trading" }}
        attachment={{ type: "PDF", name: "Quote-AlNour" }} message="Hello Mr Khaled" labels={approval} onApprove={() => {}} onDeny={() => {}} onEdit={() => {}} />
      <DoneCard title="Khaled accepted" subtitle="He replied" labels={{}}
        followUp={{ question: "Shall I create the invoice?", yes: "Yes", later: "Later", voiceHint: "or say “Yes”", onYes: () => {}, onLater: () => {} }}
        stats={[{ label: "Tasks done today", value: 5 }, { label: "Apps you had to open", value: 0, highlight: true }]} />
      <LockScreen user="Abdelrahman" time={now} battery={{ level: 0.86 }} wifi={3} device="Terra 1 Pro" labels={{ ...lock, ...sys }} onUnlock={() => {}}
        notifications={<NotificationStack restLabel="and 7 more" rest={7}
          lead={<NotificationCard tone="gold" icon={<MicIcon size={16} />} title="Quote ready" body="Ready for your OK." meta="Taysir · 7 am" onOpen={() => {}} />}
          icons={[{ icon: <ShieldIcon />, count: "3" }, { icon: <LaptopIcon />, count: 1 }]} />} />
      <OSTaskCard title="November cohort" status="Running · 2 steps left" tone="running" highlight action="Open" onAction={() => {}} icon={<CloudIcon />} headingLevel={2} />
      <AppWindow title="Sheet" icon={<MicIcon size={16} />} badge="Taysir is typing" active>
        <AgentCursor x="38%" y={80} label="Taysir" />
      </AppWindow>
      <DeviceCard icon={<LaptopIcon />} tone="navy" name="Office laptop" meta="Windows · connected" command="Open the sales report" action="Open its screen" onAction={() => {}} />
      <SmartTile icon={<WifiIcon strength={2} />} label="Lights" onLabel="On" offLabel="Off" isSelected={tile} onChange={setTile} />
      <PermissionRow icon={<BatteryIcon level={0.5} charging label="Battery" />} label="Send emails and messages" description="Ask me first" sensitive value={val}
        onChange={setVal} options={[{ id: "auto", label: "On its own" }, { id: "ask", label: "Ask me first" }, { id: "never", label: "Never" }]} />
      <span>{formatDay(now, "en-US")}{formatTime(now, "ar-EG")}</span>
    </div>
  );
}

/* ---------------- Widget ---------------- */
const agent: WidgetAgent = { name: "Layla", status: "online", subtitle: "Replies instantly" };

export function WidgetDemo() {
  const w = useWidget();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"home" | "chat" | "call">("home");
  const [slot, setSlot] = React.useState<WidgetSlotSelection | null>(null);
  const [approvalState, setApprovalState] = React.useState<"pending" | "confirmed" | "cancelled">("pending");
  const [form, setForm] = React.useState<Record<string, string> | null>(null);
  const [call, setCall] = React.useState<WidgetCallState>({ state: "live", elapsed: 42, speaker: "agent", captions: [{ from: "visitor", text: "Is Wednesday evening free?" }] });
  const [items, setItems] = React.useState<WidgetThreadItem[]>([
    { id: "a", from: "agent", type: "text", text: "Hello!", time: new Date() },
    { id: "v1", type: "voice", from: "visitor", duration: 9, transcript: "Do you have anything tomorrow?" },
    { id: "f1", type: "file", from: "visitor", name: "x-ray.pdf", size: "820 KB" },
    { id: "h1", type: "text", from: "human", author: { name: "Mona Adel", role: "Front desk" }, text: "One moment" },
    { id: "s1", type: "steps", steps: [{ label: "Checking calendar", state: "done" }, { label: "Finding gaps", state: "running", detail: "45 min" }, { label: "Holding", state: "pending" }] },
    { id: "e1", type: "event", text: "Mona Adel joined", icon: <b>!</b> },
    { id: "c1", type: "call", duration: 72, summary: "Booked a check-up." },
    { id: "r1", type: "rating" },
    { id: "res", type: "result", title: "You're booked!", rows: [["Booking", "#ND-4821"]], actions: [{ id: "cal", label: "Add to calendar" }] },
  ]);
  const days = [1, 2, 3].map((i) => ({ id: "d" + i, weekday: "Mon", date: String(i), slots: [{ id: "10", label: "10:00 AM" }, { id: "13", label: "1:00 PM" }] }));

  const onItemAction = (...args: WidgetActionArgs) => {
    const [item, act, payload] = args;
    if (item.type === "slots" && act === "pick") setSlot(payload as WidgetSlotSelection);
    if (item.type === "rating" && act === "rate") setItems((x) => x.map((it) => (it.id === item.id ? { ...it, value: payload as number } as WidgetThreadItem : it)));
  };

  return (
    <div>
      <WebWidget isOpen={open} onOpenChange={setOpen} view={view} onViewChange={setView} agent={agent} business={{ name: "Nile Dental" }}
        team={[{ name: "Mona Adel", avatar: "https://example.com/a.jpg" }]} accent="#0f6e5c" position="end" launcher="label" launcherText="Ask us"
        teaser="Need a dentist this week?" onTeaserDismiss={() => {}} unread={2} greeting="Hi there" subtitle="How can we help today?"
        homeActions={[{ id: "book", label: "Book an appointment", description: "See open times", icon: <b>c</b> }]} onHomeAction={(id) => console.log(id)}
        recent="Yes, 6:00 PM is open" items={items} typing="Mona Adel" suggestions={["Anything in the evening?"]}
        onSend={(t) => setItems((x) => [...x, { id: "n" + x.length, from: "visitor", text: t, status: "read" }])}
        onVoiceNote={({ duration }) => console.log(duration)} onAttach={(files) => console.log(files.length)} onItemAction={onItemAction}
        features={{ voiceNotes: true, call: false, attachments: true }} call={call} onCallStart={() => {}} onCallEnd={() => {}}
        onCallMute={(m) => setCall((c) => ({ ...c, muted: m }))} onCallSpeaker={(s) => setCall((c) => ({ ...c, loud: s }))}
        menuItems={[{ id: "new", label: "Start a new chat", icon: <b>+</b> }]} onMenuAction={(id) => console.log(id)} poweredBy={null} contained layout="phone" />
      <WidgetScope accent="#6d3fd6" className="wdg-block" style={{ padding: 8 }}>
        <AgentSteps item={{ steps: [{ label: "Checking", state: "done" }, { label: "Finding", state: "running" }] }} />
        <SlotPicker item={{ days, selected: slot }} onAction={(_, __, p) => setSlot(p)} />
        <WidgetApproval item={{ title: "Book this appointment?", state: approvalState, rows: [["Service", "Check-up"], ["When", undefined]], confirmLabel: "Confirm booking" }}
          onAction={(_, a) => setApprovalState(a === "confirm" ? "confirmed" : "cancelled")} />
        <InlineForm item={{ title: "Your details", submitted: form, fields: [{ name: "name", label: "Full name", required: true, autoComplete: "name" }, { name: "phone", label: "Mobile", type: "phone", required: true, country: "EG" }, { name: "mail", label: "Email", type: "email" }] }}
          onAction={(_, __, v) => setForm(v)} />
        <ChoiceCards item={{ cards: [{ id: "a", icon: <b>s</b>, title: "Cleaning", subtitle: "45 min", price: "EGP 600" }], selected: null }}
          onAction={(_, __, card) => console.log(card.title)} />
        <ResultCard item={{ title: "You're booked!", tone: "danger", rows: [["Booking", "#ND-4821"]], actions: [{ id: "cal", label: "Add to calendar", icon: <b>c</b> }] }} onAction={(_, a) => console.log(a)} />
        <div className="tvw-row is-out"><WidgetItem item={{ id: "v1", type: "voice", from: "visitor", duration: 9, transcript: "Hello" }} /></div>
        <WidgetCall agent={agent} call={call} onMuteChange={(m) => setCall((c) => ({ ...c, muted: m }))} onSpeakerChange={(s) => setCall((c) => ({ ...c, loud: s }))}
          onEnd={() => setCall((c) => ({ ...c, state: "ended", speaker: null }))} onBack={() => setCall((c) => ({ ...c, state: "live" }))} />
        <WidgetThread items={items} agent={agent} typing onAction={onItemAction} />
        <WidgetHome agent={agent} business={{ name: "Nile Dental", logo: "https://example.com/l.png" }} actions={[{ id: "x", label: "X" }]} onAction={(id) => console.log(id)}
          onAsk={() => {}} onCall={() => {}} recent="Hi" onRecent={() => {}} team={[{ name: "Mona" }]} />
        <WidgetComposer onSend={(t) => console.log(t)} onVoiceNote={(n) => console.log(n.duration)} onAttach={(f) => console.log(f.length)} suggestions={["Yes"]}
          onSuggestion={(s) => console.log(s)} isPhone inputRef={React.createRef<HTMLTextAreaElement>()} />
        <WidgetLauncher isOpen={false} unread={3} variant="label" text="Ask us" onPress={() => {}} />
        <WidgetTeaser agent={agent} text="Hi" onOpen={() => {}} onDismiss={() => {}} />
        <AgentAvatar agent={agent} size={20} status="away" active />
      </WidgetScope>
      <span>{w.t.rating[0]}{w.clock(65)}{onAccent("#0f6e5c")}</span>
    </div>
  );
}
