import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes de integração e E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Executar testes em paralelo */
  fullyParallel: true,
  /* Falhar no CI se usar test.only */
  forbidOnly: !!process.env.CI,
  /* Retry no CI se falhar */
  retries: process.env.CI ? 2 : 0,
  /* Limitar workers no CI, usar todos localmente */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter para usar */
  reporter: [
    ['html'],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em navegação como await page.goto('/') */
    baseURL: 'http://localhost:3000',
    /* Coletar trace quando retentar o teste */
    trace: 'on-first-retry',
    /* Screenshot apenas quando falhar */
    screenshot: 'only-on-failure',
  },

  /* Configurar projetos para múltiplos browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Executar servidor de desenvolvimento antes de iniciar os testes */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
