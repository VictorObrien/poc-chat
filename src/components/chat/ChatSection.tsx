"use client";

import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList, type Message } from "./MessageList";

export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (message: string) => {
    // TODO: Implementar lógica de envio de mensagem
    // Aqui será integrado com TanStack Query e OpenRouter
    console.log("Mensagem enviada:", message);

    // Adicionar mensagem à lista
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleResend = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      handleSendMessage(message.content);
    }
  };

  const handleEdit = (messageId: string, newMessage: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: newMessage, timestamp: new Date() }
          : msg
      )
    );
  };

  const handleCopy = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <MessageList
        messages={messages}
        onResend={handleResend}
        onEdit={handleEdit}
        onCopy={handleCopy}
      />
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
