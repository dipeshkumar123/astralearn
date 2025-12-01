// Mock DOMMatrix for Node.js environment (pdf-parse dependency)
if (typeof DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix {};
}

const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF buffer
 */
async function extractTextFromPDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw error;
    }
}

/**
 * Split text into chunks for embedding
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Maximum characters per chunk
 * @param {number} overlap - Overlap between chunks
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + chunkSize, text.length);
        const chunk = text.slice(startIndex, endIndex);

        if (chunk.trim().length > 0) {
            chunks.push(chunk.trim());
        }

        startIndex += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Process content for ingestion
 */
async function processContent(content, contentType) {
    let text = '';

    if (contentType === 'pdf') {
        text = await extractTextFromPDF(content);
    } else if (contentType === 'text') {
        text = content.toString();
    } else {
        throw new Error(`Unsupported content type: ${contentType}`);
    }

    // Split into chunks
    const chunks = chunkText(text);
    return chunks;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
    extractTextFromPDF,
    chunkText,
    processContent,
    cosineSimilarity
};
