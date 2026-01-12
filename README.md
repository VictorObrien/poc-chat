# POC Chat - Chat de Agents de IA

Projeto de prova de conceito (POC) para um chat de agents de IA integrado com a API do OpenRouter. Desenvolvido com Next.js e TypeScript, seguindo uma arquitetura escalável e moderna.

## 🚀 Stack Tecnológica

### Core
- **[Next.js 16.1.1](https://nextjs.org/)** - Framework React com App Router
- **[React 19.2.3](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipagem estática

### Gerenciamento de Estado e Dados
- **[TanStack Query 5.90.16](https://tanstack.com/query)** - Gerenciamento de estado de servidor e cache
- **[Zustand 5.0.10](https://zustand-demo.pmnd.rs/)** - Estado global leve

### UI e Estilização
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI (estilo New York)
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones
- **[class-variance-authority](https://cva.style/)** - Variantes de componentes

### IA e Integração
- **[Vercel AI SDK 6.0.28](https://sdk.vercel.ai/)** - SDK para integração com APIs de IA
- **OpenRouter** - API para acesso a múltiplos modelos de IA

### Utilitários
- **[Zod 4.3.5](https://zod.dev/)** - Validação de schemas e type safety
- **[date-fns 4.1.0](https://date-fns.org/)** - Manipulação de datas
- **[react-error-boundary 6.0.3](https://github.com/bvaughn/react-error-boundary)** - Tratamento de erros

### Testes
- **[Playwright 1.57.0](https://playwright.dev/)** - Testes de integração e E2E
- **[MSW 2.12.7](https://mswjs.io/)** - Mock Service Worker para mockar APIs

## 📁 Estrutura do Projeto

```
poc-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Página inicial
│   │   └── globals.css        # Estilos globais
│   ├── components/            # Componentes React
│   │   └── ui/               # Componentes shadcn/ui
│   ├── lib/                   # Utilitários e helpers
│   │   └── utils.ts          # Funções utilitárias (cn, etc.)
│   ├── providers/             # React Providers
│   │   └── QueryProvider.tsx # TanStack Query Provider
│   └── hooks/                 # Custom hooks (a criar)
│   └── stores/                # Zustand stores (a criar)
│   └── schemas/               # Zod schemas (a criar)
│   └── api/                   # Clientes de API (a criar)
│
├── tests/                      # Testes de integração e E2E
│   ├── integration/           # Testes de integração
│   │   ├── chat/             # Testes de chat
│   │   ├── api/              # Testes de API routes
│   │   └── agents/           # Testes de agents
│   ├── e2e/                  # Testes end-to-end
│   └── setup/                # Configurações de teste
│       ├── test-setup.ts
│       ├── handlers.ts       # MSW handlers
│       └── server.ts         # MSW server
│
├── public/                    # Arquivos estáticos
├── components.json            # Configuração shadcn/ui
├── playwright.config.ts       # Configuração Playwright
├── tsconfig.json             # Configuração TypeScript
└── package.json              # Dependências e scripts
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Cria build de produção
pnpm start        # Inicia servidor de produção
pnpm lint         # Executa ESLint
```

### Testes
```bash
pnpm test                    # Executa todos os testes
pnpm test:ui                 # Executa testes com UI interativa
pnpm test:debug              # Executa testes em modo debug
pnpm test:integration        # Executa apenas testes de integração
pnpm test:e2e                # Executa apenas testes E2E
pnpm test:headed             # Executa testes com browser visível
```

## 🚀 Getting Started

### Pré-requisitos
- Node.js 20+
- pnpm (ou npm/yarn)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd poc-chat
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
# Edite .env.local com suas chaves de API
```

4. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Instalar Browsers do Playwright (para testes)

```bash
pnpm exec playwright install chromium
# ou para todos os browsers:
pnpm exec playwright install
```

## 🧪 Testes

Este projeto utiliza testes de integração e E2E com Playwright. Veja mais detalhes em [tests/README.md](./tests/README.md).

### Executar Testes

```bash
# Todos os testes
pnpm test

# Apenas testes de integração
pnpm test:integration

# Apenas testes E2E
pnpm test:e2e

# Com UI interativa
pnpm test:ui
```

## 📦 Adicionar Componentes shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

Exemplo:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

## 🏗️ Arquitetura

O projeto segue uma arquitetura escalável com:

- **Separação de responsabilidades**: Componentes, hooks, stores, e API clients separados
- **Type safety**: TypeScript + Zod para validação end-to-end
- **Cache inteligente**: TanStack Query para gerenciamento de estado de servidor
- **Estado global**: Zustand para estado compartilhado
- **Testes focados**: Apenas testes de integração e E2E para validar fluxos completos

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Playwright Documentation](https://playwright.dev/)
- [OpenRouter API](https://openrouter.ai/docs)

## 📝 Licença

Este é um projeto de prova de conceito (POC).
