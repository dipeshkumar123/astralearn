const Groq = require('groq-sdk');
const axios = require('axios');

let groq = null;
function getGroq() {
    if (!groq && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'test-key') {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
}

async function generateEmbedding(text) {
    try {
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(384).fill(0);

        words.forEach((word, idx) => {
            const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const position = hash % 384;
            embedding[position] += 1 / (idx + 1);
        });

        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

async function generateResponse(question, contextChunks) {
    try {
        const groqClient = getGroq();
        const context = contextChunks
            .map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.content}`)
            .join('\n\n---\n\n');

        if (!groqClient) {
            // Mock response if no valid API key
            return `[MOCK AI RESPONSE] I am the AstraLearn AI Tutor. You asked: "${question}". Based on the course materials provided (e.g. ${contextChunks.length > 0 ? contextChunks[0].content.substring(0, 30) + '...' : 'nothing'}), I can tell you that this is a simulated response. Please add a valid GROQ_API_KEY to the server/.env file for real AI generation!`;
        }

        const systemPrompt = `You are an AI tutor for an online course. Answer questions using ONLY the provided course materials.
IMPORTANT RULES:
- Answer based ONLY on the provided course materials below
- If the answer is not in the materials, say "I don't have enough information in the course materials to answer that question."
- Be clear, concise, and helpful
- Reference sources like [Source 1], [Source 2] in your answer
- Do not make up information`;

        const userPrompt = `Course Materials:\n${context}\n\nStudent Question: ${question}\n\nPlease provide a helpful answer based only on the course materials above.`;

        const completion = await groqClient.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1024
        });

        return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
}

async function generatePersonalizedRecommendations(studentData) {
    try {
        const groqClient = getGroq();
        
        if (!groqClient) {
            return {
                strengths: ["Consistency in learning", "Good baseline understanding"],
                gaps: ["Advanced concepts integration", "Time management on quizzes"],
                recommendations: [
                    "Review the recent quizzes you missed.",
                    "Spend an extra 15 minutes a day on core concepts.",
                    "[MOCK AI] Add a GROQ_API_KEY for real personalized AI recommendations!"
                ],
                summary: "You are doing well, but there is room for improvement. Keep studying!"
            };
        }

        const systemPrompt = `You are an expert AI learning advisor. Analyze the student's recent activity data (quizzes, progress, goals) and provide personalized feedback. Format your response strictly as a JSON object with these keys: "strengths" (array of strings), "gaps" (array of strings), "recommendations" (array of actionable tips), and "summary" (a short encouraging paragraph).`;

        const completion = await groqClient.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Student Data:\n${JSON.stringify(studentData, null, 2)}` }
            ],
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        return JSON.parse(content || '{"strengths":[],"gaps":[],"recommendations":[],"summary":""}');
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw error;
    }
}

module.exports = {
    generateEmbedding,
    generateResponse,
    generatePersonalizedRecommendations
};
