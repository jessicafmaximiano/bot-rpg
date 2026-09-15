# Assistente de D&D 5e para Telegram

Bot em JavaScript e Node.js para consultar regras e criar ideias de personagens, encontros e aventuras. Integra a API do Telegram à Groq e acrescenta referências locais ao contexto do modelo.

## Capacidades implementadas

- Respostas por modelo de linguagem, com persona definida em `src/ai.js`.
- Seleção de até três arquivos de referência por palavras-chave.
- Histórico persistido por chat, limitado a um número configurável de turnos.
- Lista opcional de usuários autorizados.
- Limite de mensagens por minuto por conversa.
- Divisão de respostas longas e tentativa de envio como texto puro quando o envio formatado falha.

## Organização

| Caminho | Responsabilidade |
| --- | --- |
| `index.js` | Inicialização |
| `src/telegram.js` | Mensagens, comandos e controle de acesso |
| `src/ai.js` | Requisição à Groq e instruções do modelo |
| `src/knowledge.js` | Seleção de contexto por palavras-chave |
| `src/history.js` | Persistência do histórico |
| `src/rateLimit.js` | Janela de requisições por chat |
| `knowledge/` | Referências locais |
| `scripts/test-chat.js` | Conversa no terminal com a API real |
| `test/core.test.js` | Testes locais sem API |
| `dnd-bot.service` | Exemplo de serviço systemd |

## Executar localmente

O projeto declara Node.js 18 ou superior em `package.json`. Para uso contínuo, escolha uma versão com suporte de segurança e valide as dependências nela.

```bash
git clone https://github.com/jessicafmaximiano/bot-rpg.git
cd bot-rpg
npm install
cp .env.example .env
```

No Windows, copie `.env.example` para `.env` pelo explorador ou pelo comando equivalente.

1. Crie o bot pelo BotFather e preencha `TELEGRAM_BOT_TOKEN`.
2. Obtenha uma chave da Groq e preencha `GROQ_API_KEY`.
3. Confira se o modelo configurado está disponível na conta.
4. Para restringir o acesso, preencha `TELEGRAM_ALLOWED_IDS` com os IDs autorizados.
5. Execute `npm start` e envie `/start` ao bot.

Preços, cotas e disponibilidade de modelos dependem do provedor. Usar a API oficial do Telegram não elimina limites ou possíveis restrições de conta.

## Configuração

| Variável | Uso | Padrão |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Token do bot | Obrigatório |
| `GROQ_API_KEY` | Chave da Groq | Obrigatória |
| `GROQ_MODEL` | Modelo solicitado | Consulte `src/ai.js` e `.env.example` |
| `TELEGRAM_ALLOWED_IDS` | IDs separados por vírgula | Vazio permite qualquer usuário |
| `RATE_LIMIT_PER_MINUTE` | Limite positivo por conversa | 15 |
| `HISTORY_TURNS` | Quantidade positiva de trocas retidas | 8 |

## Comandos

- `/start` e `/ajuda`: instruções de uso.
- `/limpar`: remove o histórico do chat.
- Texto livre: solicita uma resposta à IA.

O histórico é separado por **chat**, não por usuário dentro de um grupo. Participantes de um mesmo grupo compartilham esse contexto.

## Testes

```bash
npm test
```

Usam apenas módulos nativos do Node.js; não precisam de `npm install`, tokens ou rede. Cobrem limite por chat, reinício da janela aos 60 segundos, configuração inválida, retenção de turnos, isolamento entre chats e persistência após limpeza. Os arquivos de teste são temporários e não usam o histórico real.

`npm run chat` é um teste manual com a API real da Groq e pode consumir cota. Os testes locais não validam Telegram, Groq ou controle de acesso ponta a ponta.

## Recuperação de contexto e limitações

A busca é lexical: normaliza acentos, conta palavras-chave e seleciona referências. Não usa embeddings nem banco vetorial. O orçamento de 7.000 caracteres no código conta o conteúdo dos arquivos, não os títulos e instruções adicionados ao prompt. Um arquivo que exceda o orçamento restante é descartado.

As referências locais e a resposta do modelo podem conter imprecisões. A seleção de contexto não garante correção nem substitui a conferência das regras.

A persistência usa JSON e troca atômica do arquivo em um único processo. Não execute várias instâncias apontando para o mesmo histórico. A escrita síncrona pode bloquear brevemente o processo quando o histórico cresce. Falhas de disco são registradas no console; ainda não há banco de dados, fila ou política automática de retenção de chats inativos.

## Implantação

O arquivo `dnd-bot.service` é um exemplo. Ajuste usuário, diretório e caminho do Node antes de instalar o serviço. O bot usa long polling e precisa de saída de rede para Telegram e Groq. Mantenha apenas uma instância consumindo o mesmo token.

## Privacidade

Não versione `.env` nem `data/`. As mensagens são enviadas à Groq e o histórico fica no disco. O código também registra IDs e trechos de mensagens no console. Use conversas de teste sem dados sensíveis e restrinja o acesso aos arquivos e logs.

## Evolução planejada

Testes de autorização e falhas de API, fila por chat, redução de dados nos logs e persistência adequada a múltiplas instâncias são próximos passos; não estão cobertos nesta versão.
