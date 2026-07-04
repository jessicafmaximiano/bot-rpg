require("dotenv").config();

const { startBot } = require("./src/telegram");

if (!process.env.GROQ_API_KEY) {
  console.error(
    "ERRO: variável de ambiente GROQ_API_KEY não definida. " +
      "Copie .env.example para .env e preencha sua chave gratuita da Groq (console.groq.com/keys, sem cartão) antes de iniciar."
  );
  process.exit(1);
}

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error(
    "ERRO: variável de ambiente TELEGRAM_BOT_TOKEN não definida. " +
      "Crie um bot com o @BotFather no Telegram, copie o token e preencha no .env antes de iniciar."
  );
  process.exit(1);
}

console.log("Iniciando bot de D&D 5e para Telegram...");

try {
  startBot();
} catch (err) {
  console.error("Falha ao iniciar o bot:", err);
  process.exit(1);
}

process.on("unhandledRejection", (reason) => {
  console.error("Rejeição de Promise não tratada:", reason);
});
