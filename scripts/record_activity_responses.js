import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

const credentials = {
    admin: {
        email: "admin@grclass.com",
        password: "Password@123"
    },
    client: {
        email: "ops@pacific.com",
        password: "Password@123"
    }
};

async function login(userType) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, credentials[userType]);
        const result = response.data;
        if (!result.accessToken) {
            console.error(`Login failed for ${userType}:`, result);
            return null;
        }
        return result.accessToken;
    } catch (error) {
        console.error(`Login error for ${userType}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

async function recordResponses() {
    const adminToken = await login('admin');
    const clientToken = await login('client');

    if (!adminToken || !clientToken) return;

    const config = (token) => ({
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    console.log('--- RECORDING RESPONSES ---');

    try {
        // 1. Create Activity Request as Client
        const createRes = await axios.post(`${BASE_URL}/activity-requests`, {
            activity_type: "INSPECTION",
            requested_service: "Annual Survey",
            location_port: "Port of Singapore",
            proposed_date: "2026-05-15",
            description: "Testing API response capture",
            priority: "MEDIUM"
        }, config(clientToken));
        console.log('POST /activity-requests (Client):', JSON.stringify(createRes.data, null, 2));

        const requestId = createRes.data.data.id;

        // 2. Get Activity Requests (List) as Admin
        const listRes = await axios.get(`${BASE_URL}/activity-requests?limit=2`, config(adminToken));
        console.log('GET /activity-requests (Admin List):', JSON.stringify(listRes.data, null, 2));

        // 3. Get Activity Request (Detail) as Admin
        const detailRes = await axios.get(`${BASE_URL}/activity-requests/${requestId}`, config(adminToken));
        console.log('GET /activity-requests/:id (Admin Detail):', JSON.stringify(detailRes.data, null, 2));

        // 4. Update Status as Admin
        const statusRes = await axios.put(`${BASE_URL}/activity-requests/${requestId}/status`, {
            status: "APPROVED",
            remarks: "Request approved for scheduled date"
        }, config(adminToken));
        console.log('PUT /activity-requests/:id/status (Admin Update):', JSON.stringify(statusRes.data, null, 2));

        // 5. Get Vessels List as Admin
        const vesselRes = await axios.get(`${BASE_URL}/vessels?limit=2`, config(adminToken));
        console.log('GET /vessels (Admin List):', JSON.stringify(vesselRes.data, null, 2));

        // 6. Get Jobs List as Admin
        const jobRes = await axios.get(`${BASE_URL}/jobs?limit=2`, config(adminToken));
        console.log('GET /jobs (Admin List):', JSON.stringify(jobRes.data, null, 2));

        // 7. Get Certificate Types
        const certTypeRes = await axios.get(`${BASE_URL}/certificates/types`, config(adminToken));
        console.log('GET /certificates/types (Admin):', JSON.stringify(certTypeRes.data, null, 2));

        // 8. Get Certificates List as Admin
        const certRes = await axios.get(`${BASE_URL}/certificates?limit=2`, config(adminToken));
        console.log('GET /certificates (Admin List):', JSON.stringify(certRes.data, null, 2));

    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
    }
}

recordResponses().catch(console.error);
