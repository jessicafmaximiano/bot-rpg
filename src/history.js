// Memória de conversa por chat (JID do WhatsApp), com persistência simples
// em disco em JSON. Guarda só as últimas N trocas para controlar custo de
// tokens e não deixar o histórico crescer sem limite.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

class ConversationHistory {
  constructor(maxTurns = 8) {
    this.maxTurns = maxTurns;
    this.store = new Map(); // jid -> [{role, content}, ...]
    this._load();
  }

  _load() {
    ensureDataDir();
    if (fs.existsSync(HISTORY_FILE)) {
      try {
        const raw = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
        for (const [jid, msgs] of Object.entries(raw)) {
          this.store.set(jid, msgs);
        }
      } catch (err) {
        console.warn("Não foi possível carregar histórico salvo, começando vazio:", err.message);
      }
    }
  }

  _persist() {
    ensureDataDir();
    const obj = Object.fromEntries(this.store);
    fs.writeFile(HISTORY_FILE, JSON.stringify(obj), (err) => {
      if (err) console.warn("Falha ao salvar histórico:", err.message);
    });
  }

  get(jid) {
    return this.store.get(jid) || [];
  }

  append(jid, userMessage, assistantMessage) {
    const msgs = this.store.get(jid) || [];
    msgs.push({ role: "user", content: userMessage });
    msgs.push({ role: "assistant", content: assistantMessage });
    // manter só as últimas maxTurns trocas (cada troca = 2 mensagens)
    const maxMessages = this.maxTurns * 2;
    while (msgs.length > maxMessages) msgs.shift();
    this.store.set(jid, msgs);
    this._persist();
  }

  clear(jid) {
    this.store.delete(jid);
    this._persist();
  }
}

module.exports = { ConversationHistory };
