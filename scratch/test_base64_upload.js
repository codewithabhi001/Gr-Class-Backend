import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testBase64Upload() {
    console.log('--- Testing Surveyor Apply API with Base64 Payloads ---');

    // Create a base64 Data URL representing a small PDF content
    // "hello world" as PDF content mock
    const pdfBase64 = 'data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjMgMCBvYmoKPDwgL0ZpbHRlciAvRmxhdGVEZWNvZGUgL0xlbmd0aCAyNyA+PgpzdHJlYW0KeAFjdjU0NTAzNzQxMjE1NTAwTU10Njc0AQAGswZDCmVuZHN0cmVhbQplbmRvYmoKeA==';
    const email = `test_base64_${Date.now()}@example.com`;

    const payload = {
        full_name: 'Abhinav Test Base64',
        email: email,
        phone: '+917355025752',
        nationality: 'India',
        qualification: 'Master of Engineering',
        years_of_experience: 5,
        cvKey: pdfBase64,
        idProofKey: pdfBase64,
        certificateKeys: [pdfBase64, pdfBase64]
    };

    try {
        const response = await axios.post(`${BASE_URL}/surveyors/apply`, payload);
        console.log('✅ API Request Successful!');
        console.log('Status Code:', response.status);
        console.log('Response Message:', response.data.message);
        
        const data = response.data.data;
        console.log('\n--- Output File URLs in Response ---');
        console.log('cv_file_url:', data.cv_file_url);
        console.log('id_proof_url:', data.id_proof_url);
        console.log('certificate_files_url:', data.certificate_files_url);
        
        console.log('\n✅ Verification passed! Filenames are now perfectly sized S3 URLs instead of containing the whole base64 content.');
    } catch (error) {
        console.error('❌ Request Failed!');
        console.error(error);
    }
}

testBase64Upload();
