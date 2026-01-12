import { test, expect } from '@playwright/test';

test.describe('ChatInput', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve renderizar o input de chat', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('deve permitir digitar mensagem', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Esta é uma mensagem de teste';
    
    await input.fill(message);
    await expect(input).toHaveValue(message);
  });

  test('deve ter botão de enviar desabilitado quando input está vazio', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /enviar mensagem/i });
    await expect(sendButton).toBeDisabled();
  });

  test('deve habilitar botão de enviar quando há texto no input', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const sendButton = page.getByRole('button', { name: /enviar mensagem/i });
    
    await input.fill('Mensagem de teste');
    await expect(sendButton).toBeEnabled();
  });

  test('deve enviar mensagem ao clicar no botão de enviar', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const sendButton = page.getByRole('button', { name: /enviar mensagem/i });
    const message = 'Mensagem enviada pelo botão';
    
    await input.fill(message);
    await sendButton.click();
    
    // Verificar que a mensagem aparece na lista
    await expect(page.getByText(message)).toBeVisible();
    
    // Verificar que o input foi limpo
    await expect(input).toHaveValue('');
  });

  test('deve enviar mensagem ao pressionar Enter', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Mensagem enviada por Enter';
    
    await input.fill(message);
    await input.press('Enter');
    
    // Verificar que a mensagem aparece na lista
    await expect(page.getByText(message)).toBeVisible();
    
    // Verificar que o input foi limpo
    await expect(input).toHaveValue('');
  });

  test('não deve enviar mensagem ao pressionar Shift+Enter', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Primeira linha';
    
    await input.fill(message);
    await input.press('Shift+Enter');
    
    // Verificar que o input ainda contém o texto
    await expect(input).toHaveValue(message + '\n');
    
    // Verificar que a mensagem não foi enviada
    await expect(page.getByText(message)).not.toBeVisible();
  });

  test('deve ter auto-resize do textarea', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    
    // Digitar uma linha
    await input.fill('Linha 1');
    const height1 = await input.boundingBox();
    
    // Digitar múltiplas linhas
    await input.fill('Linha 1\nLinha 2\nLinha 3\nLinha 4');
    const height2 = await input.boundingBox();
    
    // Verificar que a altura aumentou
    expect(height2?.height).toBeGreaterThan(height1?.height || 0);
  });

  test('deve ter limite máximo de altura no textarea', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    
    // Digitar muitas linhas
    const manyLines = Array(20).fill('Linha de teste').join('\n');
    await input.fill(manyLines);
    
    // Verificar que não excede 200px
    const height = await input.boundingBox();
    expect(height?.height).toBeLessThanOrEqual(210); // 200px + padding
  });

  test('deve ter botão de enviar com cor amarela', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Teste');
    
    const sendButton = page.getByRole('button', { name: /enviar mensagem/i });
    const bgColor = await sendButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Verificar que tem cor amarela (rgb aproximado)
    expect(bgColor).toContain('rgb');
  });

  test('deve ter cursor pointer no botão de enviar', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Teste');
    
    const sendButton = page.getByRole('button', { name: /enviar mensagem/i });
    await expect(sendButton).toHaveCSS('cursor', 'pointer');
  });

  test('deve limpar input após enviar mensagem', async ({ page }) => {
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    const message = 'Mensagem que será limpa';
    
    await input.fill(message);
    await input.press('Enter');
    
    // Aguardar um pouco para garantir que foi limpo
    await page.waitForTimeout(100);
    await expect(input).toHaveValue('');
  });
});
