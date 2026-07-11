import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function getEmbedding(text, isQuery = false) {
    try {
        const response = await client.embeddings.create({
            model: "nvidia/nv-embedqa-e5-v5",
            input: text,
            input_type: isQuery ? "query" : "passage",
            encoding_format: "float"
        });
        
        return response.data[0].embedding;
    } catch (error) {
        console.error("Error creating embedding:", error.message);
        throw error;
    }
}
