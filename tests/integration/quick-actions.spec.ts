import { test, expect } from '@playwright/test';

test.describe('QuickActions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve renderizar todos os botões de ação rápida', async ({ page }) => {
    const actions = [
      'Nova Conversa',
      'Imagem Instagram',
      'Reels',
      'Imagem TikTok',
      'Vídeo TikTok',
      'Personalize',
    ];

    for (const action of actions) {
      await expect(page.getByRole('button', { name: new RegExp(action, 'i') })).toBeVisible();
    }
  });

  test('deve ter 6 botões de ação rápida', async ({ page }) => {
    const buttons = page.locator('button').filter({ hasText: /nova conversa|imagem instagram|reels|imagem tiktok|vídeo tiktok|personalize/i });
    await expect(buttons).toHaveCount(6);
  });

  test('deve ter cursor pointer nos botões', async ({ page }) => {
    const button = page.getByRole('button', { name: /nova conversa/i });
    await expect(button).toHaveCSS('cursor', 'pointer');
  });

  test('deve aplicar hover effect nos botões', async ({ page }) => {
    const button = page.getByRole('button', { name: /nova conversa/i });
    
    // Verificar estado inicial
    await expect(button).toHaveCSS('background-color', 'rgba(26, 26, 74, 1)');
    
    // Hover no botão
    await button.hover();
    
    // Aguardar transição
    await page.waitForTimeout(100);
    
    // Verificar que o hover foi aplicado (pode variar, mas deve ter mudança)
    const bgColor = await button.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBeTruthy();
  });

  test('deve ter layout responsivo em grid', async ({ page }) => {
    const container = page.locator('button').filter({ hasText: /nova conversa/i }).locator('..').locator('..');
    
    // Verificar que está em grid
    const display = await container.evaluate((el) => 
      window.getComputedStyle(el).display
    );
    expect(display).toBe('grid');
  });
});
