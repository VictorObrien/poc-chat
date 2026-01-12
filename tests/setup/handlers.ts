import { http, HttpResponse } from 'msw';

/**
 * MSW handlers para mockar APIs durante testes
 * @see https://mswjs.io/docs/basics/request-handler
 */

export const handlers = [
  // Mock da API do OpenRouter - Chat Completions
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as any;
    
    // Retornar resposta mockada
    return HttpResponse.json({
      id: 'test-chat-completion-id',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body.model || 'openai/gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Esta é uma resposta mockada para testes de integração.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    });
  }),

  // Mock para streaming (SSE)
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const url = new URL(request.url);
    const stream = url.searchParams.get('stream') === 'true';
    
    if (stream) {
      // Retornar stream mockado
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunks = [
            'data: {"id":"test","choices":[{"delta":{"role":"assistant","content":"Resposta"}}]}\n\n',
            'data: {"id":"test","choices":[{"delta":{"content":" em "}}]}\n\n',
            'data: {"id":"test","choices":[{"delta":{"content":"streaming"}}]}\n\n',
            'data: [DONE]\n\n',
          ];
          
          chunks.forEach((chunk, index) => {
            setTimeout(() => {
              controller.enqueue(encoder.encode(chunk));
              if (index === chunks.length - 1) {
                controller.close();
              }
            }, index * 100);
          });
        },
      });

      return new HttpResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
        },
      });
    }

    // Fallback para resposta não-streaming
    return HttpResponse.json({
      id: 'test-stream-id',
      choices: [{ message: { role: 'assistant', content: 'Stream mockado' } }],
    });
  }),
];
