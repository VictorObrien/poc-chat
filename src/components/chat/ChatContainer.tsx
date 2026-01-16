"use client";

import { useState, useCallback } from "react";
import { QuickActions } from "./QuickActions";
import { ChatSection } from "./ChatSection";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import type { QuickActionType } from "@/lib/types/fal";
import { getQuickActionConfig } from "@/lib/types/fal";

export function ChatContainer() {
  const [hasMessages, setHasMessages] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false); // Modo de chat ativo (Nova Conversa)
  const { startFlow, activeFlow, resetFlow } = useConversationFlowStore();

  const handleActionSelect = useCallback(
    (actionType: QuickActionType) => {
      const config = getQuickActionConfig(actionType);

      if (!config) return;

      // Se for geração de imagem, inicia o fluxo guiado
      if (config.isImageGeneration) {
        startFlow(actionType);
        setHasMessages(true); // Esconde QuickActions ao iniciar fluxo
        setIsChatMode(false); // Não é modo chat normal
      } else if (actionType === "new-conversation") {
        // Nova conversa: esconde QuickActions e mostra ChatInput
        resetFlow();
        setHasMessages(false);
        setIsChatMode(true); // Ativa modo de chat
      }
      // Outras ações podem ser tratadas aqui futuramente
    },
    [startFlow, resetFlow]
  );

  const handleMessageSent = useCallback((hasMsgs: boolean) => {
    setHasMessages(hasMsgs);
  }, []);

  // Mostrar QuickActions apenas quando não há mensagens, não há fluxo ativo e não está no modo chat
  const showQuickActions = !hasMessages && !activeFlow && !isChatMode;

  return (
    <div className="flex flex-col w-full">
      {/* Seção de Ações Rápidas - oculta quando há mensagens, fluxo ativo ou modo chat */}
      {showQuickActions && (
        <div className="flex flex-col gap-6 animate-in fade-in justify-center min-h-[calc(100vh-8rem)]">
          <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl lg:text-4xl">
            O que gostaria de criar hoje?
          </h2>
          <QuickActions onActionSelect={handleActionSelect} />
        </div>
      )}

      <ChatSection
        onMessageSent={handleMessageSent}
        showInput={isChatMode || activeFlow !== null || hasMessages}
      />
    </div>
  );
}
