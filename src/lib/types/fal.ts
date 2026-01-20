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
export type InstagramFormat = "story" | "post" | "reels" | "ads";

// Configuração de dimensões por formato
export interface ImageDimensions {
  width: number;
  height: number;
}

export const IMAGE_DIMENSIONS: Record<string, ImageDimensions> = {
  "instagram-post": { width: 1080, height: 1080 },
  "instagram-story": { width: 1080, height: 1920 },
  "instagram-reels": { width: 1080, height: 1920 },
  "instagram-ads": { width: 1080, height: 1080 },
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

// ============================================
// MAPEAMENTOS DE OPÇÕES PARA PROMPTS
// ============================================

// 1️⃣ Tipo de publicação
export const TIPO_PUBLICACAO_PROMPTS: Record<string, string> = {
  Story: "Instagram Story, vertical 9:16, optimized for mobile viewing",
  "Post no Feed":
    "Instagram feed post, square or vertical composition, high quality",
  "Capa de Reels":
    "Instagram Reels cover, vertical 9:16, eye-catching thumbnail",
  "Anúncio (Ads)": "Instagram advertisement, conversion-focused design",
};

// 2️⃣ Estrutura
export const ESTRUTURA_PROMPTS: Record<string, string> = {
  "Imagem única": "single image composition, clear visual hierarchy",
  Carrossel: "carousel post, cohesive visual style across slides",
  "Sequência de Stories": "story sequence with visual continuity",
  "Story animado": "dynamic animated style, motion-friendly design",
};

// 3️⃣ Objetivo
export const OBJETIVO_PROMPTS: Record<string, string> = {
  Vender: "sales-focused, persuasive visual, strong call to action",
  Engajar: "engagement-driven, attention-grabbing and relatable",
  Informar: "informative layout, clarity and readability prioritized",
  "Fortalecer marca": "brand awareness focused, consistent visual identity",
  "Lançar algo": "product launch style, sense of novelty and excitement",
};

// 4️⃣ Público-alvo
export const PUBLICO_PROMPTS: Record<string, string> = {
  Jovens: "targeted to young audience, trendy and energetic style",
  Adultos: "targeted to adult audience, balanced and professional",
  Empresários: "business-oriented, professional and trustworthy",
  "Público geral": "broad audience appeal, neutral and accessible",
  "Público premium": "high-end audience, premium and exclusive look",
};

// 5️⃣ Estilo visual
export const ESTILO_PROMPTS: Record<string, string> = {
  Minimalista: "minimalist design, clean background, few elements",
  Moderno: "modern design, contemporary trends",
  Divertido: "playful, colorful and fun visual style",
  Luxuoso: "luxury aesthetic, elegant details, refined textures",
  Impactante: "bold, high-contrast, visually striking",
  Clean: "clean layout, soft colors, organized composition",
};

// 6️⃣ Elemento principal
export const ELEMENTO_PROMPTS: Record<string, string> = {
  Produto: "product-centered composition, product clearly highlighted",
  Pessoa: "human-centered composition, expressive person as focal point",
  Texto: "text-focused design, typography as main visual element",
  "Marca (logo)": "brand-centered layout, logo prominently displayed",
  Ambiente: "environment-focused, contextual background storytelling",
};

// 7️⃣ Ação desejada
export const ACAO_PROMPTS: Record<string, string> = {
  Comprar: "clear call to action to buy",
  Clicar: "clear call to action to click",
  "Enviar mensagem": "clear call to action to send a message",
  Seguir: "clear call to action to follow the profile",
  "Apenas absorver": "no explicit call to action, brand impression focused",
};

// Negative prompt fixo para qualidade
export const NEGATIVE_PROMPT =
  "blurry, low quality, distorted, bad typography, unreadable text, watermark, logo artifacts, oversaturated, low contrast, messy layout";

// ============================================
// TIPOS E INTERFACES
// ============================================

// Pergunta do fluxo de conversa
export interface ConversationQuestion {
  key: string;
  question: string;
  options?: string[]; // Opções de resposta (labels)
  optionPrompts?: Record<string, string>; // Mapeamento label -> prompt (para custom actions)
}

// Configuração de cada Quick Action
export interface QuickActionConfig {
  type: QuickActionType;
  label: string;
  model?: string;
  questions: ConversationQuestion[];
  isImageGeneration: boolean;
  workType?: "image-generation" | "copy-writing" | "video-generation" | "document-analysis" | "voice-to-text";
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
  negativePrompt?: string;
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

// ============================================
// CONFIGURAÇÕES DAS QUICK ACTIONS
// ============================================

// Perguntas do fluxo de 7 etapas para Instagram
const INSTAGRAM_QUESTIONS: ConversationQuestion[] = [
  {
    key: "tipo_publicacao",
    question: "Qual o formato da arte?",
    options: ["Story", "Post no Feed", "Capa de Reels", "Anúncio (Ads)"],
  },
  {
    key: "estrutura",
    question: "Como será o layout?",
    options: [
      "Imagem única",
      "Carrossel",
      "Sequência de Stories",
      "Story animado",
    ],
  },
  {
    key: "objetivo",
    question: "Qual o objetivo da imagem?",
    options: [
      "Vender",
      "Engajar",
      "Informar",
      "Fortalecer marca",
      "Lançar algo",
    ],
  },
  {
    key: "publico",
    question: "Para quem é essa arte?",
    options: [
      "Jovens",
      "Adultos",
      "Empresários",
      "Público geral",
      "Público premium",
    ],
  },
  {
    key: "estilo",
    question: "Qual estilo melhor representa a arte?",
    options: [
      "Minimalista",
      "Moderno",
      "Divertido",
      "Luxuoso",
      "Impactante",
      "Clean",
    ],
  },
  {
    key: "elemento",
    question: "O que deve ser o foco visual?",
    options: ["Produto", "Pessoa", "Texto", "Marca (logo)", "Ambiente"],
  },
  {
    key: "acao",
    question: "O que o usuário deve fazer após ver a imagem?",
    options: [
      "Comprar",
      "Clicar",
      "Enviar mensagem",
      "Seguir",
      "Apenas absorver",
    ],
  },
  {
    key: "description",
    question:
      "Descreva detalhes adicionais da imagem (produto, cores, contexto):",
  },
];

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
    questions: INSTAGRAM_QUESTIONS,
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
        key: "objetivo",
        question: "Qual o objetivo da thumbnail?",
        options: ["Gerar cliques", "Mostrar produto", "Causar curiosidade"],
      },
      {
        key: "estilo",
        question: "Qual estilo da thumbnail?",
        options: ["Impactante", "Divertido", "Moderno", "Clean"],
      },
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
  tipoPublicacao?: string
): ImageDimensions {
  if (actionType === "instagram-image" && tipoPublicacao) {
    // Mapear tipo de publicação para dimensões
    if (tipoPublicacao === "Story" || tipoPublicacao === "Capa de Reels") {
      return IMAGE_DIMENSIONS["instagram-story"];
    }
    if (
      tipoPublicacao === "Post no Feed" ||
      tipoPublicacao === "Anúncio (Ads)"
    ) {
      return IMAGE_DIMENSIONS["instagram-post"];
    }
  }
  if (actionType === "tiktok-image") {
    return IMAGE_DIMENSIONS["tiktok-thumbnail"];
  }
  // Default
  return { width: 1024, height: 1024 };
}

// ============================================
// CONSTRUTOR DE PROMPT FINAL
// ============================================

/**
 * Constrói o prompt final para Instagram baseado nas respostas do usuário
 */
export function buildInstagramPrompt(
  responses: Record<string, string>
): string {
  const parts: string[] = [];

  // Base do prompt
  parts.push("High quality, professional social media artwork.");

  // 1️⃣ Tipo de publicação
  if (responses.tipo_publicacao) {
    const promptPart = TIPO_PUBLICACAO_PROMPTS[responses.tipo_publicacao];
    if (promptPart) parts.push(promptPart);
  }

  // 2️⃣ Estrutura
  if (responses.estrutura) {
    const promptPart = ESTRUTURA_PROMPTS[responses.estrutura];
    if (promptPart) parts.push(promptPart);
  }

  // 3️⃣ Objetivo
  if (responses.objetivo) {
    const promptPart = OBJETIVO_PROMPTS[responses.objetivo];
    if (promptPart) parts.push(promptPart);
  }

  // 4️⃣ Público-alvo
  if (responses.publico) {
    const promptPart = PUBLICO_PROMPTS[responses.publico];
    if (promptPart) parts.push(promptPart);
  }

  // 5️⃣ Estilo visual
  if (responses.estilo) {
    const promptPart = ESTILO_PROMPTS[responses.estilo];
    if (promptPart) parts.push(promptPart);
  }

  // 6️⃣ Elemento principal
  if (responses.elemento) {
    const promptPart = ELEMENTO_PROMPTS[responses.elemento];
    if (promptPart) parts.push(promptPart);
  }

  // 7️⃣ Ação desejada
  if (responses.acao) {
    const promptPart = ACAO_PROMPTS[responses.acao];
    if (promptPart) parts.push(promptPart);
  }

  // Descrição adicional do usuário
  if (responses.description) {
    parts.push(`User description: ${responses.description}`);
  }

  // Finalização do prompt
  parts.push(
    "Instagram optimized, sharp, high resolution, clean layout, strong composition, modern typography."
  );

  return parts.join("\n");
}

/**
 * Constrói o prompt final para TikTok baseado nas respostas do usuário
 */
export function buildTikTokPrompt(responses: Record<string, string>): string {
  const parts: string[] = [];

  parts.push("High quality TikTok video thumbnail, vertical 9:16 format.");

  // Objetivo
  if (responses.objetivo) {
    const objetivoMap: Record<string, string> = {
      "Gerar cliques": "click-baiting style, curiosity-inducing",
      "Mostrar produto": "product showcase, clear product visibility",
      "Causar curiosidade": "mysterious, intriguing visual",
    };
    const promptPart = objetivoMap[responses.objetivo];
    if (promptPart) parts.push(promptPart);
  }

  // Estilo
  if (responses.estilo) {
    const promptPart = ESTILO_PROMPTS[responses.estilo];
    if (promptPart) parts.push(promptPart);
  }

  // Descrição
  if (responses.description) {
    parts.push(`User description: ${responses.description}`);
  }

  parts.push(
    "Eye-catching thumbnail, bold colors, high contrast, optimized for mobile viewing."
  );

  return parts.join("\n");
}

/**
 * Constrói o prompt final baseado no tipo de ação
 */
export function buildFinalPrompt(
  actionType: QuickActionType,
  responses: Record<string, string>
): string {
  switch (actionType) {
    case "instagram-image":
      return buildInstagramPrompt(responses);
    case "tiktok-image":
      return buildTikTokPrompt(responses);
    default:
      return responses.description || "";
  }
}
