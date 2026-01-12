# Testes de Integração e E2E

Este diretório contém os testes de integração e E2E do projeto usando Playwright.

## Estrutura

```
tests/
├── integration/          # Testes de integração
│   ├── home.spec.ts      # Testes da página inicial
│   ├── quick-actions.spec.ts  # Testes dos botões de ação rápida
│   ├── chat-input.spec.ts     # Testes do input de chat
│   ├── chat-bubble.spec.ts    # Testes das bolhas de mensagem
│   ├── chat-section.spec.ts   # Testes da seção de chat
│   ├── message-list.spec.ts   # Testes da lista de mensagens
│   ├── chat-container.spec.ts # Testes do container principal
│   ├── use-chat-hook.spec.ts  # Testes do hook useChat
│   ├── chat/            # Testes de funcionalidades de chat (futuro)
│   ├── api/             # Testes de API routes (futuro)
│   └── agents/          # Testes de agents (futuro)
├── e2e/                 # Testes end-to-end completos
└── setup/               # Configurações e mocks
    ├── test-setup.ts    # Setup global
    ├── handlers.ts       # MSW handlers para mockar APIs
    └── server.ts        # MSW server setup
```

## Cobertura de Testes

### Componentes Testados

✅ **Home Page** (`home.spec.ts`)
- Renderização da página inicial
- Background color correto
- Ocultação de QuickActions quando há mensagens

✅ **QuickActions** (`quick-actions.spec.ts`)
- Renderização de todos os 6 botões
- Hover effects
- Layout responsivo em grid
- Cursor pointer

✅ **ChatInput** (`chat-input.spec.ts`)
- Renderização e digitação
- Envio via botão e Enter
- Shift+Enter para nova linha
- Auto-resize do textarea
- Limite máximo de altura
- Validação de botão desabilitado/habilitado
- Limpeza após envio
- Estilização (cor amarela, cursor)

✅ **ChatBubble** (`chat-bubble.spec.ts`)
- Exibição de mensagens
- Hover effects (timestamp, ações)
- Copiar mensagem (Clipboard API)
- Editar mensagem (modo edição)
- Cancelar edição
- Salvar edição
- Atalhos de teclado (Enter, Escape)
- Reenviar mensagem
- Validação de botão salvar

✅ **ChatSection** (`chat-section.spec.ts`)
- Gerenciamento de mensagens
- Múltiplas mensagens
- Ordenação cronológica
- Edição e cópia de mensagens
- Reenvio de mensagens
- Ocultação de QuickActions

✅ **MessageList** (`message-list.spec.ts`)
- Renderização de lista vazia
- Exibição de múltiplas mensagens
- Alinhamento à direita
- Espaçamento entre mensagens

✅ **ChatContainer** (`chat-container.spec.ts`)
- Gerenciamento de estado
- Visibilidade de QuickActions
- Integração entre componentes

✅ **useChat Hook** (`use-chat-hook.spec.ts`)
- Gerenciamento de estado da mensagem
- Limpeza após envio
- Validação de botão
- Múltiplos envios sequenciais

### Estatísticas

- **Total de testes**: 165 (55 testes × 3 browsers)
- **Arquivos de teste**: 8
- **Browsers testados**: Chromium, Firefox, WebKit

## Scripts Disponíveis

- `pnpm test` - Executa todos os testes
- `pnpm test:ui` - Executa testes com UI interativa
- `pnpm test:debug` - Executa testes em modo debug
- `pnpm test:integration` - Executa apenas testes de integração
- `pnpm test:e2e` - Executa apenas testes E2E
- `pnpm test:headed` - Executa testes com browser visível

## Como Escrever Testes

### Exemplo de Teste de Integração

```typescript
import { test, expect } from '@playwright/test';

test('usuário pode enviar mensagem', async ({ page }) => {
  await page.goto('/chat');
  
  const input = page.getByPlaceholder('Digite sua mensagem...');
  await input.fill('Olá!');
  await page.getByRole('button', { name: 'Enviar' }).click();
  
  await expect(page.getByText('Olá!')).toBeVisible();
});
```

### Usando MSW para Mockar APIs

```typescript
import { test, expect } from '@playwright/test';
import { server } from '../setup/server';
import { http, HttpResponse } from 'msw';

test.beforeAll(() => server.listen());
test.afterEach(() => server.resetHandlers());
test.afterAll(() => server.close());

test('teste com API mockada', async ({ page }) => {
  // Seu teste aqui
});
```

## Configuração

A configuração do Playwright está em `playwright.config.ts` na raiz do projeto.

O servidor de desenvolvimento é iniciado automaticamente antes dos testes.

## MSW (Mock Service Worker)

Os handlers do MSW estão em `tests/setup/handlers.ts` e mockam a API do OpenRouter.

Para adicionar novos mocks, edite o arquivo `handlers.ts`.
