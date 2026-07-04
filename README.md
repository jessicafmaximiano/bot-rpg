# Bot de D&D 5e para Telegram

Bot de Telegram que responde dúvidas de regras, dá ideias de táticas de combate, ajuda a criar personagens, NPCs, histórias/aventuras e sugere equipamentos — tudo para Dungeons & Dragons 5ª edição, em português.

Usa a [API oficial de bots do Telegram](https://core.telegram.org/bots) (gratuita, sem risco de bloqueio) e a [API gratuita da Groq](https://console.groq.com/keys) (modelos abertos como Llama, sem cartão de crédito e sem cobrança) para gerar as respostas, com uma base de conhecimento de D&D 5e (regras, tabelas de XP, condições, itens mágicos etc.) injetada automaticamente no contexto quando relevante.

> **Por que Groq (e não Gemini)?** O Google passou a exigir uma conta de faturamento vinculada (cartão cadastrado) mesmo para uso dentro da cota gratuita dos modelos mais novos do Gemini. A Groq mantém uma camada gratuita de verdade, sem pedir cartão.

## Por que Telegram (e não WhatsApp)?

Uma versão anterior deste projeto usava WhatsApp via Baileys (biblioteca não-oficial). A versão Telegram é melhor em praticamente tudo para este caso de uso: a API é oficial e gratuita, o bot tem identidade própria (não "vira" o seu número pessoal), não há risco de bloqueio de conta, não precisa de pareamento por QR Code, e a conexão é muito mais estável.

## Estrutura do projeto

```
dnd5e-telegram-bot/
├── index.js                 # ponto de entrada
├── src/
│   ├── telegram.js           # conexão com o Telegram (long polling) e roteamento
│   ├── ai.js                 # chamada à API da Groq + persona/system prompt
│   ├── knowledge.js          # recuperação de contexto (mini-RAG por palavra-chave)
│   ├── history.js             # memória de conversa por chat, persistida em data/history.json
│   └── rateLimit.js           # limite de mensagens por minuto por conversa
├── knowledge/                 # base de conhecimento de D&D 5e
├── scripts/test-chat.js       # testa a IA no terminal, sem precisar do Telegram
└── dnd-bot.service            # exemplo de serviço systemd
```

## 1. Criar o bot no Telegram (2 minutos)

1. No Telegram, procure por **@BotFather** (o de selo azul de verificado).
2. Mande `/newbot`.
3. Escolha um **nome de exibição** (ex: `Mestre D&D 5e`).
4. Escolha um **username** único terminando em `bot` (ex: `MestreDnD5eBot`).
5. O BotFather responde com o **token** do bot (formato `123456789:AAH...`). Guarde-o — é a "senha" do bot.

## 2. Criar a chave de API gratuita da Groq (2 minutos)

1. Acesse [console.groq.com/keys](https://console.groq.com/keys) e entre com uma conta Google/GitHub/e-mail.
2. Clique em **Create API Key**, dê um nome (ex: `dnd-bot`) e copie a chave gerada (começa com `gsk_...`). Guarde-a — ela só aparece uma vez.
3. Não é pedido cartão de crédito em nenhum momento.

## 3. Configurar e testar

```bash
npm install
cp .env.example .env
# edite .env: cole o TELEGRAM_BOT_TOKEN e a GROQ_API_KEY
npm start
```

No Telegram, procure o username do seu bot, abra a conversa e mande `/start`. Ele deve responder com a mensagem de ajuda.

Para testar só a IA no terminal (sem Telegram): `npm run chat`.

## 4. Restringir o bot só a você

Qualquer pessoa que descobrir o username do bot pode conversar com ele — a menos que você preencha `TELEGRAM_ALLOWED_IDS`. Para descobrir seu ID:

1. Rode o bot e mande qualquer mensagem para ele.
2. No log do servidor aparece: `Mensagem de @seuusuario (id 123456789): ...`
3. Copie esse número para o `.env`: `TELEGRAM_ALLOWED_IDS=123456789`
4. Reinicie o bot. Mensagens de qualquer outra pessoa passam a ser ignoradas (ficam só registradas no log).

Para autorizar mais pessoas no futuro (amigos da mesa, clientes), adicione os IDs separados por vírgula.

## 5. Deploy contínuo (24/7) na Oracle Cloud

O bot não abre nenhuma porta de rede (só faz conexões de saída para o Telegram e para a API da Groq), então não é preciso mexer em firewall/Security Lists.

```bash
sudo cp dnd-bot.service /etc/systemd/system/dnd-bot.service
sudo systemctl daemon-reload
sudo systemctl enable dnd-bot
sudo systemctl start dnd-bot
```

Logs: `sudo journalctl -u dnd-bot -f` — status: `sudo systemctl status dnd-bot`.

## Configuração (.env)

| Variável | O que faz | Padrão |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Token do bot gerado pelo @BotFather (obrigatório) | — |
| `GROQ_API_KEY` | Chave de API gratuita da Groq, sem cartão (obrigatória) | — |
| `GROQ_MODEL` | Modelo Groq usado para gerar respostas | `llama-3.3-70b-versatile` |
| `TELEGRAM_ALLOWED_IDS` | IDs de usuário autorizados (vazio = qualquer um) | vazio |
| `RATE_LIMIT_PER_MINUTE` | Máximo de mensagens por minuto por conversa | `15` |
| `HISTORY_TURNS` | Quantas trocas de contexto manter por conversa | `8` |

## Comandos do bot

- Qualquer mensagem de texto livre → vai para a IA.
- `/start` ou `/ajuda` → mostra exemplos de uso.
- `/limpar` → apaga o histórico daquela conversa.

## Como o bot usa a base de conhecimento

A pasta `knowledge/` tem material de referência de D&D 5e (tabelas de XP/CR, condições oficiais, raças/classes, itens mágicos, etc.). A cada mensagem, `src/knowledge.js` faz uma busca por palavra-chave para escolher até 3 arquivos relevantes e injeta o conteúdo no contexto enviado à IA — assim as respostas ficam embasadas nas regras reais.

## Vender/expandir no futuro

Diferente do WhatsApp, no Telegram isso é simples: cada cliente pode ter acesso ao **mesmo bot** (basta adicionar o ID dele em `TELEGRAM_ALLOWED_IDS` — o histórico já é isolado por conversa), ou você pode criar **um bot separado por cliente** no @BotFather (cada um com seu token) e rodar múltiplas instâncias do projeto. Nenhuma mudança de arquitetura é necessária.

## Customização

- **Persona/tom de resposta**: edite `SYSTEM_PROMPT` em `src/ai.js`.
- **Novos temas de conhecimento**: adicione arquivos em `knowledge/` e registre as palavras-chave em `src/knowledge.js` (`KNOWLEDGE_MAP`).
