// Things the types must reject. Each @ts-expect-error fails the check if the line below it stops being an error.
import { ChannelBadge, Composer, MessageBubble, PermissionMatrix, useAiHandoff } from "@truvar-ai/design-system/crm";
import type { Message } from "@truvar-ai/design-system/crm";
import { SystemBar } from "@truvar-ai/design-system/os";
import { WebWidget } from "@truvar-ai/design-system/widget";

// @ts-expect-error unknown channel
export const a = <ChannelBadge channel="myspace" />;
// @ts-expect-error a file message needs its file
export const b = <MessageBubble m={{ id: "1", from: "contact", kind: "file", time: new Date() }} />;
// @ts-expect-error no such payload field
export const c = <Composer onSend={(p) => p.nope} />;
// @ts-expect-error a voice message needs its voice data and a string id
export const m: Message = { id: 1, from: "ai", kind: "voice", time: new Date(), voice: { duration: 3 } };
// @ts-expect-error unknown permission action
export const d = <PermissionMatrix resources={[]} value={{ x: { actions: ["fly"], scope: "own" } }} />;
// @ts-expect-error unknown AI mode
export const e = useAiHandoff({ initial: "robot" });
// @ts-expect-error wifi strength is 0 to 3
export const f = <SystemBar time={new Date()} wifi={5} labels={{} as never} />;
// @ts-expect-error the widget needs an agent
export const g = <WebWidget />;
// @ts-expect-error position is start or end
export const h = <WebWidget agent={{ name: "x" }} position="top" />;
