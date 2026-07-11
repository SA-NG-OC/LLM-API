import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function callLLM(prompt) {
    try {
        const response = await client.chat.completions.create({
            model: "google/diffusiongemma-26b-a4b-it",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            chat_template_kwargs: {
                enable_thinking: true
            }
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error calling LLM:", error.message);
        throw error;
    }
}
