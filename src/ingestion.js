import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getEmbedding } from "./services/embedding.js";
import { saveVectors } from "./services/vectordb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, "../company_kb.md");

async function runIngestion() {
    console.log("🚀 Starting data Ingestion...");
    
    if (!fs.existsSync(KB_PATH)) {
        console.error(`❌ Original knowledge base does not exist at: ${KB_PATH}`);
        return;
    }
    
    const rawContent = fs.readFileSync(KB_PATH, "utf-8");
    
    const rawChunks = rawContent.split("---");
    const chunks = [];
    
    for (const chunk of rawChunks) {
        const trimmed = chunk.trim();
        if (trimmed.length > 50) {
            chunks.push(trimmed);
        }
    }
    
    console.log(`📝 Split document into ${chunks.length} chunks.`);
    
    const vectorData = [];
    
    for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        console.log(`⏳ Creating vector for chunk [${i + 1}/${chunks.length}]...`);
        
        try {
            const preview = chunkText.substring(0, 50).replace(/\n/g, " ");
            console.log(`   👉 Content: "${preview}..."`);
            
            const vector = await getEmbedding(chunkText, false);
            vectorData.push({
                text: chunkText,
                vector: vector
            });
        } catch (error) {
            console.error(`❌ Failed to create vector for chunk ${i + 1}:`, error.message);
            return;
        }
    }
    
    console.log("💾 Saving data to local Vector Database...");
    saveVectors(vectorData);
    
    console.log("✅ Ingestion COMPLETED! Vector database is ready.");
}

runIngestion();
