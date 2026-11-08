import mongoose from 'mongoose';
import connectDB, { disconnectDB } from '../config/database.js';
import app from '../server.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';

process.env.NODE_ENV = 'development';
process.env.USE_IN_MEMORY_DB = 'true';
process.env.JWT_SECRET = 'test_jwt_secret_for_suite_1234567890';
process.env.JWT_EXPIRES_IN = '7d';

let server;
let baseUrl;

const runTests = async () => {
  console.log('\n======================================================');
  console.log('STARTING FULL BACKEND INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  };

  try {
    // 1. Connect to Database
    console.log('[STEP 1] Testing Database Connection...');
    await connectDB();
    assert(mongoose.connection.readyState === 1, 'MongoDB connection readyState is 1 (Connected)');

    // Start a dedicated test server on an ephemeral port
    const testPort = 5999;
    server = app.listen(testPort);
    baseUrl = `http://localhost:${testPort}`;
    console.log(`[STEP 2] Test Express server listening on ${baseUrl}`);

    // Helper for JSON requests
    const request = async (method, path, body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await res.json().catch(() => null);
      return { status: res.status, data };
    };

    // 2. Health Endpoint
    console.log('\n[STEP 3] Testing Health and Root Endpoints...');
    const rootRes = await request('GET', '/');
    assert(rootRes.status === 200 && rootRes.data.success === true, 'Root GET / returns status 200');

    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200 && healthRes.data.status === 'OK', 'GET /api/health returns status 200 and OK');
    assert(healthRes.data.database === 'CONNECTED', 'GET /api/health reports database CONNECTED');

    // 3. User Registration
    console.log('\n[STEP 4] Testing User Registration...');
    const testUser = {
      name: 'Test Administrator',
      email: 'admin@startupcrm.com',
      password: 'Password123!'
    };

    const regRes = await request('POST', '/api/auth/register', testUser);
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(regRes.data.success === true, 'Registration response success flag is true');
    assert(Boolean(regRes.data.token), 'Registration returns a valid JWT token');
    assert(regRes.data.user.email === testUser.email.toLowerCase(), 'Registration returns correct user email');
    assert(regRes.data.user.password === undefined, 'Security: Password hash is NOT returned in registration response');

    const authToken = regRes.data.token;
    const userId = regRes.data.user._id || regRes.data.user.id;

    // 4. Duplicate Registration
    console.log('\n[STEP 5] Testing Duplicate Registration Prevention...');
    const dupRes = await request('POST', '/api/auth/register', testUser);
    assert(dupRes.status === 400 || dupRes.status === 409, 'Duplicate registration returns 400/409');
    assert(dupRes.data.success === false, 'Duplicate registration returns success: false');

    // 5. User Login
    console.log('\n[STEP 6] Testing User Login...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK');
    assert(Boolean(loginRes.data.token), 'Login returns a valid JWT token');
    assert(loginRes.data.user.password === undefined, 'Security: Password hash is NOT returned in login response');

    // 6. Invalid Login Tests
    console.log('\n[STEP 7] Testing Invalid Login Rejection...');
    const badPassRes = await request('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'WrongPassword999!'
    });
    assert(badPassRes.status === 401, 'Login with incorrect password returns 401 Unauthorized');

    const badEmailRes = await request('POST', '/api/auth/login', {
      email: 'nonexistent@startupcrm.com',
      password: testUser.password
    });
    assert(badEmailRes.status === 401, 'Login with nonexistent email returns 401 Unauthorized');

    // 7. Profile Retrieval
    console.log('\n[STEP 8] Testing Profile Retrieval...');
    const profileRes = await request('GET', '/api/auth/profile', null, authToken);
    assert(profileRes.status === 200, 'GET /api/auth/profile returns 200 OK with valid token');
    assert(profileRes.data.user.email === testUser.email.toLowerCase(), 'Profile matches authenticated user email');
    assert(profileRes.data.user.password === undefined, 'Security: Password hash excluded from profile response');

    const unauthProfileRes = await request('GET', '/api/auth/profile');
    assert(unauthProfileRes.status === 401, 'GET /api/auth/profile without token returns 401 Unauthorized');

    // 8. Lead Creation
    console.log('\n[STEP 9] Testing Lead Creation...');
    const newLead = {
      name: 'Alice Cooper',
      company: 'Wonderland Technologies',
      email: 'alice@wonderland.io',
      phone: '+1-555-0199',
      value: 15000,
      status: 'New',
      source: 'Website',
      notes: 'Initial inbound inquiry for enterprise tier.'
    };

    const createLeadRes = await request('POST', '/api/leads', newLead, authToken);
    assert(createLeadRes.status === 201, 'POST /api/leads returns 201 Created');
    assert(createLeadRes.data.success === true, 'Lead creation returns success: true');
    assert(createLeadRes.data.data.name === newLead.name, 'Lead name matches input');
    assert(createLeadRes.data.data.value === 15000, 'Lead value is correctly stored as 15000');
    assert(createLeadRes.data.data.owner.toString() === userId.toString(), 'Lead owner is correctly bound to authenticated user');

    const leadId = createLeadRes.data.data._id || createLeadRes.data.data.id;

    // Create a second lead to test filtering and stats
    const lead2 = await request('POST', '/api/leads', {
      name: 'Bob Marley',
      company: 'Reggae Records',
      email: 'bob@reggae.com',
      phone: '+1-555-0288',
      value: 25000,
      status: 'Won',
      source: 'Referral',
      notes: 'Signed 1-year contract.'
    }, authToken);
    assert(lead2.status === 201, 'Created second lead for stats aggregation');

    // 9. Lead Retrieval and Filtering
    console.log('\n[STEP 10] Testing Lead Retrieval and Query Filtering...');
    const getLeadsRes = await request('GET', '/api/leads', null, authToken);
    assert(getLeadsRes.status === 200, 'GET /api/leads returns 200 OK');
    assert(Array.isArray(getLeadsRes.data.data), 'GET /api/leads returns an array of leads');
    assert(getLeadsRes.data.data.length === 2, 'GET /api/leads returns exactly 2 leads');

    const filterStatusRes = await request('GET', '/api/leads?status=Won', null, authToken);
    assert(filterStatusRes.status === 200 && filterStatusRes.data.data.length === 1, 'GET /api/leads?status=Won returns exactly 1 won lead');

    const searchRes = await request('GET', '/api/leads/search?q=Alice', null, authToken);
    assert(searchRes.status === 200 && searchRes.data.data.length === 1, 'GET /api/leads/search?q=Alice finds matching lead');

    // 10. Lead Stats
    console.log('\n[STEP 11] Testing Lead Stats and Valuation Metrics...');
    const statsRes = await request('GET', '/api/leads/stats', null, authToken);
    assert(statsRes.status === 200, 'GET /api/leads/stats returns 200 OK');
    assert(statsRes.data.data.totalLeads === 2, 'Stats totalLeads is 2');
    assert(statsRes.data.data.totalValue === 40000, 'Stats totalValue is correctly aggregated ($40,000)');
    assert(statsRes.data.data.statusBreakdown.Won === 1, 'Stats statusBreakdown correctly reports 1 Won deal');

    // 11. Lead Update
    console.log('\n[STEP 12] Testing Lead Updating...');
    const updateRes = await request('PUT', `/api/leads/${leadId}`, {
      company: 'Wonderland Global Inc',
      value: 18000,
      status: 'Proposal Sent'
    }, authToken);
    assert(updateRes.status === 200, 'PUT /api/leads/:id returns 200 OK');
    assert(updateRes.data.data.company === 'Wonderland Global Inc', 'Lead company updated');
    assert(updateRes.data.data.value === 18000, 'Lead value updated to 18000');
    assert(updateRes.data.data.status === 'Proposal Sent', 'Lead status updated to Proposal Sent');

    // 12. Lead Status Patch
    console.log('\n[STEP 13] Testing Quick Status Patch...');
    const patchRes = await request('PATCH', `/api/leads/${leadId}/status`, {
      status: 'Won'
    }, authToken);
    assert(patchRes.status === 200, 'PATCH /api/leads/:id/status returns 200 OK');
    assert(patchRes.data.data.status === 'Won', 'Status patched to Won');

    // 13. Lead Deletion
    console.log('\n[STEP 14] Testing Lead Deletion...');
    const delRes = await request('DELETE', `/api/leads/${leadId}`, null, authToken);
    assert(delRes.status === 200, 'DELETE /api/leads/:id returns 200 OK');

    const getDeletedRes = await request('GET', `/api/leads/${leadId}`, null, authToken);
    assert(getDeletedRes.status === 404, 'GET /api/leads/:id after deletion returns 404 Not Found');

    // 14. Summary
    console.log('\n======================================================');
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('[TEST SUITE ERROR]', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
};

runTests();
