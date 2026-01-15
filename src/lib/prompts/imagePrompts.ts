/**
 * Templates e funções para construção de prompts técnicos
 * para geração de imagens com fal.ai
 */

import type { QuickActionType, InstagramFormat } from "@/lib/types/fal";
import { getImageDimensions } from "@/lib/types/fal";

interface PromptContext {
  actionType: QuickActionType;
  format?: InstagramFormat;
  description: string;
}

// Template base para prompts de imagem
const BASE_PROMPT_TEMPLATE = `
Create a high-quality, professional image with the following specifications:

Platform: {platform}
Format: {format}
Dimensions: {width}x{height} pixels

Description: {description}

Style guidelines:
- Modern and visually appealing
- High contrast and vibrant colors
- Professional quality suitable for social media
- Clean composition with clear focal point
`.trim();

// Templates específicos por plataforma
const INSTAGRAM_POST_ADDITIONS = `
- Square format (1:1 aspect ratio)
- Eye-catching for feed scroll
- Suitable for brand content
`;

const INSTAGRAM_STORY_ADDITIONS = `
- Vertical format (9:16 aspect ratio)
- Full-screen immersive experience
- Consider safe zones for UI elements
`;

const TIKTOK_THUMBNAIL_ADDITIONS = `
- Vertical format (9:16 aspect ratio)
- Bold and attention-grabbing
- Text-friendly composition
- High impact visual to drive clicks
`;

/**
 * Constrói um prompt técnico otimizado para a fal.ai
 * baseado no contexto da Quick Action e descrição do usuário
 */
export function buildTechnicalPrompt(context: PromptContext): string {
  const { actionType, format, description } = context;
  const dimensions = getImageDimensions(actionType, format);

  let platform = "";
  let formatName = "";
  let additionalGuidelines = "";

  switch (actionType) {
    case "instagram-image":
      platform = "Instagram";
      if (format === "story") {
        formatName = "Story";
        additionalGuidelines = INSTAGRAM_STORY_ADDITIONS;
      } else {
        formatName = "Post";
        additionalGuidelines = INSTAGRAM_POST_ADDITIONS;
      }
      break;

    case "tiktok-image":
      platform = "TikTok";
      formatName = "Video Thumbnail";
      additionalGuidelines = TIKTOK_THUMBNAIL_ADDITIONS;
      break;

    default:
      platform = "Social Media";
      formatName = "Image";
  }

  const prompt = BASE_PROMPT_TEMPLATE.replace("{platform}", platform)
    .replace("{format}", formatName)
    .replace("{width}", dimensions.width.toString())
    .replace("{height}", dimensions.height.toString())
    .replace("{description}", description);

  return `${prompt}\n${additionalGuidelines}`.trim();
}

/**
 * Simplifica o prompt para modelos que preferem prompts mais curtos
 */
export function buildSimplePrompt(context: PromptContext): string {
  const { actionType, format, description } = context;

  let prefix = "";

  if (actionType === "instagram-image") {
    prefix =
      format === "story"
        ? "Vertical Instagram story image:"
        : "Square Instagram post image:";
  } else if (actionType === "tiktok-image") {
    prefix = "Eye-catching TikTok video thumbnail:";
  }

  return `${prefix} ${description}. Professional quality, vibrant colors, modern style.`;
}

/**
 * Escolhe o tipo de prompt baseado no modelo
 */
export function getPromptForModel(
  model: string,
  context: PromptContext
): string {
  // Flux Schnell funciona melhor com prompts mais curtos
  if (model.includes("schnell")) {
    return buildSimplePrompt(context);
  }

  // Flux Pro pode lidar com prompts mais detalhados
  return buildTechnicalPrompt(context);
}
