/**
 * Tipos para Quick Actions customizadas
 */

// Tipos de trabalho disponíveis
export type WorkType =
  | "image-generation" // Criação de imagem
  | "video-generation" // Criação de vídeo
  | "document-analysis" // Análise de documento
  | "voice-to-text" // Conversão de voz para texto
  | "copy-writing"; // Criação de copy publicitário

// Interface para opção de resposta
export interface CustomOption {
  label: string; // Texto exibido para o usuário (obrigatório)
  prompt?: string; // Prompt gerado por esta opção (opcional)
}

// Interface para campo de pergunta customizado
export interface CustomField {
  id: string;
  question: string;
  options: CustomOption[]; // Sempre múltipla escolha
  key: string; // Chave única para identificar a resposta
}

// Interface para Quick Action customizada
export interface CustomQuickAction {
  id: string;
  title: string;
  workType: WorkType;
  icon?: string; // Nome do ícone Lucide
  imageUrl?: string; // URL da imagem (base64) para exibir no card
  fields: CustomField[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

// Interface para o formulário de criação
export interface CustomActionFormData {
  title: string;
  workType: WorkType | "";
  imageUrl?: string; // URL da imagem (base64) para preview
  fields: CustomFieldFormData[];
}

export interface CustomFieldFormData {
  id: string;
  question: string;
  options: CustomOption[];
}

// Mapeamento de tipos de trabalho para modelos padrão da fal.ai
export const WORK_TYPE_MODELS: Record<WorkType, string | undefined> = {
  "image-generation": "fal-ai/gpt-image-1.5",
  "video-generation": "fal-ai/kling-video/v1/standard/text-to-video",
  "document-analysis": undefined, // Será implementado futuramente
  "voice-to-text": undefined, // Será implementado futuramente
  "copy-writing": undefined, // Usará OpenRouter
};

// Labels para tipos de trabalho
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  "image-generation": "Criação de Imagem",
  "video-generation": "Criação de Vídeo",
  "document-analysis": "Análise de Documento",
  "voice-to-text": "Conversão de Voz para Texto",
  "copy-writing": "Criação de Copy Publicitário",
};

// Descrições dos tipos de trabalho
export const WORK_TYPE_DESCRIPTIONS: Record<WorkType, string> = {
  "image-generation": "Gera imagens usando IA (fal.ai)",
  "video-generation": "Gera vídeos usando IA (em breve)",
  "document-analysis": "Analisa documentos e extrai informações (em breve)",
  "voice-to-text": "Converte áudio em texto (em breve)",
  "copy-writing": "Cria textos publicitários usando IA",
};

// Ícones sugeridos por tipo de trabalho
export const WORK_TYPE_ICONS: Record<WorkType, string> = {
  "image-generation": "Image",
  "video-generation": "Video",
  "document-analysis": "FileText",
  "voice-to-text": "Mic",
  "copy-writing": "PenTool",
};

// Tipos de trabalho habilitados (para filtrar os que ainda não estão implementados)
export const ENABLED_WORK_TYPES: WorkType[] = [
  "image-generation",
  "copy-writing",
];

// Helper para gerar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper para gerar key a partir da pergunta
export function generateFieldKey(question: string, index: number): string {
  const slug = question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "_") // Substitui caracteres especiais por _
    .replace(/^_|_$/g, "") // Remove _ no início e fim
    .substring(0, 30); // Limita tamanho

  return slug || `field_${index}`;
}
