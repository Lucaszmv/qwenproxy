# QwenProxy Architecture Rules

## 1. Source of Truth
Este diretório `.agent/` é a fonte da verdade para o comportamento do assistente neste projeto.

## 2. Tecnologias
- **Backend**: Hono (TypeScript/Node.js)
- **Automação**: Playwright
- **Provedores**: 
  - Qwen.ai (via `services/qwen.ts`)
  - NVIDIA NIM (via `services/nvidia.ts`)

## 3. Padrões de Implementação
- **Interceptação de Headers**: Sempre use o `uiLock` em `playwright.ts` ao interagir com a interface para evitar conflitos de navegação.
- **Streaming**: Todas as respostas de chat devem suportar streaming compatível com a API da OpenAI.
- **Economia de Recursos**: Prefira usar a página ativa do Playwright para obter tokens em vez de criar novas instâncias para cada request.

## 4. Governança
- Qualquer alteração na lógica de rede deve ser validada contra os endpoints reais (Qwen ou NVIDIA).
- Mantenha o suporte a ferramentas (Tools) consistente através do mapeamento em `chat.ts`.
