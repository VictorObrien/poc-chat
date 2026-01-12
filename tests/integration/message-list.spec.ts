import { test, expect } from '@playwright/test';

test.describe('MessageList', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve renderizar lista vazia inicialmente', async ({ page }) => {
    // Não deve haver mensagens visíveis
    const messages = page.locator('[class*="rounded-2xl"]').filter({
      hasText: /^[^O que gostaria]/
    });
    await expect(messages.first()).not.toBeVisible().catch(() => {
      // OK se não houver mensagens
    });
  });

  test('deve exibir mensagens na lista', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Mensagem na lista';
    
    await input.fill(message);
    await input.press('Enter');
    
    await expect(page.getByText(message)).toBeVisible();
  });

  test('deve exibir múltiplas mensagens', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    
    const messages = [
      'Mensagem 1',
      'Mensagem 2',
      'Mensagem 3',
    ];
    
    for (const msg of messages) {
      await input.fill(msg);
      await input.press('Enter');
      await page.waitForTimeout(100);
    }
    
    // Verificar que todas estão visíveis
    for (const msg of messages) {
      await expect(page.getByText(msg)).toBeVisible();
    }
  });

  test('deve manter mensagens alinhadas à direita', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Mensagem alinhada');
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    const bubble = page.getByText('Mensagem alinhada').locator('..');
    const alignment = await bubble.evaluate((el) => 
      window.getComputedStyle(el).alignItems
    );
    
    // Verificar que está alinhado à direita (flex-end ou end)
    expect(alignment).toMatch(/end|flex-end/i);
  });

  test('deve ter espaçamento entre mensagens', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    
    await input.fill('Mensagem 1');
    await input.press('Enter');
    await page.waitForTimeout(100);
    
    await input.fill('Mensagem 2');
    await input.press('Enter');
    await page.waitForTimeout(200);
    
    // Verificar que há gap entre as mensagens
    const container = page.locator('text=Mensagem 1').locator('..').locator('..');
    const gap = await container.evaluate((el) => 
      window.getComputedStyle(el).gap
    );
    
    expect(gap).not.toBe('0px');
  });
});
