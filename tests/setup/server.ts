import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Configurar MSW server para testes Node.js (Playwright)
 * @see https://mswjs.io/docs/getting-started/integrate/node
 */
export const server = setupServer(...handlers);
