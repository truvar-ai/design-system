// The TypeScript example from the package README, kept here so it can't go stale.
import { Button, type ButtonProps } from "@truvar-ai/design-system";
import type { Conversation, Message, ChannelId } from "@truvar-ai/design-system/crm";

export const channel: ChannelId = "whatsapp";
export type Thread = { conversation: Conversation; messages: Message[] };

export function ReplyButton(props: ButtonProps) {
  return <Button variant="secondary" {...props} />;
}
