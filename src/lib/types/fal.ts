/**
 * Tipos para integração com fal.ai
 */

// Tipos de Quick Actions disponíveis
export type QuickActionType =
  | "instagram-image"
  | "tiktok-image"
  | "reels"
  | "tiktok-video"
  | "new-conversation"
  | "personalize";

// Formato de imagem para Instagram
export type InstagramFormat = "story" | "post";

// Configuração de dimensões por formato
export interface ImageDimensions {
  width: number;
  height: number;
}

export const IMAGE_DIMENSIONS: Record<string, ImageDimensions> = {
  "instagram-post": { width: 1080, height: 1080 },
  "instagram-story": { width: 1080, height: 1920 },
  "tiktok-thumbnail": { width: 1080, height: 1920 },
};

// Modelos da fal.ai por tipo de ação
export const FAL_MODELS: Record<string, string> = {
  "instagram-image": "fal-ai/gpt-image-1.5",
  "tiktok-image": "fal-ai/gpt-image-1.5",
  // Futuros modelos de vídeo
  // "reels": "fal-ai/kling-video/v1/standard/text-to-video",
  // "tiktok-video": "fal-ai/kling-video/v1/standard/text-to-video",
};

// Pergunta do fluxo de conversa
export interface ConversationQuestion {
  key: string;
  question: string;
  options?: string[]; // Opções de resposta (ex: ["Story", "Post"])
}

// Configuração de cada Quick Action
export interface QuickActionConfig {
  type: QuickActionType;
  label: string;
  model?: string;
  questions: ConversationQuestion[];
  isImageGeneration: boolean;
}

// Estado do fluxo de conversa
export interface ConversationFlowState {
  activeFlow: QuickActionType | null;
  actionConfig: QuickActionConfig | null;
  responses: Record<string, string>;
  currentStep: number;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  error: string | null;
}

// Requisição para a API de geração de imagem
export interface FalGenerateRequest {
  prompt: string;
  actionType: QuickActionType;
  format?: InstagramFormat;
}

// Resposta da API fal.ai
export interface FalGenerateResponse {
  imageUrl: string;
  requestId: string;
}

// Resposta de erro
export interface FalErrorResponse {
  error: string;
  details?: string;
}

// Configurações das Quick Actions
export const QUICK_ACTION_CONFIGS: QuickActionConfig[] = [
  {
    type: "new-conversation",
    label: "Nova Conversa",
    questions: [],
    isImageGeneration: false,
  },
  {
    type: "instagram-image",
    label: "Imagem Instagram",
    model: FAL_MODELS["instagram-image"],
    questions: [
      {
        key: "format",
        question: "Para Story ou Post?",
        options: ["Story", "Post"],
      },
      {
        key: "description",
        question: "Descreva como deve ser a imagem:",
      },
    ],
    isImageGeneration: true,
  },
  {
    type: "reels",
    label: "Reels",
    questions: [],
    isImageGeneration: false, // Futuro
  },
  {
    type: "tiktok-image",
    label: "Imagem TikTok",
    model: FAL_MODELS["tiktok-image"],
    questions: [
      {
        key: "description",
        question: "Descreva como deve ser a thumbnail do vídeo:",
      },
    ],
    isImageGeneration: true,
  },
  {
    type: "tiktok-video",
    label: "Vídeo TikTok",
    questions: [],
    isImageGeneration: false, // Futuro
  },
  {
    type: "personalize",
    label: "Personalize",
    questions: [],
    isImageGeneration: false,
  },
];

// Helper para obter config por tipo
export function getQuickActionConfig(
  type: QuickActionType
): QuickActionConfig | undefined {
  return QUICK_ACTION_CONFIGS.find((config) => config.type === type);
}

// Helper para obter dimensões por tipo e formato
export function getImageDimensions(
  actionType: QuickActionType,
  format?: InstagramFormat
): ImageDimensions {
  if (actionType === "instagram-image" && format) {
    return IMAGE_DIMENSIONS[`instagram-${format}`];
  }
  if (actionType === "tiktok-image") {
    return IMAGE_DIMENSIONS["tiktok-thumbnail"];
  }
  // Default
  return { width: 1024, height: 1024 };
}
