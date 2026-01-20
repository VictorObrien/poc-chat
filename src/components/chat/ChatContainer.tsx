"use client";

import { useState, useCallback } from "react";
import { QuickActions } from "./QuickActions";
import { ChatSection } from "./ChatSection";
import { CustomizeActionModal } from "./CustomizeActionModal";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import {
  useCustomActionsStore,
  isCustomActionType,
  getCustomActionIdFromType,
} from "@/stores/customActionsStore";
import type { QuickActionType } from "@/lib/types/fal";
import { getQuickActionConfig } from "@/lib/types/fal";

export function ChatContainer() {
  const [hasMessages, setHasMessages] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const { startFlow, startCustomFlow, activeFlow, resetFlow } =
    useConversationFlowStore();
  const { getCustomActionConfig } = useCustomActionsStore();

  const handleActionSelect = useCallback(
    (actionType: string) => {
      // Verificar se é uma ação customizada
      if (isCustomActionType(actionType)) {
        const customId = getCustomActionIdFromType(actionType);
        if (customId) {
          const customConfig = getCustomActionConfig(customId);
          if (customConfig) {
            startCustomFlow(customConfig);
            setHasMessages(true);
            setIsChatMode(false);
            return;
          }
        }
        return;
      }

      // Ações padrão
      const config = getQuickActionConfig(actionType as QuickActionType);
      if (!config) return;

      if (config.isImageGeneration) {
        startFlow(actionType as QuickActionType);
        setHasMessages(true);
        setIsChatMode(false);
      } else if (actionType === "new-conversation") {
        resetFlow();
        setHasMessages(false);
        setIsChatMode(true);
      } else if (actionType === "personalize") {
        setIsCustomizeModalOpen(true);
      }
    },
    [startFlow, startCustomFlow, resetFlow, getCustomActionConfig]
  );

  const handleMessageSent = useCallback((hasMsgs: boolean) => {
    setHasMessages(hasMsgs);
  }, []);

  const handleCustomizeSuccess = useCallback(() => {
    // Opcional: fazer algo após criar uma Quick Action customizada
  }, []);

  const showQuickActions = !hasMessages && !activeFlow && !isChatMode;

  return (
    <div className="flex flex-col w-full">
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

      <CustomizeActionModal
        open={isCustomizeModalOpen}
        onOpenChange={setIsCustomizeModalOpen}
        onSuccess={handleCustomizeSuccess}
      />
    </div>
  );
}
