"use client";

import { useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { GeneratedImage } from "./GeneratedImage";
import { ImageSkeleton } from "./ImageSkeleton";
import { useChatMessages } from "./hooks/useChatMessages";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { Button } from "@/components/ui/button";

interface ChatSectionProps {
  onMessageSent?: (hasMessages: boolean) => void;
  showInput?: boolean;
}

export function ChatSection({
  onMessageSent,
  showInput = false,
}: ChatSectionProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    resendMessage,
    editMessage,
    copyMessage,
    addSystemMessage,
    addUserMessage,
    removeMessagesByContent,
    clearMessages,
  } = useChatMessages({ onMessageSent });

  const {
    activeFlow,
    actionConfig,
    currentStep,
    isGenerating,
    generatedImageUrl,
    error: flowError,
    getCurrentQuestion,
    getCurrentOptions,
    isFlowComplete,
    addResponse,
    nextStep,
    resetFlow,
    setGenerating,
  } = useConversationFlowStore();

  const { generateImage } = useImageGeneration();

  // Remover mensagem "Gerando sua imagem..." quando a imagem for gerada
  useEffect(() => {
    if (generatedImageUrl && !isGenerating) {
      removeMessagesByContent("Gerando sua imagem... 🎨");
      removeMessagesByContent("Gerando nova imagem... 🎨");
    }
  }, [generatedImageUrl, isGenerating, removeMessagesByContent]);

  // Quando o fluxo inicia, adiciona a primeira pergunta
  useEffect(() => {
    if (
      activeFlow &&
      actionConfig &&
      currentStep === 0 &&
      messages.length === 0
    ) {
      const question = getCurrentQuestion();
      if (question) {
        addSystemMessage(question, getCurrentOptions());
      }
    }
  }, [
    activeFlow,
    actionConfig,
    currentStep,
    messages.length,
    getCurrentQuestion,
    getCurrentOptions,
    addSystemMessage,
  ]);

  // Processa resposta do fluxo
  const processFlowResponse = useCallback(
    async (content: string, addAsUserMessage: boolean = true) => {
      if (!actionConfig) return;

      const currentQuestion = actionConfig.questions[currentStep];
      if (!currentQuestion) return;

      // Adiciona a resposta do usuário como mensagem (se não foi adicionada antes)
      if (addAsUserMessage) {
        addUserMessage(content);
      }

      // Armazena a resposta no store
      addResponse(currentQuestion.key, content);
      nextStep();

      // Verifica se há mais perguntas
      const nextQuestionIndex = currentStep + 1;
      if (nextQuestionIndex < actionConfig.questions.length) {
        // Adiciona próxima pergunta após um pequeno delay
        setTimeout(() => {
          const nextQ = actionConfig.questions[nextQuestionIndex];
          addSystemMessage(nextQ.question, nextQ.options);
        }, 500);
      } else {
        // Fluxo completo - gera a imagem
        setTimeout(async () => {
          addSystemMessage("Gerando sua imagem... 🎨");
          // Marcar como gerando no store ANTES de chamar generateImage
          // para que o skeleton apareça imediatamente
          setGenerating(true);
          await generateImage();
        }, 500);
      }
    },
    [
      actionConfig,
      currentStep,
      addResponse,
      nextStep,
      addSystemMessage,
      addUserMessage,
      generateImage,
      setGenerating,
    ]
  );

  // Handler para seleção de opção via botão
  const handleOptionSelect = useCallback(
    (option: string) => {
      // Adiciona a resposta do usuário e processa
      processFlowResponse(option, true);
    },
    [processFlowResponse]
  );

  // Handler principal de envio
  const handleSend = useCallback(
    (content: string) => {
      if (activeFlow && !isFlowComplete()) {
        // Está em fluxo guiado
        processFlowResponse(content, true);
      } else {
        // Conversa normal
        sendMessage(content);
      }
    },
    [activeFlow, isFlowComplete, processFlowResponse, sendMessage]
  );

  // Handler para nova geração
  const handleRegenerate = useCallback(async () => {
    addSystemMessage("Gerando nova imagem... 🎨");
    setGenerating(true);
    await generateImage();
  }, [addSystemMessage, generateImage, setGenerating]);

  // Handler para nova criação
  const handleNewCreation = useCallback(() => {
    resetFlow();
    clearMessages();
    onMessageSent?.(false);
  }, [resetFlow, clearMessages, onMessageSent]);

  // Placeholder dinâmico baseado no fluxo
  const getPlaceholder = () => {
    if (activeFlow && !isFlowComplete()) {
      const options = getCurrentOptions();
      if (options) {
        return `Digite ${options.join(" ou ")}...`;
      }
      return "Descreva sua imagem...";
    }
    return "Digite sua mensagem...";
  };

  // Determina se deve mostrar o input
  // Mostra quando showInput é true OU quando há imagem gerada (para permitir modificações)
  const shouldShowInput = showInput || generatedImageUrl !== null;

  // Verifica se existe mensagem "Gerando sua imagem..."
  const hasGeneratingMessage = messages.some(
    (msg) =>
      msg.content.includes("Gerando sua imagem") ||
      msg.content.includes("Gerando nova imagem")
  );

  // Mostra skeleton quando:
  // 1. Existe mensagem "Gerando sua imagem..." E não há imagem gerada ainda
  // 2. OU está gerando (isGenerating) E não há imagem gerada
  const shouldShowSkeleton = hasGeneratingMessage && !generatedImageUrl;

  return (
    <div className="flex flex-col gap-4 w-full">
      <MessageList
        messages={messages}
        onResend={resendMessage}
        onEdit={editMessage}
        onCopy={copyMessage}
        onOptionSelect={handleOptionSelect}
      />

      {/* Exibe imagem gerada */}
      {generatedImageUrl && (
        <div className="px-4">
          <GeneratedImage
            imageUrl={generatedImageUrl}
            isLoading={isGenerating}
            actionLabel={actionConfig?.label}
          />
        </div>
      )}

      {/* Skeleton durante geração - aparece quando há mensagem de geração ou isGenerating */}
      {shouldShowSkeleton && <ImageSkeleton />}

      {/* Loading de chat normal */}
      {isLoading && !activeFlow && (
        <div className="flex items-center gap-2 text-gray-400 text-sm px-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
          <span>Pensando...</span>
        </div>
      )}

      {/* Erro do fluxo */}
      {flowError && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Erro: {flowError}
        </div>
      )}

      {/* Erro do chat */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Erro: {error.message}
        </div>
      )}

      {/* Input - só mostra quando showInput é true e não há imagem gerada */}
      {shouldShowInput && (
        <ChatInput
          onSend={handleSend}
          disabled={isLoading || isGenerating}
          placeholder={getPlaceholder()}
        />
      )}
    </div>
  );
}
