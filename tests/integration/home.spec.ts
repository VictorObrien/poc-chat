import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve renderizar a página inicial corretamente', async ({ page }) => {
    // Verificar se o título está visível
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).toBeVisible();

    // Verificar se os QuickActions estão visíveis
    await expect(page.getByRole('button', { name: /nova conversa/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /imagem instagram/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reels/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /imagem tiktok/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /vídeo tiktok/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /personalize/i })).toBeVisible();

    // Verificar se o input de chat está visível
    await expect(page.getByPlaceholder(/digite sua mensagem/i)).toBeVisible();
  });

  test('deve ter o background color correto', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(1, 3, 54)');
  });

  test('deve ocultar QuickActions quando uma mensagem é enviada', async ({ page }) => {
    // Verificar que QuickActions estão visíveis inicialmente
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).toBeVisible();

    // Enviar uma mensagem
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Olá, esta é uma mensagem de teste');
    await page.getByRole('button', { name: /enviar mensagem/i }).click();

    // Aguardar que a mensagem apareça
    await expect(page.getByText('Olá, esta é uma mensagem de teste')).toBeVisible();

    // Verificar que QuickActions foram ocultados
    await expect(
      page.getByRole('heading', { name: /o que gostaria de criar hoje\?/i })
    ).not.toBeVisible();
  });
});
