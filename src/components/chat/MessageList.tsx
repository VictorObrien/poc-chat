"use client";

import { ChatBubble } from "./ChatBubble";
import { AssistantMessage } from "./AssistantMessage";
import { SystemMessage } from "./SystemMessage";
import { GeneratedImage } from "./GeneratedImage";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  role?: "user" | "assistant" | "system";
  options?: string[]; // Opções para mensagens do sistema (ex: ["Story", "Post"])
  questionIndex?: number; // Índice da pergunta no fluxo (para identificar qual está ativa)
  imageUrl?: string; // URL da imagem gerada (para mensagens com imagem)
}

interface MessageListProps {
  messages: Message[];
  onResend?: (messageId: string) => void;
  onEdit?: (messageId: string, newMessage: string) => void;
  onCopy?: (messageId: string) => void;
  onOptionSelect?: (option: string) => void;
  currentQuestionIndex?: number; // Índice da pergunta atual no fluxo
}

export function MessageList({
  messages,
  onResend,
  onEdit,
  onCopy,
  onOptionSelect,
  currentQuestionIndex,
}: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {messages.map((message) => {
        // Renderizar mensagens do sistema (fluxo guiado)
        if (message.role === "system") {
          const isActive =
            currentQuestionIndex !== undefined &&
            message.questionIndex !== undefined &&
            message.questionIndex === currentQuestionIndex;
          return (
            <SystemMessage
              key={message.id}
              message={message.content}
              timestamp={message.timestamp}
              options={message.options}
              onOptionSelect={onOptionSelect}
              isActive={isActive}
            />
          );
        }

        // Renderizar mensagens do assistente
        if (message.role === "assistant") {
          // Se a mensagem tem imagem, renderiza o componente de imagem
          if (message.imageUrl) {
            return (
              <div key={message.id} className="flex flex-col gap-2">
                <GeneratedImage
                  imageUrl={message.imageUrl}
                  actionLabel={message.content || "Imagem"}
                />
              </div>
            );
          }
          
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
