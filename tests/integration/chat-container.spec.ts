import { test, expect } from '@playwright/test';

test.describe('ChatContainer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve renderizar QuickActions inicialmente', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).toBeVisible();
    
    await expect(page.getByRole('button', { name: /nova conversa/i })).toBeVisible();
  });

  test('deve ocultar QuickActions quando conversa inicia', async ({ page }) => {
    // Verificar que QuickActions estão visíveis
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).toBeVisible();
    
    // Enviar primeira mensagem
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Iniciando conversa');
    await input.press('Enter');
    
    // Aguardar atualização
    await page.waitForTimeout(300);
    
    // Verificar que QuickActions foram ocultados
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).not.toBeVisible();
  });

  test('deve manter ChatSection sempre visível', async ({ page }) => {
    // Verificar que ChatSection está visível inicialmente
    await expect(page.getByPlaceholder(/digite sua mensagem/i)).toBeVisible();
    
    // Enviar mensagem
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Teste');
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    // Verificar que ChatSection ainda está visível
    await expect(page.getByPlaceholder(/digite sua mensagem/i)).toBeVisible();
  });

  test('deve gerenciar estado de hasMessages corretamente', async ({ page }) => {
    // Estado inicial: sem mensagens
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).toBeVisible();
    
    // Adicionar mensagem
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Mensagem 1');
    await input.press('Enter');
    await page.waitForTimeout(300);
    
    // QuickActions devem estar ocultos
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).not.toBeVisible();
    
    // Adicionar mais mensagens
    await input.fill('Mensagem 2');
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    // QuickActions ainda devem estar ocultos
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).not.toBeVisible();
  });
});
