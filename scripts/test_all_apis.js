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

async function testModule(name, token, endpoints) {
    console.log(`\n=== Testing Module: ${name} ===`);
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const results = {};

    for (const [method, path] of Object.entries(endpoints)) {
        try {
            const isGet = method.toLowerCase() === 'get' || method.toLowerCase().startsWith('get_');
            const isPost = method.toLowerCase() === 'post' || method.toLowerCase().startsWith('post_');
            
            console.log(`- Testing ${method.toUpperCase()} ${path}...`);
            let response;
            if (isGet) {
                response = await axios.get(`${BASE_URL}${path}`, config);
            } else if (isPost) {
                response = await axios.post(`${BASE_URL}${path}`, {}, config);
            } else {
                continue;
            }
            
            console.log(`  [SUCCESS] ${method.toUpperCase()} ${path}`);
            results[path] = { status: 'OK', data: response.data };
        } catch (error) {
            const errorData = error.response ? error.response.data : error.message;
            console.warn(`  [FAILED] ${method.toUpperCase()} ${path}:`, errorData.message || errorData);
            results[path] = { status: 'FAILED', error: errorData };
        }
    }
    return results;
}

async function runTests() {
    const adminToken = await login('admin');
    const clientToken = await login('client');

    if (!adminToken) {
        console.error("FATAL: Could not get admin token.");
        return;
    }

    // Core Modules to test
    const tests = [
        { name: 'Activity Requests', token: adminToken, endpoints: { 'get': '/activity-requests?limit=1' } },
        { name: 'Vessels', token: adminToken, endpoints: { 'get': '/vessels?limit=1' } },
        { name: 'Jobs', token: adminToken, endpoints: { 'get': '/jobs?limit=1' } },
        { name: 'Certificates', token: adminToken, endpoints: { 'get': '/certificates?limit=1', 'get_types': '/certificates/types' } },
        { name: 'Surveys', token: adminToken, endpoints: { 'get': '/surveys?limit=1' } },
        { name: 'Users', token: adminToken, endpoints: { 'get': '/users?limit=1', 'get_me': '/users/me' } },
        { name: 'Clients', token: adminToken, endpoints: { 'get': '/clients?limit=1' } },
        { name: 'Payments', token: adminToken, endpoints: { 'get': '/payments?limit=1' } },
        { name: 'Audit Logs', token: adminToken, endpoints: { 'get': '/system/audit-logs?limit=1' } },
        { name: 'Checklist Templates', token: adminToken, endpoints: { 'get': '/checklist-templates?limit=1' } },
        { name: 'Dashboard', token: adminToken, endpoints: { 'get': '/dashboard' } },
        { name: 'Customer Feedback', token: adminToken, endpoints: { 'get': '/customer-feedback?limit=1' } },
        { name: 'Flags', token: adminToken, endpoints: { 'get': '/flags?limit=1' } },
        { name: 'Incidents', token: adminToken, endpoints: { 'get': '/incidents?limit=1' } },
        { name: 'Reports', token: adminToken, endpoints: { 'get': '/reports/certificates' } },
        { name: 'Search', token: adminToken, endpoints: { 'get': '/search?q=MV' } },
        { name: 'TOCA', token: adminToken, endpoints: { 'get': '/toca?limit=1' } },
        { name: 'Change Requests', token: adminToken, endpoints: { 'get': '/change-requests?limit=1' } },
        { name: 'Surveyors', token: adminToken, endpoints: { 'get': '/surveyors?limit=1', 'get_apps': '/surveyors/applications' } },
        { name: 'Certificate Templates', token: adminToken, endpoints: { 'get': '/certificate-templates?limit=1' } },
        { name: 'Public', token: null, endpoints: { 'get': '/public/stats' } }
    ];

    for (const test of tests) {
        const moduleResults = await testModule(test.name, test.token, test.endpoints);
        
        // Find which GET request was for the list
        const listEntry = Object.entries(test.endpoints).find(([method, path]) => 
            method.toLowerCase() === 'get' && (path.includes('?limit=') || path === '/' || path === '/activity-requests' || path === '/vessels' || path === '/jobs' || path === '/certificates' || path === '/surveys' || path === '/clients' || path === '/payments' || path === '/users')
        );
        
        if (listEntry) {
            const listPath = listEntry[1];
            const result = moduleResults[listPath];
            
            if (result && result.status === 'OK' && result.data && result.data.data) {
                const data = result.data.data;
                const items = Array.isArray(data) ? data : (data.rows || data.jobs || data.vessels || data.activity_requests || []);
                
                if (items && items.length > 0) {
                    const item = items[0].company ? items[0].vessels[0] : items[0];
                    if (!item) continue;

                    const id = item.id;
                    const jobId = item.job_id || item.job_request_id;
                    
                    if (test.name === 'Surveys' && jobId) {
                        await testModule(`${test.name} (Detail)`, test.token, { 'get': `/surveys/jobs/${jobId}` });
                    } else if (test.name === 'Certificates' && id) {
                        await testModule(`${test.name} (Detail)`, test.token, { 'get': `/certificates/${id}` });
                    } else if (test.name === 'Users') {
                        // Users don't have a standard GET /:id profile yet, use /me
                        await testModule(`${test.name} (Detail)`, test.token, { 'get': `/users/me` });
                    } else if (test.name === 'Surveyors' && id) {
                        await testModule(`${test.name} (Detail)`, test.token, { 'get': `/surveyors/${id}/profile` });
                    } else if (id && test.name !== 'Audit Logs' && test.name !== 'Public') {
                        const basePath = listPath.split('?')[0];
                        await testModule(`${test.name} (Detail)`, test.token, { 'get': `${basePath}/${id}` });
                    }

                    if (jobId) {
                        // Test Non-Conformities for this job
                        await testModule(`Non Conformities (for job)`, adminToken, { 'get': `/non-conformities/job/${jobId}` });
                    }
                }
            }
        }
    }

    console.log('\n--- ALL TESTS COMPLETED ---');
}

runTests().catch(console.error);
