import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "../db/vector_store.json");

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
        return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function saveVectors(data) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function loadVectors() {
    if (!fs.existsSync(DB_PATH)) {
        return [];
    }
    const content = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(content);
}

export function searchSimilarity(queryVector, topK = 3) {
    const vectors = loadVectors();
    if (vectors.length === 0) {
        throw new Error("Vector database is empty. Please run ingestion first!");
    }
    
    const scored = vectors.map(item => {
        const score = cosineSimilarity(queryVector, item.vector);
        return {
            text: item.text,
            score: score
        };
    });
    
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}
