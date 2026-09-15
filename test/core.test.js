const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { RateLimiter } = require('../src/rateLimit');
const { ConversationHistory } = require('../src/history');

test('limite por conversa reinicia exatamente em 60 segundos', () => {
  let now = 0;
  const limiter = new RateLimiter(2, () => now);
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), false);
  assert.equal(limiter.allow('b'), true);
  now = 59999;
  assert.equal(limiter.allow('a'), false);
  now = 60000;
  assert.equal(limiter.allow('a'), true);
});

test('configurações inválidas falham cedo', () => {
  for (const value of [NaN, 0, -1, 1.5]) {
    assert.throws(() => new RateLimiter(value), RangeError);
    assert.throws(() => new ConversationHistory(value), RangeError);
  }
});

test('histórico limita turnos, isola chats e persiste limpeza', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rpg-history-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'history.json');
  const history = new ConversationHistory(2, file);
  history.append('a', 'primeira', 'um');
  history.append('a', 'segunda', 'dois');
  history.append('a', 'terceira', 'três');
  history.append('b', 'outra', 'resposta');
  const restored = new ConversationHistory(2, file);
  assert.deepEqual(restored.get('a').map(m => m.content), ['segunda','dois','terceira','três']);
  assert.equal(restored.get('b').length, 2);
  restored.clear('a');
  const afterClear = new ConversationHistory(2, file);
  assert.deepEqual(afterClear.get('a'), []);
  assert.equal(afterClear.get('b').length, 2);
});
