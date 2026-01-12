"use client";

import { ChatBubble } from "./ChatBubble";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  onResend?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
}

export function MessageList({
  messages,
  onResend,
  onEdit,
  onCopy,
}: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message.content}
          timestamp={message.timestamp}
          onResend={() => onResend?.(message.id)}
          onEdit={() => onEdit?.(message.id)}
          onCopy={() => onCopy?.(message.id)}
        />
      ))}
    </div>
  );
}
