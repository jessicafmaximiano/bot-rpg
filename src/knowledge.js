// Recuperação simples de conhecimento (mini-RAG por palavra-chave).
// Em vez de mandar todos os arquivos de referência de D&D 5e em toda
// chamada (caro e desnecessário), escolhemos por palavras-chave quais
// arquivos são relevantes para a mensagem do usuário e só esses entram
// no contexto enviado para a IA.

const fs = require("fs");
const path = require("path");

const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge");

// Mapa: arquivo -> lista de palavras-chave (sem acento, minúsculas) que
// disparam a inclusão desse arquivo no contexto.
const KNOWLEDGE_MAP = [
  {
    file: "mestre-jogo/npcs.md",
    keywords: ["npc", "personagem nao jogavel", "vilao secundario", "personalidade", "nome de npc", "capanga"],
  },
  {
    file: "mestre-jogo/encontros.md",
    keywords: ["encontro", "balancear", "xp", "cr ", "dificuldade do encontro", "quantos monstros", "orcamento de xp"],
  },
  {
    file: "mestre-jogo/masmorras.md",
    keywords: ["masmorra", "dungeon", "armadilha", "tesouro", "sala"],
  },
  {
    file: "mestre-jogo/improviso.md",
    keywords: ["improviso", "improvisar", "meus jogadores fizeram", "reviravolta", "fugiu do roteiro", "encontro aleatorio"],
  },
  {
    file: "personagens/racas-classes.md",
    keywords: ["raca", "classe", "linhagem", "subclasse", "dado de vida", "antecedente", "background"],
  },
  {
    file: "personagens/equipamento.md",
    keywords: ["equipamento", "arma", "armadura", "escudo", "ca ", "classe de armadura", "item inicial", "ouro inicial"],
  },
  {
    file: "personagens/otimizacao.md",
    keywords: ["otimizar", "build", "multiclasse", "atributo", "distribuir pontos", "tatica", "estrategia", "combo"],
  },
  {
    file: "regras/combate.md",
    keywords: ["combate", "acao bonus", "reacao", "ataque de oportunidade", "cobertura", "critico", "teste de morte", "iniciativa"],
  },
  {
    file: "regras/magias.md",
    keywords: ["magia", "conjurar", "espaco de magia", "concentracao", "ritual", "contramagia", "dissipar magia", "area de efeito"],
  },
  {
    file: "regras/condicoes.md",
    keywords: ["condicao", "agarrado", "amedrontado", "atordoado", "caido", "cego", "enfeiticado", "envenenado", "exaustao", "invisivel", "paralisado", "petrificado", "restringido", "surdo", "inconsciente"],
  },
  {
    file: "regras/pericias.md",
    keywords: ["pericia", "teste de habilidade", "percepcao passiva", "cd ", "dificuldade do teste"],
  },
  {
    file: "aventuras/arcos-campanha.md",
    keywords: ["campanha", "arco de historia", "subtrama", "foreshadowing", "ritmo da sessao"],
  },
  {
    file: "aventuras/locais.md",
    keywords: ["cidade", "vila", "regiao", "local", "plano alternativo", "reino"],
  },
  {
    file: "aventuras/itens-magicos.md",
    keywords: ["item magico", "artefato", "sintonia", "attunement", "raridade"],
  },
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos
}

const fileCache = new Map();
function readKnowledgeFile(relativePath) {
  if (fileCache.has(relativePath)) return fileCache.get(relativePath);
  const fullPath = path.join(KNOWLEDGE_DIR, relativePath);
  const content = fs.readFileSync(fullPath, "utf-8");
  fileCache.set(relativePath, content);
  return content;
}

const MAX_CONTEXT_CHARS = 7000;
const MAX_FILES = 3;

/**
 * Retorna um bloco de texto com o conteúdo dos arquivos de referência
 * mais relevantes para a mensagem do usuário, ou string vazia se nada bateu.
 */
function getRelevantContext(userMessage) {
  const normalized = normalize(userMessage);

  const scored = KNOWLEDGE_MAP.map((entry) => {
    const score = entry.keywords.reduce((acc, kw) => {
      return normalized.includes(normalize(kw)) ? acc + 1 : acc;
    }, 0);
    return { ...entry, score };
  }).filter((entry) => entry.score > 0);

  scored.sort((a, b) => b.score - a.score);

  const chosen = scored.slice(0, MAX_FILES);
  if (chosen.length === 0) return "";

  let contextBlocks = [];
  let totalChars = 0;
  for (const entry of chosen) {
    const content = readKnowledgeFile(entry.file);
    if (totalChars + content.length > MAX_CONTEXT_CHARS) continue;
    contextBlocks.push(`### Referência: ${entry.file}\n${content}`);
    totalChars += content.length;
  }

  if (contextBlocks.length === 0) return "";

  return (
    "Use as referências abaixo (extraídas do material oficial de D&D 5e) " +
    "para embasar sua resposta quando forem relevantes. Não repita o " +
    "conteúdo bruto — sintetize na sua própria resposta.\n\n" +
    contextBlocks.join("\n\n---\n\n")
  );
}

module.exports = { getRelevantContext };
