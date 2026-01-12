"use client";

import { useState } from "react";
import { QuickActions } from "./QuickActions";
import { ChatSection } from "./ChatSection";

export function ChatContainer() {
  const [hasMessages, setHasMessages] = useState(false);

  return (
    <>
      {/* Seção de Ações Rápidas - oculta quando há mensagens */}
      {!hasMessages && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl lg:text-4xl">
            O que gostaria de criar hoje?
          </h2>
          <QuickActions />
        </div>
      )}

      <ChatSection onMessageSent={setHasMessages} />
    </>
  );
}
