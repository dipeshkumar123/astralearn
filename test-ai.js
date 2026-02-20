const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testAIUpload() {
    try {
        console.log('Testing AI Content Upload...\n');

        // Create form data
        const form = new FormData();
        form.append('file', fs.createReadStream('d:\\Projects\\astralearn\\test-content.txt'));
        form.append('courseId', '1');
        form.append('contentType', 'text');

        console.log('Uploading test-content.txt to course ID 1...');
        const uploadRes = await axios.post('http://localhost:5000/api/ai/ingest', form, {
            headers: form.getHeaders()
        });

        console.log('✅ Upload successful!');
        console.log('Chunks created:', uploadRes.data.chunksCreated);
        console.log('\n---\n');

        // Now test chat
        console.log('Testing AI Chat...\n');
        console.log('Question: What are the seven forms of lightsaber combat?');

        const chatRes = await axios.post('http://localhost:5000/api/ai/chat', {
            courseId: '1',
            userId: 'test-user',
            question: 'What are the seven forms of lightsaber combat?'
        });

        console.log('\n✅ Chat response received:');
        console.log('Answer:', chatRes.data.answer);
        console.log('\nSources:');
        chatRes.data.sources.forEach((source, idx) => {
            console.log(`  [${idx + 1}] ${source.content.substring(0, 100)}...`);
        });

        console.log('\n\n🎉 All AI features working!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testAIUpload();
