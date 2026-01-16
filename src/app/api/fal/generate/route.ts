/**
 * API Route para geração de imagens com fal.ai
 */

import { NextRequest } from "next/server";
import { fal } from "@fal-ai/client";
import type { QuickActionType } from "@/lib/types/fal";
import {
  FAL_MODELS,
  getImageDimensions,
  NEGATIVE_PROMPT,
} from "@/lib/types/fal";

// Interface para requisição
interface GenerateRequestBody {
  prompt: string;
  actionType: QuickActionType;
  tipoPublicacao?: string; // Para determinar dimensões no Instagram
  negativePrompt?: string;
}

interface FalImageResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings?: {
    inference: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar e configurar chave da API fal.ai
    const falKey = process.env.FAL_AI_API_KEY || process.env.FAL_KEY;

    if (!falKey) {
      return new Response(
        JSON.stringify({
          error: "FAL_AI_API_KEY não configurada",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Configurar cliente fal.ai dentro da função (evita problemas na compilação)
    fal.config({
      credentials: falKey,
    });

    const body: GenerateRequestBody = await request.json();

    if (!body.prompt || !body.actionType) {
      return new Response(
        JSON.stringify({ error: "Prompt e tipo de ação são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { prompt, actionType, tipoPublicacao, negativePrompt } = body;

    // Obter modelo
    const model = FAL_MODELS[actionType];
    if (!model) {
      return new Response(
        JSON.stringify({
          error: `Modelo não configurado para ação: ${actionType}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obter dimensões baseado no tipo de publicação
    const dimensions = getImageDimensions(actionType, tipoPublicacao);

    // Usar negative prompt fixo se não for fornecido
    const finalNegativePrompt = negativePrompt || NEGATIVE_PROMPT;

    console.log("Gerando imagem com fal.ai:", {
      model,
      dimensions,
      promptLength: prompt.length,
      tipoPublicacao,
    });

    // Log do prompt completo para debug
    console.log("Prompt completo:\n", prompt);

    // Preparar input baseado no modelo
    let input: Record<string, unknown>;

    if (model.includes("gpt-image")) {
      // GPT-Image 1.5 usa formato diferente
      input = {
        prompt: prompt,
        size: `${dimensions.width}x${dimensions.height}`,
      };
    } else if (model.includes("flux")) {
      // Flux suporta negative prompt
      input = {
        prompt: prompt,
        image_size: {
          width: dimensions.width,
          height: dimensions.height,
        },
        num_images: 1,
        enable_safety_checker: true,
        negative_prompt: finalNegativePrompt,
      };
    } else {
      // Outros modelos - formato padrão
      input = {
        prompt: prompt,
        image_size: {
          width: dimensions.width,
          height: dimensions.height,
        },
        num_images: 1,
        enable_safety_checker: true,
      };
    }

    // Chamar fal.ai
    const result = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Geração em progresso...", update.logs);
        }
      },
    });

    const data = result.data as FalImageResult;

    if (!data.images || data.images.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Nenhuma imagem foi gerada",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const imageUrl = data.images[0].url;

    return new Response(
      JSON.stringify({
        imageUrl,
        requestId: result.requestId,
        timings: data.timings,
        dimensions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro na API fal.ai:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
