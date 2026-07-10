import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc context từ file company_kb.md
const contextPath = path.join(__dirname, "company_kb.md");
const context = fs.readFileSync(contextPath, "utf-8");

export async function runRAG(question) {
    const prompt = `
You are an AI assistant.

Answer ONLY using the context below.

If the answer is not in the context, say:
"I don't know based on the provided context."

Context:
${context}

Question:
${question}
`;

    try {
        const response = await client.chat.completions.create({
            // Dùng đúng model trong ví dụ NVIDIA trước
            model: "google/diffusiongemma-26b-a4b-it",

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.3,
            max_tokens: 1024,
        });

        return response.choices[0].message.content;
    } catch (err) {
        console.error(err.response?.data || err);

        throw err;
    }
}