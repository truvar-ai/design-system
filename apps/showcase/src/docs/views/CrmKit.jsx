"use client";
// Docs for the CRM kit: every piece on its own, live.
import { useState } from "react";
import {
  CHANNELS, ChannelBadge, ChannelIcon, ConversationList, MessageThread, Composer, AiAgentBar, useAiHandoff,
  ContactPanel, ActivityTimeline, PermissionMatrix, RoleList, CallSheet, ContactHeader, channelName, } from "../../ds.js";
import { useTr, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";
import { useCrmData } from "../crmData.jsx";

export function CrmKit() {
  const tr = useTr();
  const lang = useLang();
  const d = useCrmData();
  const [sel, setSel] = useState("c1");
  const [perms, setPerms] = useState(d.roles.find((r) => r.id === "manager").perms);
  const [role, setRole] = useState("manager");
  const [calling, setCalling] = useState(false);
  const handoff = useAiHandoff({ initial: "human", resumeAfter: 1 });
  const nadia = d.contacts[1];
  const sample = [
    ...d.messages.c1.slice(0, 2), d.messages.c1[4], d.messages.c1[5], d.messages.c1[6], d.messages.c1[7],
    d.messages.c2[1], d.messages.c4[0],
    { id: "k1", from: "agent", kind: "text", author: d.me.name, channel: "whatsapp", text: tr("Sent, waiting for delivery", "أُرسلت وتنتظر التسليم"), time: new Date(), status: "sent" },
    { id: "k2", from: "agent", kind: "text", author: d.me.name, channel: "whatsapp", text: tr("This one couldn't be delivered", "هذه لم تُرسل"), time: new Date(), status: "failed" },
  ];
  return (
    <>
      <ViewHeader viewId="crm-kit" intro={tr(
        "The pieces behind Conversations, Contacts and Team & roles, from @truvar-ai/design-system/crm. Use them together as <ConversationInbox> or one by one in your own layouts.",
        "المكونات وراء المحادثات وجهات الاتصال والفريق والأدوار، من @truvar-ai/design-system/crm. استخدمها معًا عبر <ConversationInbox> أو كلٌّ على حدة في تصميماتك.")} />

      <Spec id="channels" name={tr("Channels", "القنوات")} primitive="ChannelBadge · ChannelIcon · ChannelLabel" wide
        note={tr("Every channel a customer can write from. Brand marks are from Simple Icons (CC0); black marks follow the theme so they stay visible in dark mode.", "كل قناة يمكن للعميل التواصل منها. علامات العلامات التجارية من Simple Icons (رخصة CC0)، والعلامات السوداء تتبع الوضع لتبقى ظاهرة في الوضع الداكن.")}>
        <ul className="kit-channels">
          {CHANNELS.map((c) => <li key={c}><ChannelBadge channel={c} size={32} /><ChannelIcon channel={c} size={18} /><span>{channelName(c, lang)}</span></li>)}
        </ul>
      </Spec>

      <Spec id="conversation-list" name={tr("Conversation list", "قائمة المحادثات")} primitive="ConversationList (GridList)"
        note={tr("Avatar with the channel on its corner, unread count, who's handling it (AI agent or a person), and a waiting time that turns red past the SLA.", "صورة مع القناة على طرفها، وعدد غير المقروء، ومن يتولى المحادثة (الوكيل الذكي أو شخص)، ووقت الانتظار الذي يصبح أحمر بعد تجاوز المهلة.")}>
        <div className="kit-frame kit-list"><ConversationList items={d.conversations.slice(0, 4)} selectedId={sel} onSelect={setSel} /></div>
      </Spec>

      <Spec id="messages" name={tr("Messages", "الرسائل")} primitive="MessageThread · MessageBubble" wide
        note={tr("Text, photos, files, voice notes, calls, internal notes and events, each marked with the channel it came through. Receipts show sent, delivered and read.", "نصوص وصور وملفات ورسائل صوتية ومكالمات وملاحظات داخلية وأحداث، كلٌّ بقناته. وتظهر علامات الإرسال والتسليم والقراءة.")}>
        <div className="kit-frame kit-thread"><MessageThread messages={sample} label={nadia.name} /></div>
      </Spec>

      <Spec id="ai-handoff" name={tr("AI handoff", "التسليم بين الذكاء الاصطناعي والفريق")} primitive="AiAgentBar · useAiHandoff" wide
        note={tr("The AI agent answers until someone takes over. While a person handles it, a timer runs and restarts with every reply; if no one replies before it ends, the AI agent resumes. Set to 1 minute here so you can watch it.", "يرد الوكيل الذكي حتى يتولى أحد المحادثة. أثناء تولي شخص لها يعمل مؤقت يُعاد مع كل رد، وإن لم يرد أحد قبل انتهائه يستأنف الوكيل. مضبوط هنا على دقيقة لتشاهده.")}>
        <div className="kit-stack">
          <AiAgentBar mode={handoff.mode} minutes={handoff.minutes} remaining={handoff.remaining}
            onTakeOver={handoff.takeOver} onHandBack={handoff.handBack} onMinutesChange={handoff.setMinutes} />
          <span className="tv-desc">{handoff.mode === "ai" ? tr("Now: AI agent answering", "الآن: الوكيل الذكي يرد") : tr("Now: a person is handling it", "الآن: شخص يتولى المحادثة")}</span>
        </div>
      </Spec>

      <Spec id="composer" name={tr("Composer", "محرر الرد")} primitive="Composer" wide
        note={tr("Reply or leave an internal note. Pick the channel to answer on, add emoji, files and saved replies, or ask AI for a reply. Enter sends; Shift + Enter adds a line. When WhatsApp's 24-hour window has closed, it offers approved templates instead.", "رد أو اترك ملاحظة داخلية. اختر قناة الرد، وأضف رموزًا وملفات وردودًا محفوظة، أو اطلب ردًا من الذكاء الاصطناعي. Enter للإرسال وShift + Enter لسطر جديد. وعند انتهاء نافذة واتساب البالغة ٢٤ ساعة يعرض القوالب المعتمدة.")}>
        <div className="kit-stack">
          <Composer channels={["whatsapp", "instagram", "email"]} onSend={({ text }) => text} onSuggest={() => d.suggest(d.conversations[0])} savedReplies={d.savedReplies} />
          <Composer channels={["whatsapp"]} windowClosed templates={d.templates} />
        </div>
      </Spec>

      <Spec id="contact-panel" name={tr("Contact panel", "لوحة العميل")} primitive="ContactPanel"
        note={tr("Who they are, every channel they use, where they first came from, their deal and an AI summary. Sits beside the thread or opens as a drawer.", "من هو، وكل قنواته، ومن أين جاء أول مرة، وصفقته، وملخص بالذكاء الاصطناعي. بجانب المحادثة أو كلوحة جانبية.")}>
        <div className="kit-frame kit-panel"><ContactPanel contact={nadia} profileHref="#contact/1" onCall={() => setCalling(true)} /></div>
      </Spec>

      <Spec id="contact-header" name={tr("Contact header and call", "رأس ملف العميل والاتصال")} primitive="ContactHeader · CallSheet" wide
        note={tr("Message, call, email or book a meeting from the top of a record. Call rings, connects and logs the call.", "راسل أو اتصل أو أرسل بريدًا أو احجز اجتماعًا من أعلى الملف. الاتصال يرن ثم يتصل ويُسجَّل.")}>
        <div className="kit-frame kit-pad"><ContactHeader contact={nadia} onMessage={() => {}} onCall={() => setCalling(true)} onEmail={() => {}} /></div>
        <CallSheet isOpen={calling} onOpenChange={setCalling} contact={nadia} />
      </Spec>

      <Spec id="timeline" name={tr("Activity timeline", "سجل النشاط")} primitive="ActivityTimeline" wide
        note={tr("Everything that happened with a contact, newest first: messages, calls, meetings, notes, deal changes and AI actions. Filter by type or add a note.", "كل ما حدث مع العميل، الأحدث أولًا: رسائل ومكالمات واجتماعات وملاحظات وتغييرات الصفقة وإجراءات الذكاء الاصطناعي. صفِّ حسب النوع أو أضف ملاحظة.")}>
        <ActivityTimeline items={d.timelineFor(1)} onAddNote={() => {}} />
      </Spec>

      <Spec id="permissions" name={tr("Roles and permissions", "الأدوار والصلاحيات")} primitive="RoleList · PermissionMatrix" wide
        note={tr("What each role can view, create, edit, delete and export, and whose records: their own, their team's or everyone's. Giving any action also gives View. On narrow screens each row becomes a card.", "ما يمكن لكل دور عرضه وإنشاؤه وتعديله وحذفه وتصديره، ولمن: الخاصة به أو بفريقه أو للجميع. منح أي إجراء يمنح العرض تلقائيًا. على الشاشات الضيقة يصبح كل صف بطاقة.")}>
        <div className="kit-perm">
          <RoleList roles={d.roles.slice(0, 4)} selectedId={role} onSelect={(id) => { setRole(id); setPerms(d.roles.find((r) => r.id === id).perms); }} />
          <PermissionMatrix resources={d.resources} value={perms} onChange={setPerms} readOnly={d.roles.find((r) => r.id === role).system} />
        </div>
      </Spec>
    </>
  );
}
