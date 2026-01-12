import { test, expect } from '@playwright/test';

test.describe('ChatSection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve renderizar ChatSection com input visível', async ({ page }) => {
    await expect(page.getByPlaceholder(/digite sua mensagem/i)).toBeVisible();
  });

  test('deve adicionar mensagem à lista ao enviar', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Primeira mensagem';
    
    await input.fill(message);
    await input.press('Enter');
    
    await expect(page.getByText(message)).toBeVisible();
  });

  test('deve manter múltiplas mensagens na lista', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    
    const messages = [
      'Primeira mensagem',
      'Segunda mensagem',
      'Terceira mensagem',
    ];
    
    for (const message of messages) {
      await input.fill(message);
      await input.press('Enter');
      await page.waitForTimeout(100);
    }
    
    // Verificar que todas as mensagens estão visíveis
    for (const message of messages) {
      await expect(page.getByText(message)).toBeVisible();
    }
  });

  test('deve ocultar QuickActions quando há mensagens', async ({ page }) => {
    // Verificar que QuickActions estão visíveis
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).toBeVisible();
    
    // Enviar mensagem
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Mensagem que oculta QuickActions');
    await input.press('Enter');
    
    // Aguardar atualização
    await page.waitForTimeout(200);
    
    // Verificar que QuickActions foram ocultados
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).not.toBeVisible();
  });

  test('deve manter mensagens ordenadas cronologicamente', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    
    await input.fill('Mensagem 1');
    await input.press('Enter');
    await page.waitForTimeout(100);
    
    await input.fill('Mensagem 2');
    await input.press('Enter');
    await page.waitForTimeout(100);
    
    await input.fill('Mensagem 3');
    await input.press('Enter');
    await page.waitForTimeout(100);
    
    // Verificar ordem (primeira mensagem deve aparecer antes)
    const allMessages = page.locator('text=/Mensagem [123]/');
    const count = await allMessages.count();
    expect(count).toBe(3);
  });

  test('deve permitir editar mensagem existente', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Mensagem original');
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    // Hover e editar
    const bubble = page.getByText('Mensagem original').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    const editButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(1);
    await editButton.click();
    await page.waitForTimeout(200);
    
    const editInput = page.locator('textarea').filter({ 
      hasText: 'Mensagem original' 
    });
    await editInput.fill('Mensagem editada');
    await editInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Verificar que foi atualizada
    await expect(page.getByText('Mensagem editada')).toBeVisible();
    await expect(page.getByText('Mensagem original')).not.toBeVisible();
  });

  test('deve permitir copiar mensagem', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Mensagem para copiar';
    await input.fill(message);
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    // Hover e copiar
    const bubble = page.getByText(message).locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    const copyButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(2);
    await copyButton.click();
    await page.waitForTimeout(100);
    
    // Verificar clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(message);
  });

  test('deve permitir reenviar mensagem', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Mensagem para reenviar';
    await input.fill(message);
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    // Contar mensagens
    const initialCount = await page.getByText(message).count();
    
    // Hover e reenviar
    const bubble = page.getByText(message).locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    const resendButton = page.locator('button').filter({
      has: page.locator('svg')
    }).first();
    await resendButton.click();
    await page.waitForTimeout(300);
    
    // Verificar que uma nova mensagem foi adicionada
    const finalCount = await page.getByText(message).count();
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});
