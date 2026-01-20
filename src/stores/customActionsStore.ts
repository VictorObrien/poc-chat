/**
 * Store Zustand para gerenciar Quick Actions customizadas
 * Usa localStorage para persistência
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CustomQuickAction,
  CustomField,
  WorkType,
} from "@/lib/types/custom-actions";
import {
  generateId,
  generateFieldKey,
  WORK_TYPE_MODELS,
} from "@/lib/types/custom-actions";
import type { QuickActionConfig, ConversationQuestion } from "@/lib/types/fal";

interface CustomActionsState {
  customActions: CustomQuickAction[];
  isLoading: boolean;
  error: string | null;
}

interface CustomActionsActions {
  // CRUD
  createCustomAction: (
    action: Omit<CustomQuickAction, "id" | "createdAt" | "updatedAt">
  ) => string;
  updateCustomAction: (
    id: string,
    updates: Partial<Omit<CustomQuickAction, "id" | "createdAt">>
  ) => void;
  deleteCustomAction: (id: string) => void;

  // Getters
  getCustomActionById: (id: string) => CustomQuickAction | undefined;
  getCustomActionConfig: (id: string) => QuickActionConfig | undefined;

  // Estado
  setError: (error: string | null) => void;
  clearError: () => void;
}

type CustomActionsStore = CustomActionsState & CustomActionsActions;

export const useCustomActionsStore = create<CustomActionsStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      customActions: [],
      isLoading: false,
      error: null,

      // Criar nova ação customizada
      createCustomAction: (action) => {
        const id = generateId();
        const now = Date.now();

        const newAction: CustomQuickAction = {
          ...action,
          id,
          createdAt: now,
          updatedAt: now,
          // Garantir que cada campo tem um key único
          fields: action.fields.map((field, index) => ({
            ...field,
            id: field.id || generateId(),
            key: generateFieldKey(field.question, index),
          })),
        };

        set((state) => ({
          customActions: [...state.customActions, newAction],
          error: null,
        }));

        return id;
      },

      // Atualizar ação existente
      updateCustomAction: (id, updates) => {
        set((state) => ({
          customActions: state.customActions.map((action) =>
            action.id === id
              ? {
                  ...action,
                  ...updates,
                  updatedAt: Date.now(),
                }
              : action
          ),
          error: null,
        }));
      },

      // Deletar ação
      deleteCustomAction: (id) => {
        set((state) => ({
          customActions: state.customActions.filter(
            (action) => action.id !== id
          ),
          error: null,
        }));
      },

      // Buscar ação por ID
      getCustomActionById: (id) => {
        return get().customActions.find((action) => action.id === id);
      },

      // Converter ação customizada para QuickActionConfig (compatível com o sistema existente)
      getCustomActionConfig: (id) => {
        const action = get().customActions.find((a) => a.id === id);
        if (!action) return undefined;

        // Converter CustomField[] para ConversationQuestion[]
        const questions: ConversationQuestion[] = action.fields.map(
          (field) => ({
            key: field.key,
            question: field.question,
            options: field.options,
          })
        );

        // Adicionar pergunta final de descrição para TODAS as custom actions
        // Texto da pergunta varia conforme o tipo de trabalho
        let descriptionQuestion = "Descreva detalhes adicionais:";
        
        if (action.workType === "image-generation") {
          descriptionQuestion = "Descreva detalhes adicionais (cores, contexto, elementos específicos):";
        } else if (action.workType === "copy-writing") {
          descriptionQuestion = "Descreva o que você precisa (produto, público-alvo, tom, objetivo):";
        } else if (action.workType === "video-generation") {
          descriptionQuestion = "Descreva detalhes adicionais do vídeo (cenário, ação, duração):";
        } else {
          descriptionQuestion = "Descreva detalhes adicionais:";
        }

        questions.push({
          key: "description",
          question: descriptionQuestion,
        });

        const config: QuickActionConfig = {
          type: `custom-${id}` as any, // Tipo especial para ações customizadas
          label: action.title,
          model: WORK_TYPE_MODELS[action.workType],
          questions,
          isImageGeneration: action.workType === "image-generation",
          workType: action.workType,
        };

        return config;
      },

      // Setters de estado
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "custom-actions-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customActions: state.customActions,
      }),
    }
  )
);

// Helper para verificar se um tipo é uma ação customizada
export function isCustomActionType(type: string): boolean {
  return type.startsWith("custom-");
}

// Helper para extrair ID da ação customizada do tipo
export function getCustomActionIdFromType(type: string): string | null {
  if (!isCustomActionType(type)) return null;
  return type.replace("custom-", "");
}
