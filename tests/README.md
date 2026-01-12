# Testes de Integração e E2E

Este diretório contém os testes de integração e E2E do projeto usando Playwright.

## Estrutura

```
tests/
├── integration/          # Testes de integração
│   ├── chat/            # Testes de funcionalidades de chat
│   ├── api/             # Testes de API routes
│   └── agents/          # Testes de agents
├── e2e/                 # Testes end-to-end completos
└── setup/               # Configurações e mocks
    ├── test-setup.ts    # Setup global
    ├── handlers.ts       # MSW handlers para mockar APIs
    └── server.ts        # MSW server setup
```

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
