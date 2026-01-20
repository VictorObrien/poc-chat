/**
 * Hook para gerenciar a geração de imagens com fal.ai
 * Usa o novo sistema de 7 perguntas para construir prompts otimizados
 * Suporta ações padrão e customizadas
 */

import { useCallback, useState } from "react";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import type { QuickActionType } from "@/lib/types/fal";
import { buildFinalPrompt } from "@/lib/types/fal";

interface UseImageGenerationReturn {
  isGenerating: boolean;
  generatedImageUrl: string | null;
  error: string | null;
  generateImage: () => Promise<void>;
  resetGeneration: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const {
    setGeneratedImage,
    setError: setStoreError,
    setGenerating,
  } = useConversationFlowStore();

  const generateImage = useCallback(async () => {
    // Obter estado mais recente diretamente do store (evita problema de closure)
    const { activeFlow, responses, actionConfig, getBuiltPrompt } =
      useConversationFlowStore.getState();

    if (!activeFlow) {
      setError("Nenhum fluxo ativo");
      return;
    }

    // Verificar se tem respostas suficientes
    const hasResponses = Object.keys(responses).length > 0;
    if (!hasResponses) {
      setError("Responda as perguntas para gerar a imagem");
      return;
    }

    setIsGenerating(true);
    setGenerating(true); // Atualizar store também
    setError(null);
    setGeneratedImageUrl(null);

    try {
      // Verificar se é ação customizada
      const isCustomAction = activeFlow.startsWith("custom-");

      // Construir prompt final
      let finalPrompt: string;

      if (isCustomAction) {
        // Para ações customizadas, usa o getBuiltPrompt do store
        finalPrompt = getBuiltPrompt();
      } else {
        // Para ações padrão, usa o buildFinalPrompt com todos os mapeamentos
        finalPrompt = buildFinalPrompt(
          activeFlow as QuickActionType,
          responses
        );
      }

      // Preparar corpo da requisição
      const requestBody: Record<string, unknown> = {
        prompt: finalPrompt,
        actionType: activeFlow,
        // Passar tipo de publicação para determinar dimensões
        tipoPublicacao: responses.tipo_publicacao,
      };

      // Para ações customizadas, incluir o modelo da configuração
      if (isCustomAction && actionConfig?.model) {
        requestBody.model = actionConfig.model;
      }

      const response = await fetch("/api/fal/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar imagem");
      }

      const data = await response.json();

      setGeneratedImageUrl(data.imageUrl);
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerating(false); // Atualizar store também
    }
  }, [setGeneratedImage, setStoreError, setGenerating]);

  const resetGeneration = useCallback(() => {
    setGeneratedImageUrl(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    generatedImageUrl,
    error,
    generateImage,
    resetGeneration,
  };
}
