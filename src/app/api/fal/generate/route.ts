/**
 * API Route para geração de imagens com fal.ai
 */

import { NextRequest } from "next/server";
import { fal } from "@fal-ai/client";
import type {
  QuickActionType,
  InstagramFormat,
  FalGenerateRequest,
} from "@/lib/types/fal";
import { FAL_MODELS, getImageDimensions } from "@/lib/types/fal";
import { getPromptForModel } from "@/lib/prompts/imagePrompts";

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

    const body: FalGenerateRequest = await request.json();

    if (!body.prompt || !body.actionType) {
      return new Response(
        JSON.stringify({ error: "Prompt e tipo de ação são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { prompt, actionType, format } = body;

    // Obter modelo e dimensões
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

    const dimensions = getImageDimensions(
      actionType as QuickActionType,
      format as InstagramFormat
    );

    // Construir prompt técnico
    const technicalPrompt = getPromptForModel(model, {
      actionType: actionType as QuickActionType,
      format: format as InstagramFormat,
      description: prompt,
    });

    console.log("Gerando imagem com fal.ai:", {
      model,
      dimensions,
      promptLength: technicalPrompt.length,
    });

    // Preparar input baseado no modelo
    let input: any;

    if (model.includes("gpt-image")) {
      // GPT-Image 1.5 usa formato diferente
      input = {
        prompt: technicalPrompt,
        size: `${dimensions.width}x${dimensions.height}`,
      };
    } else {
      // Flux e outros modelos usam formato padrão
      input = {
        prompt: technicalPrompt,
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
