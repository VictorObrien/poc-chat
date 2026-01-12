import { test, expect } from '@playwright/test';

test.describe('ChatBubble', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Enviar uma mensagem para criar um bubble
    const input = page.getByPlaceholder(/digite sua mensagem/i);
    await input.fill('Mensagem de teste para bubble');
    await input.press('Enter');
    
    // Aguardar que a mensagem apareça
    await expect(page.getByText('Mensagem de teste para bubble')).toBeVisible();
  });

  test('deve exibir a mensagem no bubble', async ({ page }) => {
    await expect(page.getByText('Mensagem de teste para bubble')).toBeVisible();
  });

  test('deve mostrar opções ao fazer hover no bubble', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    
    // Hover no bubble
    await bubble.hover();
    
    // Aguardar animação
    await page.waitForTimeout(200);
    
    // Verificar que os botões de ação aparecem
    const resendButton = page.locator('button').filter({ hasText: /reenviar/i }).or(
      page.locator('button[aria-label*="reenviar" i]')
    ).first();
    
    // Verificar que há botões de ação (pode ser por ícone)
    const actionButtons = page.locator('button').filter({ 
      has: page.locator('svg')
    });
    
    // Pelo menos um botão de ação deve estar visível
    const buttonsCount = await actionButtons.count();
    expect(buttonsCount).toBeGreaterThan(0);
  });

  test('deve exibir timestamp ao fazer hover', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Verificar que há um timestamp (formato HH:mm)
    const timestamp = page.locator('text=/\\d{2}:\\d{2}/');
    await expect(timestamp.first()).toBeVisible();
  });

  test('deve copiar mensagem ao clicar em copiar', async ({ page }) => {
    // Configurar permissão de clipboard
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Encontrar botão de copiar (ícone Copy)
    const copyButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(2); // Terceiro botão (resend, edit, copy)
    
    await copyButton.click();
    await page.waitForTimeout(100);
    
    // Verificar que foi copiado
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('Mensagem de teste para bubble');
  });

  test('deve abrir modo de edição ao clicar em editar', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Encontrar botão de editar (segundo botão)
    const editButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(1);
    
    await editButton.click();
    await page.waitForTimeout(200);
    
    // Verificar que aparece um textarea de edição
    const editInput = page.locator('textarea').filter({ 
      hasText: 'Mensagem de teste para bubble' 
    });
    await expect(editInput).toBeVisible();
    
    // Verificar que aparecem botões Cancelar e Salvar
    await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /salvar/i })).toBeVisible();
  });

  test('deve cancelar edição ao clicar em cancelar', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Abrir edição
    const editButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(1);
    await editButton.click();
    await page.waitForTimeout(200);
    
    // Clicar em cancelar
    await page.getByRole('button', { name: /cancelar/i }).click();
    await page.waitForTimeout(200);
    
    // Verificar que voltou ao modo normal
    await expect(page.getByText('Mensagem de teste para bubble')).toBeVisible();
    await expect(page.getByRole('button', { name: /cancelar/i })).not.toBeVisible();
  });

  test('deve salvar edição ao clicar em salvar', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Abrir edição
    const editButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(1);
    await editButton.click();
    await page.waitForTimeout(200);
    
    // Editar mensagem
    const editInput = page.locator('textarea').filter({ 
      hasText: 'Mensagem de teste para bubble' 
    });
    await editInput.fill('Mensagem editada');
    
    // Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    await page.waitForTimeout(200);
    
    // Verificar que a mensagem foi atualizada
    await expect(page.getByText('Mensagem editada')).toBeVisible();
    await expect(page.getByText('Mensagem de teste para bubble')).not.toBeVisible();
  });

  test('deve ter botão salvar desabilitado quando não há mudanças', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Abrir edição
    const editButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(1);
    await editButton.click();
    await page.waitForTimeout(200);
    
    // Verificar que o botão salvar está desabilitado (sem mudanças)
    const saveButton = page.getByRole('button', { name: /salvar/i });
    await expect(saveButton).toBeDisabled();
  });

  test('deve permitir salvar com Enter', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Abrir edição
    const editButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(1);
    await editButton.click();
    await page.waitForTimeout(200);
    
    // Editar e pressionar Enter
    const editInput = page.locator('textarea').filter({ 
      hasText: 'Mensagem de teste para bubble' 
    });
    await editInput.fill('Salvo com Enter');
    await editInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Verificar que foi salvo
    await expect(page.getByText('Salvo com Enter')).toBeVisible();
  });

  test('deve permitir cancelar com Escape', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Abrir edição
    const editButton = page.locator('button').filter({
      has: page.locator('svg')
    }).nth(1);
    await editButton.click();
    await page.waitForTimeout(200);
    
    // Editar e pressionar Escape
    const editInput = page.locator('textarea').filter({ 
      hasText: 'Mensagem de teste para bubble' 
    });
    await editInput.fill('Texto que será cancelado');
    await editInput.press('Escape');
    await page.waitForTimeout(200);
    
    // Verificar que voltou ao modo normal sem salvar
    await expect(page.getByText('Mensagem de teste para bubble')).toBeVisible();
    await expect(page.getByText('Texto que será cancelado')).not.toBeVisible();
  });

  test('deve reenviar mensagem ao clicar em reenviar', async ({ page }) => {
    const bubble = page.getByText('Mensagem de teste para bubble').locator('..');
    await bubble.hover();
    await page.waitForTimeout(200);
    
    // Contar mensagens antes
    const messagesBefore = await page.getByText(/mensagem de teste para bubble/i).count();
    
    // Clicar em reenviar
    const resendButton = page.locator('button').filter({
      has: page.locator('svg')
    }).first();
    await resendButton.click();
    await page.waitForTimeout(300);
    
    // Verificar que uma nova mensagem foi adicionada
    const messagesAfter = await page.getByText(/mensagem de teste para bubble/i).count();
    expect(messagesAfter).toBeGreaterThan(messagesBefore);
  });
});
