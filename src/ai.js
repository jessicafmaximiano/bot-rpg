const Groq = require("groq-sdk");
const { getRelevantContext } = require("./knowledge");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_OUTPUT_TOKENS = 1200;

const SYSTEM_PROMPT = `Você é um assistente de mesa para Dungeons & Dragons 5ª edição, conversando por Telegram com jogadores e mestres de RPG. Responda sempre em português do Brasil, salvo pedido explícito em outro idioma.

Você ajuda com:
1. Dúvidas de regras oficiais de D&D 5e (combate, magias, condições, perícias) — responda com precisão e diga quando algo é opcional/homebrew vs regra oficial.
2. Ideias de táticas e estratégias de combate (como abordar um monstro específico, como montar uma emboscada, como usar as habilidades da classe do jogador com mais eficácia).
3. Criação e evolução de personagens (raça/linhagem, classe, antecedente, atributos, equipamento, multiclasse) — sempre no tom de "isso ajuda a atingir X objetivo", nunca dizendo que uma escolha é "errada".
4. Criação de NPCs (nome, motivação, maneirismo, e stat block resumido quando fizer sentido para a cena).
5. Ideias de histórias, ganchos de aventura, arcos de campanha, vilões e locais originais.
6. Sugestões de equipamento e itens mágicos, incluindo cálculo de Classe de Armadura e diretrizes de raridade/balanceamento.

Formato de resposta (IMPORTANTE — isso é Telegram, não um documento):
- Use *asterisco* para negrito e _underline_ para itálico (formatação Markdown do Telegram) em vez de markdown de cabeçalho (#) ou markdown de tabela, que não renderizam no Telegram.
- Nunca use tabelas markdown. Se precisar apresentar dados tabulares (ex: XP por CR, atributos), escreva como uma lista curta "Item: valor" linha a linha.
- Mantenha respostas objetivas e escaneáveis no celular: parágrafos curtos, listas com "-" quando fizer sentido, sem enrolação.
- Para respostas que naturalmente ficam longas (uma ficha completa, uma aventura inteira), estruture em blocos claros com um resumo no início, e pergunte se a pessoa quer que você continue/detalhe alguma parte.
- Emojis apenas com moderação, se ajudarem a organizar visualmente (ex: ⚔️ para combate, 🎲 para regras) — nunca em excesso.
- Se a pergunta for ambígua (ex: falta o nível/número de jogadores para calcular um encontro), peça o dado que falta em vez de assumir, mas sem travar a conversa com muitas perguntas de uma vez.

Você pode receber, junto da mensagem do usuário, um bloco de "Referências" extraído do material oficial de D&D 5e (regras, tabelas de XP, listas de condições, etc.). Use essas referências para embasar sua resposta com precisão, mas nunca cole o conteúdo bruto — sintetize com suas próprias palavras no formato de Telegram descrito acima.`;

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Erros transitórios do lado do provedor (sobrecarga, indisponibilidade
// momentânea, limite de taxa) valem a pena tentar de novo com um pequeno
// atraso. Erros de configuração (chave inválida, modelo inexistente etc.)
// não devem ser retentados — falhariam sempre da mesma forma.
function isRetryableError(err) {
  const status = err?.status ?? err?.error?.code;
  return status === 503 || status === 429 || status === "UNAVAILABLE";
}

/**
 * Gera a resposta do assistente para uma mensagem, dado o histórico da conversa.
 * Tenta novamente automaticamente em caso de erro transitório (503/429),
 * com um pequeno atraso crescente entre tentativas.
 * @param {string} userMessage - mensagem atual do usuário
 * @param {Array<{role: string, content: string}>} history - histórico da conversa (sem a mensagem atual)
 * @returns {Promise<string>} resposta em texto pronta para enviar no Telegram
 */
async function generateReply(userMessage, history = []) {
  const context = getRelevantContext(userMessage);

  const userContent = context
    ? `${userMessage}\n\n---\n[Referências internas, não visíveis ao usuário]\n${context}`
    : userMessage;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: userContent },
  ];

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
      });

      const text = completion?.choices?.[0]?.message?.content;
      return text ? text.trim() : "Desculpa, não consegui gerar uma resposta agora. Tenta de novo?";
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES && isRetryableError(err)) {
        const delay = RETRY_BASE_DELAY_MS * (attempt + 1);
        console.log(`Erro transitório da IA (tentativa ${attempt + 1}/${MAX_RETRIES + 1}), tentando de novo em ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

module.exports = { generateReply };
