// Testa a lógica de IA + recuperação de conhecimento direto no terminal,
// sem precisar conectar ao WhatsApp. Útil para validar a chave de API e
// o comportamento do bot antes do deploy.
//
// Uso: npm run chat

require("dotenv").config();
const readline = require("readline");
const { generateReply } = require("../src/ai");

if (!process.env.GROQ_API_KEY) {
  console.error("Defina GROQ_API_KEY no .env antes de rodar este teste.");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let history = [];

console.log('Chat de teste do bot de D&D 5e. Digite "sair" para encerrar.\n');

function ask() {
  rl.question("Você: ", async (input) => {
    if (input.trim().toLowerCase() === "sair") {
      rl.close();
      return;
    }
    try {
      const reply = await generateReply(input, history);
      console.log(`\nBot: ${reply}\n`);
      history.push({ role: "user", content: input });
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error("Erro:", err.message);
    }
    ask();
  });
}

ask();
