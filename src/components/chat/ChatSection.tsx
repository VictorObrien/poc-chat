"use client";

import { useEffect, useCallback, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { ImageSkeleton } from "./ImageSkeleton";
import { useChatMessages } from "./hooks/useChatMessages";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { useChatAPI } from "@/hooks/useChatAPI";
import { buildConversationHistory } from "./utils/chat";

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
    addAssistantMessage,
    addImageMessage,
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
    getBuiltPrompt,
  } = useConversationFlowStore();

  const { generateImage } = useImageGeneration();
  
  // Ref para rastrear o ID da mensagem de texto sendo gerada
  // Usamos ref ao invés de state para evitar problemas de stale closure nos callbacks
  const generatingTextMessageIdRef = useRef<string | null>(null);
  
  // Ref para rastrear a última URL de imagem adicionada ao chat (evita duplicatas)
  const lastAddedImageUrlRef = useRef<string | null>(null);
  
  const { sendMessage: sendChatMessage } = useChatAPI({
    onStream: (text) => {
      // Atualizar mensagem do assistente em tempo real
      const messageId = generatingTextMessageIdRef.current;
      if (messageId) {
        editMessage(messageId, text);
      }
    },
    onFinish: (text) => {
      // Garantir que a mensagem final está salva
      const messageId = generatingTextMessageIdRef.current;
      if (messageId) {
        editMessage(messageId, text);
      }
      generatingTextMessageIdRef.current = null;
      setGenerating(false);
    },
    onError: (error) => {
      const messageId = generatingTextMessageIdRef.current;
      if (messageId) {
        editMessage(messageId, `Erro ao gerar texto: ${error.message}`);
      } else {
        addSystemMessage(`Erro ao gerar texto: ${error.message}`);
      }
      generatingTextMessageIdRef.current = null;
      setGenerating(false);
    },
  });

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

  // Quando a imagem for gerada, adiciona ao chat e remove mensagem "Gerando..."
  useEffect(() => {
    if (generatedImageUrl && !isGenerating) {
      // Remover mensagens de geração
      removeMessagesByContent("Gerando sua imagem... 🎨");
      removeMessagesByContent("Gerando nova imagem... 🎨");
      removeMessagesByContent("Gerando nova imagem com as modificações... 🎨");
      
      // Adicionar imagem ao chat se for uma nova imagem
      if (generatedImageUrl !== lastAddedImageUrlRef.current) {
        addImageMessage(generatedImageUrl, actionConfig?.label || "Imagem gerada");
        lastAddedImageUrlRef.current = generatedImageUrl;
      }
    }
  }, [generatedImageUrl, isGenerating, removeMessagesByContent, addImageMessage, actionConfig?.label]);

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

  // Função para gerar texto (copy-writing)
  const generateText = useCallback(async () => {
    const prompt = getBuiltPrompt();
    
    // Construir prompt mais detalhado para copy-writing
    const copyPrompt = `Você é um especialista em copywriting publicitário. Crie um texto publicitário persuasivo e envolvente baseado nas seguintes informações:

${prompt}

Gere um copy publicitário completo, incluindo:
- Título impactante
- Texto principal persuasivo
- Call-to-action claro

Formate a resposta de forma clara e profissional.`;

    setGenerating(true);
    
    // Criar mensagem inicial do assistente que será atualizada com o stream
    const messageId = addAssistantMessage("Gerando seu copy publicitário... ✍️");
    generatingTextMessageIdRef.current = messageId;
    
    await sendChatMessage({
      message: copyPrompt,
      conversationHistory: [],
    });
  }, [getBuiltPrompt, sendChatMessage, setGenerating, addAssistantMessage]);

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
        // Fluxo completo - gera imagem ou texto dependendo do tipo
        setTimeout(async () => {
          // Verificar se é copy-writing
          if (actionConfig.workType === "copy-writing") {
            await generateText();
          } else {
            // Gera imagem para outros tipos
            addSystemMessage("Gerando sua imagem... 🎨");
            setGenerating(true);
            await generateImage();
          }
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
      generateText,
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
    async (content: string) => {
      if (activeFlow && !isFlowComplete()) {
        // Está em fluxo guiado
        processFlowResponse(content, true);
      } else if (activeFlow && isFlowComplete() && actionConfig?.workType === "copy-writing") {
        // Solicitar modificação de texto gerado
        addUserMessage(content);
        
        // Buscar texto original (primeira resposta do assistente que não seja "Gerando..." ou "Modificando...")
        const originalText = messages
          .filter(m => m.role === "assistant")
          .filter(m => !m.content.includes("Gerando") && !m.content.includes("Modificando"))
          .find(() => true)?.content || "";
        
        // Histórico limitado: apenas últimas 4 mensagens (2 modificações recentes)
        // Isso economiza tokens mantendo o contexto das modificações mais recentes
        const relevantMessages = messages.filter(
          m => (m.role === "user" || m.role === "assistant") &&
               !m.content.includes("Gerando") &&
               !m.content.includes("Modificando")
        );
        
        const MAX_RECENT_MESSAGES = 4; // Apenas últimas 2 modificações
        const recentMessages = relevantMessages.slice(-MAX_RECENT_MESSAGES);
        const conversationHistory = buildConversationHistory(recentMessages.slice(0, -1));
        
        // Construir mensagens com system message (texto original) + histórico limitado
        // System message economiza tokens ao incluir contexto uma vez ao invés de repetir
        const messagesWithContext: typeof conversationHistory = [
          {
            role: "system",
            content: originalText
              ? `Você é um especialista em copywriting publicitário. O texto original gerado foi:\n\n"${originalText}"\n\nAplique as modificações solicitadas pelo usuário mantendo o contexto, tema e estrutura do texto original.`
              : "Você é um especialista em copywriting publicitário."
          },
          ...conversationHistory
        ];

        setGenerating(true);
        
        // Criar mensagem do assistente para atualizar com o stream
        const messageId = addAssistantMessage("Modificando seu copy publicitário... ✍️");
        generatingTextMessageIdRef.current = messageId;
        
        // Enviar apenas a solicitação do usuário, o histórico já contém o contexto completo
        await sendChatMessage({
          message: content,
          conversationHistory: messagesWithContext,
        });
      } else if (activeFlow && isFlowComplete() && generatedImageUrl && actionConfig?.isImageGeneration) {
        // Solicitar modificação de imagem gerada
        addUserMessage(content);
        
        // Obter estado atual do store para pegar a descrição existente
        const currentState = useConversationFlowStore.getState();
        const existingDescription = currentState.responses.description || "";
        
        // Atualizar a resposta "description" com a modificação solicitada
        // Se já existe uma description, adiciona a modificação. Se não, cria uma nova.
        const updatedDescription = existingDescription 
          ? `${existingDescription}. ${content}`
          : content;
        
        // Adicionar/atualizar a resposta de descrição
        addResponse("description", updatedDescription);
        
        setGenerating(true);
        addSystemMessage("Gerando nova imagem com as modificações... 🎨");
        
        // Gerar nova imagem com o prompt atualizado
        await generateImage();
      } else {
        // Conversa normal
        sendMessage(content);
      }
    },
    [activeFlow, isFlowComplete, processFlowResponse, sendMessage, actionConfig, addUserMessage, addAssistantMessage, sendChatMessage, setGenerating, messages, generatedImageUrl, addResponse, addSystemMessage, generateImage]
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
    if (activeFlow && actionConfig) {
      // Se o fluxo está completo e não está gerando
      if (isFlowComplete() && !isGenerating) {
        if (actionConfig.workType === "copy-writing") {
          return "Solicite modificações no texto...";
        }
        return "Solicite modificações na imagem...";
      }
      
      // Durante o fluxo
      if (!isFlowComplete()) {
        const options = getCurrentOptions();
        if (options) {
          return `Digite ${options.join(" ou ")}...`;
        }
        if (actionConfig.workType === "copy-writing") {
          return "Descreva o que você precisa...";
        }
        return "Descreva sua imagem...";
      }
    }
    return "Digite sua mensagem...";
  };

  // Determina se deve mostrar o input
  // Para fluxo guiado: só mostra quando for a última pergunta (sem opções ou quando currentStep é o último)
  // Para conversa normal: mostra quando showInput é true
  // Para imagem gerada: sempre mostra para permitir modificações
  // Para texto gerado: mostra após conclusão para permitir modificações
  const shouldShowInput = (() => {
    // Se há imagem gerada, sempre mostra
    if (generatedImageUrl !== null) return true;

    // Se está em fluxo guiado
    if (activeFlow && actionConfig) {
      // Se o fluxo está completo
      if (isFlowComplete()) {
        // Se ainda está gerando, não mostra
        if (isGenerating) return false;
        
        // Se é copy-writing e terminou de gerar, mostra para permitir modificações
        if (actionConfig.workType === "copy-writing") return true;
        
        // Para outros tipos (como imagem), não mostra aqui (será mostrado pela condição de generatedImageUrl)
        return false;
      }

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

        {/* Imagens agora são exibidas dentro do MessageList como mensagens persistidas */}

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
