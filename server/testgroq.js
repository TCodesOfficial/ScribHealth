import Groq from "groq-sdk";
import env from "dotenv"
env.config()
const apiKey = process.env.GROQ_API_KEY
const groq = new Groq({ apiKey: apiKey });

export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(apiKey)
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}

main().catch((err) => console.log(err))
