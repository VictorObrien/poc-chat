/**
 * Store Zustand para gerenciar o fluxo de conversa guiada
 * para geração de imagens com Quick Actions
 */

import { create } from "zustand";
import type {
  QuickActionType,
  QuickActionConfig,
  ConversationFlowState,
} from "@/lib/types/fal";
import { getQuickActionConfig } from "@/lib/types/fal";

interface ConversationFlowActions {
  // Inicia um novo fluxo de conversa
  startFlow: (type: QuickActionType) => void;
  // Adiciona uma resposta do usuário
  addResponse: (key: string, value: string) => void;
  // Avança para a próxima etapa
  nextStep: () => void;
  // Define estado de geração
  setGenerating: (isGenerating: boolean) => void;
  // Define a URL da imagem gerada
  setGeneratedImage: (url: string | null) => void;
  // Define erro
  setError: (error: string | null) => void;
  // Reseta o fluxo
  resetFlow: () => void;
  // Obtém a pergunta atual
  getCurrentQuestion: () => string | null;
  // Obtém as opções da pergunta atual
  getCurrentOptions: () => string[] | undefined;
  // Verifica se o fluxo está completo
  isFlowComplete: () => boolean;
  // Obtém o prompt construído
  getBuiltPrompt: () => string;
}

type ConversationFlowStore = ConversationFlowState & ConversationFlowActions;

const initialState: ConversationFlowState = {
  activeFlow: null,
  actionConfig: null,
  responses: {},
  currentStep: 0,
  isGenerating: false,
  generatedImageUrl: null,
  error: null,
};

export const useConversationFlowStore = create<ConversationFlowStore>(
  (set, get) => ({
    ...initialState,

    startFlow: (type: QuickActionType) => {
      const config = getQuickActionConfig(type);
      if (!config || !config.isImageGeneration) {
        return;
      }

      set({
        activeFlow: type,
        actionConfig: config,
        responses: {},
        currentStep: 0,
        isGenerating: false,
        generatedImageUrl: null,
        error: null,
      });
    },

    addResponse: (key: string, value: string) => {
      set((state) => ({
        responses: {
          ...state.responses,
          [key]: value,
        },
      }));
    },

    nextStep: () => {
      set((state) => ({
        currentStep: state.currentStep + 1,
      }));
    },

    setGenerating: (isGenerating: boolean) => {
      set({ isGenerating });
    },

    setGeneratedImage: (url: string | null) => {
      set({ generatedImageUrl: url, isGenerating: false });
    },

    setError: (error: string | null) => {
      set({ error, isGenerating: false });
    },

    resetFlow: () => {
      set(initialState);
    },

    getCurrentQuestion: () => {
      const { actionConfig, currentStep } = get();
      if (!actionConfig || currentStep >= actionConfig.questions.length) {
        return null;
      }
      return actionConfig.questions[currentStep].question;
    },

    getCurrentOptions: () => {
      const { actionConfig, currentStep } = get();
      if (!actionConfig || currentStep >= actionConfig.questions.length) {
        return undefined;
      }
      return actionConfig.questions[currentStep].options;
    },

    isFlowComplete: () => {
      const { actionConfig, currentStep } = get();
      if (!actionConfig) return false;
      return currentStep >= actionConfig.questions.length;
    },

    getBuiltPrompt: () => {
      const { activeFlow, responses } = get();

      if (activeFlow === "instagram-image") {
        const format = responses.format?.toLowerCase() || "post";
        const description = responses.description || "";
        return `Imagem para Instagram ${format}: ${description}`;
      }

      if (activeFlow === "tiktok-image") {
        const description = responses.description || "";
        return `Thumbnail para vídeo do TikTok: ${description}`;
      }

      return responses.description || "";
    },
  })
);
