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
- **[fal.ai Client 1.8.3](https://fal.ai/)** - SDK para geração de imagens com IA

### Utilitários

- **[Zod 4.3.5](https://zod.dev/)** - Validação de schemas e type safety
- **[date-fns 4.1.0](https://date-fns.org/)** - Manipulação de datas
- **[react-error-boundary 6.0.3](https://github.com/bvaughn/react-error-boundary)** - Tratamento de erros
- **[react-markdown 10.1.0](https://remarkjs.github.io/react-markdown/)** - Renderização de markdown

### Testes

- **[Playwright 1.57.0](https://playwright.dev/)** - Testes de integração e E2E
- **[MSW 2.12.7](https://mswjs.io/)** - Mock Service Worker para mockar APIs

## 📁 Estrutura do Projeto

```
poc-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── chat/          # Rota de chat (/api/chat)
│   │   │   └── fal/           # Rota de geração de imagens (/api/fal/generate)
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Página inicial
│   │   └── globals.css        # Estilos globais
│   ├── components/            # Componentes React
│   │   ├── chat/             # Componentes de chat
│   │   │   ├── ChatContainer.tsx    # Container principal do chat
│   │   │   ├── ChatSection.tsx      # Seção de mensagens e input
│   │   │   ├── ChatInput.tsx         # Input de mensagens
│   │   │   ├── MessageList.tsx      # Lista de mensagens
│   │   │   ├── ChatBubble.tsx        # Bolha de mensagem
│   │   │   ├── QuickActions.tsx      # Ações rápidas
│   │   │   ├── SystemMessage.tsx     # Mensagens do sistema
│   │   │   ├── GeneratedImage.tsx    # Imagem gerada
│   │   │   ├── ImageSkeleton.tsx     # Skeleton de carregamento
│   │   │   └── hooks/                # Hooks específicos do chat
│   │   └── ui/               # Componentes shadcn/ui
│   ├── lib/                   # Utilitários e helpers
│   │   ├── api/              # Clientes de API
│   │   │   └── openrouter.ts # Serviço OpenRouter
│   │   ├── types/            # Tipos TypeScript
│   │   │   ├── openrouter.ts # Tipos da API OpenRouter
│   │   │   └── fal.ts        # Tipos para fal.ai e Quick Actions
│   │   ├── prompts/          # Templates de prompts
│   │   │   └── imagePrompts.ts # Prompts para geração de imagens
│   │   └── utils.ts          # Funções utilitárias (cn, etc.)
│   ├── stores/                # Zustand stores
│   │   └── conversationFlowStore.ts # Store para fluxo de conversa guiado
│   ├── providers/             # React Providers
│   │   └── QueryProvider.tsx # TanStack Query Provider
│   └── hooks/                 # Custom hooks
│       ├── useChat.ts        # Hook para gerenciar chat
│       ├── useChatAPI.ts     # Hook para integração com API
│       └── useImageGeneration.ts # Hook para geração de imagens
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

**Variáveis de ambiente necessárias:**

- `OPENROUTER_API_KEY`: Sua chave de API do OpenRouter (obtenha em https://openrouter.ai/keys)
- `FAL_AI_API_KEY` ou `FAL_KEY`: Sua chave de API do fal.ai (obtenha em https://fal.ai/dashboard)
- `NEXT_PUBLIC_APP_URL` (opcional): URL da aplicação para referência na API
- `NEXT_PUBLIC_APP_NAME` (opcional): Nome da aplicação para referência na API

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
- **Estado global**: Zustand para estado compartilhado (conversationFlowStore)
- **Fluxo guiado**: Sistema de conversa guiado para coletar informações do usuário
- **UI/UX moderna**: Interface responsiva com skeleton loading e feedback visual
- **Testes focados**: Apenas testes de integração e E2E para validar fluxos completos

### Fluxo de Dados

1. **Quick Actions** → Inicia fluxo guiado no `conversationFlowStore`
2. **Fluxo Guiado** → Coleta respostas do usuário via `SystemMessage` e `ChatInput`
3. **Geração de Prompt** → `imagePrompts.ts` constrói prompt técnico otimizado
4. **API Route** → `/api/fal/generate` processa e chama fal.ai
5. **Hook de Geração** → `useImageGeneration` gerencia estado e exibe resultado
6. **Componente de Imagem** → `GeneratedImage` exibe imagem com ações

## 🔌 Integrações com APIs de IA

O projeto está integrado com duas APIs principais para diferentes funcionalidades:

### 1. OpenRouter - Chat e Conversação

O projeto está integrado com a API do OpenRouter para acesso a múltiplos modelos de IA usando o **Vercel AI SDK**. A integração foi implementada seguindo as melhores práticas:

#### Arquitetura da Integração

1. **API Route** (`/api/chat`): Rota do Next.js que atua como proxy seguro, mantendo a API key no servidor
2. **Serviço OpenRouter** (`src/lib/api/openrouter.ts`): Cliente usando Vercel AI SDK com o provider `@openrouter/ai-sdk-provider`
3. **Tipos TypeScript** (`src/lib/types/openrouter.ts`): Tipos completos para todas as respostas da API
4. **Hook useChatAPI** (`src/hooks/useChatAPI.ts`): Hook React que utiliza TanStack Query para gerenciar chamadas à API

#### SDK Utilizado

- **Vercel AI SDK** (`ai@6.0.28`): SDK oficial da Vercel para integração com modelos de IA
- **OpenRouter Provider** (`@openrouter/ai-sdk-provider@1.5.4`): Provider oficial do OpenRouter para o Vercel AI SDK

#### Como Funciona

1. O usuário digita uma mensagem no `ChatInput`
2. A mensagem é enviada para `/api/chat` via `useChatAPI`
3. A API route valida e usa o Vercel AI SDK com o provider OpenRouter para gerar a resposta
4. A resposta é processada e exibida no chat
5. O histórico de conversa é mantido automaticamente

#### Configuração

1. Obtenha sua API key em [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Configure a variável `OPENROUTER_API_KEY` no arquivo `.env.local`
3. O modelo padrão é `openai/gpt-4o-mini`, mas pode ser customizado na requisição

#### Modelos Disponíveis

O OpenRouter suporta múltiplos modelos. Você pode especificar o modelo na requisição ou alterar o padrão em `src/lib/api/openrouter.ts`.

Veja a lista completa de modelos em: [https://openrouter.ai/models](https://openrouter.ai/models)

### 2. fal.ai - Geração de Imagens

O projeto está integrado com a API do **fal.ai** para geração de imagens usando modelos de IA avançados como GPT-Image 1.5.

#### Arquitetura da Integração

1. **API Route** (`/api/fal/generate`): Rota do Next.js que atua como proxy seguro, mantendo a API key no servidor
2. **Tipos TypeScript** (`src/lib/types/fal.ts`): Tipos completos para Quick Actions, modelos e configurações
3. **Templates de Prompts** (`src/lib/prompts/imagePrompts.ts`): Sistema de construção de prompts técnicos otimizados
4. **Store de Fluxo** (`src/stores/conversationFlowStore.ts`): Gerenciamento de estado para fluxos de conversa guiados
5. **Hook useImageGeneration** (`src/hooks/useImageGeneration.ts`): Hook React para gerenciar geração de imagens

#### Quick Actions

O sistema possui **Quick Actions** pré-configuradas que iniciam fluxos de conversa guiados:

- **Criar imagem Instagram**: Gera imagens para feed (post) ou stories
- **Imagem TikTok**: Gera thumbnails para vídeos do TikTok
- **Nova Conversa**: Inicia uma nova conversa
- **Personalizar**: Personaliza a experiência (em desenvolvimento)

#### Fluxo de Conversa Guiado

1. Usuário seleciona uma Quick Action (ex: "Criar imagem Instagram")
2. Sistema inicia um fluxo guiado com perguntas específicas:
   - Para Instagram: "Para Store ou Post?"
   - Para TikTok: Assume que é thumbnail de vídeo
3. Sistema coleta as respostas do usuário
4. Constrói um prompt técnico otimizado combinando:
   - Tipo de ação e formato
   - Descrição do usuário
   - Dimensões apropriadas
   - Diretrizes de estilo específicas da plataforma
5. Envia o prompt para a API fal.ai
6. Exibe a imagem gerada com opções de copiar e baixar

#### Modelos Suportados

- **GPT-Image 1.5** (`fal-ai/gpt-image-1.5`): Modelo atual para geração de imagens de alta qualidade
- **Flux Schnell** (`fal-ai/flux/schnell`): Modelo rápido (alternativa)
- **Flux Pro** (`fal-ai/flux-pro/v1.1`): Modelo premium (requer créditos pagos)

#### Dimensões por Formato

- **Instagram Post**: 1080x1080 (quadrado)
- **Instagram Story**: 1080x1920 (vertical)
- **TikTok Thumbnail**: 1080x1920 (vertical)

#### Configuração

1. Obtenha sua API key em [https://fal.ai/dashboard](https://fal.ai/dashboard)
2. Configure a variável `FAL_AI_API_KEY` ou `FAL_KEY` no arquivo `.env.local`
3. Os modelos são configurados em `src/lib/types/fal.ts` no objeto `FAL_MODELS`

#### Recursos Visuais

- **Skeleton de Carregamento**: Exibido durante a geração da imagem
- **Imagem Gerada**: Exibida com opções de copiar e baixar
- **Interface Responsiva**: Adaptada para diferentes tamanhos de tela

## 📚 Recursos

### Documentação Geral

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

### IA e Integrações

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [OpenRouter AI SDK Provider](https://github.com/OpenRouterTeam/ai-sdk-provider)
- [fal.ai Documentation](https://fal.ai/docs)
- [fal.ai Models](https://fal.ai/models)
- [GPT-Image 1.5 Guide](https://fal.ai/learn/devs/gpt-image-1-5-prompt-guide)

## 📝 Licença

Este é um projeto de prova de conceito (POC).
