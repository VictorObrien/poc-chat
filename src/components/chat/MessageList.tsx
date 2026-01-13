"use client";

import { ChatBubble } from "./ChatBubble";
import { AssistantMessage } from "./AssistantMessage";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  role?: "user" | "assistant";
}

interface MessageListProps {
  messages: Message[];
  onResend?: (messageId: string) => void;
  onEdit?: (messageId: string, newMessage: string) => void;
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
      {messages.map((message) => {
        // Renderizar mensagens do assistente de forma diferente
        if (message.role === "assistant") {
          return (
            <AssistantMessage
              key={message.id}
              message={message.content}
              timestamp={message.timestamp}
              onCopy={() => onCopy?.(message.id)}
            />
          );
        }

        // Mensagens do usuário usam ChatBubble com todas as opções
        return (
          <ChatBubble
            key={message.id}
            message={message.content}
            timestamp={message.timestamp}
            onResend={() => onResend?.(message.id)}
            onEdit={(newMessage) => onEdit?.(message.id, newMessage)}
            onCopy={() => onCopy?.(message.id)}
          />
        );
      })}
    </div>
  );
}
