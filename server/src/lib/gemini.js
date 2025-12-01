const Groq = require('groq-sdk');
const axios = require('axios');

let groq = null;
function getGroq() {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY || 'test-key'
        });
    }
    return groq;
}

/**
 * Generate embeddings for text using sentence-transformers model
 * Note: Groq doesn't have a native embedding API, so we'll use a simple word-based approach
 * For production, you'd want to use a dedicated embedding service
 */
async function generateEmbedding(text) {
    try {
        // Simple word-frequency based embedding (384 dimensions)
        // This is a basic approach - for production, use proper embedding models
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(384).fill(0);

        // Create a simple embedding based on word positions and frequencies
        words.forEach((word, idx) => {
            const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const position = hash % 384;
            embedding[position] += 1 / (idx + 1); // Weight by position
        });

        // Normalize the vector
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Generate AI response with context using Groq
 */
async function generateResponse(question, contextChunks) {
    try {
        const groq = getGroq();
        // Build context from chunks
        const context = contextChunks
            .map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.content}`)
            .join('\n\n---\n\n');

        const systemPrompt = `You are an AI tutor for an online course. Answer questions using ONLY the provided course materials.

IMPORTANT RULES:
- Answer based ONLY on the provided course materials below
- If the answer is not in the materials, say "I don't have enough information in the course materials to answer that question."
- Be clear, concise, and helpful
- Reference sources like [Source 1], [Source 2] in your answer
- Do not make up information`;

        const userPrompt = `Course Materials:
${context}

Student Question: ${question}

Please provide a helpful answer based only on the course materials above.`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // Updated to current model (Nov 2025)
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3, // Lower temperature for more focused answers
            max_tokens: 1024
        });

        return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
}

module.exports = {
    generateEmbedding,
    generateResponse
};
