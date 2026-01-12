"use client";

import { ChatInput } from "./ChatInput";

export function ChatSection() {
  const handleSendMessage = async (message: string) => {
    // TODO: Implementar lógica de envio de mensagem
    // Aqui será integrado com TanStack Query e OpenRouter
    console.log("Mensagem enviada:", message);
  };

  return (
    <div className="flex flex-col gap-4">
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
