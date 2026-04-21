const axios = require('axios');

async function testReport() {
    const baseURL = 'http://localhost:5000/api';
    const assignmentId = 1; // Assuming this based on screenshot/previous work
    const token = 'YOUR_TEST_TOKEN'; // I need to get a token or use a script to login

    console.log('--- Testing Report Endpoint ---');
    // I will try to login as admin first to get a token
    try {
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@lms.com',
            password: 'admin123'
        });
        const adminToken = loginRes.data.token;
        
        console.log('Logged in as admin. Fetching report...');
        const reportRes = await axios.get(`${baseURL}/assignments/${assignmentId}/report`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            responseType: 'arraybuffer'
        });
        console.log('✅ Success! Report size:', reportRes.data.byteLength);
    } catch (err) {
        console.error('❌ Error:', err.response?.status);
        if (err.response?.data) {
            // Since it's arraybuffer, convert to string
            try {
                const data = JSON.parse(Buffer.from(err.response.data).toString());
                console.error('Error data:', data);
            } catch (e) {
                console.error('Could not parse error data');
            }
        }
    }
}

testReport();
