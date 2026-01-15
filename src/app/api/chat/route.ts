/**
 * API Route para integração com OpenRouter com suporte a streaming
 * Esta rota atua como um proxy seguro, mantendo a API key no servidor
 */

import { streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import type { OpenRouterMessage } from "@/lib/types/openrouter";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface ChatRequest {
  message: string;
  conversationHistory?: OpenRouterMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || typeof body.message !== "string") {
      return new Response(JSON.stringify({ error: "Mensagem é obrigatória" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "OPENROUTER_API_KEY não configurada",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Construir histórico de mensagens
    const messages: OpenRouterMessage[] = [
      ...(body.conversationHistory || []),
      {
        role: "user",
        content: body.message,
      },
    ];

    // Gerar stream de texto usando Vercel AI SDK
    const result = await streamText({
      model: openrouter(body.model || "openai/gpt-5-mini"),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: body.temperature ?? 0.7,
      ...(body.max_tokens && { maxTokens: body.max_tokens }),
    });

    // Retornar o stream usando toTextStreamResponse
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Erro na API de chat:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
