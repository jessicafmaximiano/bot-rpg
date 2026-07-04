// Limitador de taxa simples por conversa (janela fixa de 1 minuto).
// Protege contra custo de API disparado por spam ou loop acidental.

class RateLimiter {
  constructor(limitPerMinute = 15) {
    this.limit = limitPerMinute;
    this.counters = new Map(); // jid -> { count, windowStart }
  }

  /** Retorna true se a mensagem pode passar, false se estourou o limite. */
  allow(jid) {
    const now = Date.now();
    const entry = this.counters.get(jid);

    if (!entry || now - entry.windowStart > 60_000) {
      this.counters.set(jid, { count: 1, windowStart: now });
      return true;
    }

    if (entry.count >= this.limit) {
      return false;
    }

    entry.count += 1;
    return true;
  }
}

module.exports = { RateLimiter };
