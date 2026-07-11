import { getEmbedding } from "./services/embedding.js";
import { searchSimilarity } from "./services/vectordb.js";
import { callLLM } from "./services/llm.js";

export async function runRAG(question) {
    try {
        const queryVector = await getEmbedding(question, true);
        const matchedChunks = searchSimilarity(queryVector, 2);
        
        console.log("\n🔍 [RAG Search] Found the most relevant document chunks:");
        matchedChunks.forEach((chunk, index) => {
            const preview = chunk.text.substring(0, 80).replace(/\n/g, " ");
            console.log(`   📍 Top ${index + 1} (Score: ${chunk.score.toFixed(4)}): "${preview}..."`);
        });
        
        const context = matchedChunks.map(chunk => chunk.text).join("\n\n---\n\n");
        
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

        const answer = await callLLM(prompt);
        return answer;
    } catch (error) {
        console.error("Error in runRAG:", error.message);
        throw error;
    }
}
