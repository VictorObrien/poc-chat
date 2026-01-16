"use client";

import { useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { GeneratedImage } from "./GeneratedImage";
import { ImageSkeleton } from "./ImageSkeleton";
import { useChatMessages } from "./hooks/useChatMessages";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useAutoScroll } from "./hooks/useAutoScroll";

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

  // Scroll automático no browser quando mensagens mudam
  useAutoScroll({
    dependencies: [
      messages.length,
      messages[messages.length - 1]?.id,
      generatedImageUrl,
      shouldShowSkeleton,
    ],
    smooth: true,
    delay: 150,
    onlyIfNearBottom: false, // Sempre faz scroll para novas mensagens
  });

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
        addSystemMessage(question, getCurrentOptions(), 0);
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
          addSystemMessage(nextQ.question, nextQ.options, nextQuestionIndex);
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
  // Para fluxo guiado: só mostra quando for a última pergunta (sem opções ou quando currentStep é o último)
  // Para conversa normal: mostra quando showInput é true
  // Para imagem gerada: sempre mostra para permitir modificações
  const shouldShowInput = (() => {
    // Se há imagem gerada, sempre mostra
    if (generatedImageUrl !== null) return true;

    // Se está em fluxo guiado
    if (activeFlow && actionConfig) {
      // Se o fluxo está completo, não mostra (vai gerar imagem)
      if (isFlowComplete()) return false;

      // Verifica se a pergunta atual é a última (sem opções = pergunta de descrição)
      const currentQuestion = actionConfig.questions[currentStep];
      const isLastQuestion = currentStep === actionConfig.questions.length - 1;
      const hasNoOptions =
        !currentQuestion?.options || currentQuestion.options.length === 0;

      // Mostra apenas se for a última pergunta (pergunta de descrição)
      return isLastQuestion && hasNoOptions;
    }

    // Para conversa normal, usa showInput
    return showInput;
  })();

  return (
    <div className="flex flex-col w-full">
      {/* Container de mensagens - sem scroll próprio, usa scroll do browser */}
      <div className="flex flex-col px-4 py-4 space-y-4">
        <MessageList
          messages={messages}
          onResend={resendMessage}
          onEdit={editMessage}
          onCopy={copyMessage}
          onOptionSelect={handleOptionSelect}
          currentQuestionIndex={
            activeFlow && actionConfig ? currentStep : undefined
          }
        />

        {/* Exibe imagem gerada */}
        {generatedImageUrl && (
          <div className="pb-4">
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
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
            <span>Pensando...</span>
          </div>
        )}

        {/* Erro do fluxo */}
        {flowError && (
          <div className="py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm px-4">
            Erro: {flowError}
          </div>
        )}

        {/* Erro do chat */}
        {error && (
          <div className="py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm px-4">
            Erro: {error.message}
          </div>
        )}

        {/* Espaçamento extra no final para garantir que o último item seja visível */}
        <div className="h-4" />
      </div>

      {/* Input na parte inferior */}
      {shouldShowInput && (
        <div className="px-4 pb-4 pt-2 bg-[#010336] border-t border-[#1a1a4a]/50">
          <ChatInput
            onSend={handleSend}
            disabled={isLoading || isGenerating}
            placeholder={getPlaceholder()}
          />
        </div>
      )}
    </div>
  );
}
