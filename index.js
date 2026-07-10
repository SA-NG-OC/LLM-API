import readline from "readline";
import { runRAG } from "./rag.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log("=================================================================");
    console.log("             BOS CORPORATE ASSISTANT (SIMPLE RAG DEMO)          ");
    console.log("=================================================================");
    console.log("Ask any question regarding the Beverage Ordering System (BOS).");
    console.log("Type 'exit' or 'quit' to terminate the session.");
    console.log("=================================================================");

    askQuestion();
}

function askQuestion() {
    rl.question("\n💬 Ask a question > ", async (input) => {
        const query = input.trim();

        if (query.toLowerCase() === "exit" || query.toLowerCase() === "quit") {
            console.log("\n👋 Thank you for using BOS Assistant. Goodbye!");
            rl.close();
            return;
        }

        if (!query) {
            askQuestion();
            return;
        }

        try {
            console.log("⏳ Processing request...");
            const startTime = Date.now();
            
            // Execute simple context-injected RAG
            const answer = await runRAG(query);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log("\n🤖 ======================= LLM ANSWER =======================");
            console.log(answer);
            console.log("=============================================================");
            console.log(`⏱️ Latency: ${duration} seconds`);
        } catch (error) {
            console.error("\n❌ Error processing question:", error.message);
        }

        askQuestion();
    });
}

main();
