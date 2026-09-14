// Manual API Test Script
// Run with: node test/manual-api-test.js
// 
// This script auto-flows:
// 1. Sign up a test hospital
// 2. Login and capture session cookie
// 3. Test all protected endpoints using the cookie
// 4. Test all public endpoints
//
// Prerequisites:
// - Server running at http://localhost:4000
// - .env configured with API keys (INTRON_API_KEY, GROQ_API_KEY, DEEPGRAM_API_KEY)
// - Or the script will handle missing keys gracefully

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';
const API_PREFIX = '/api/v1';

let authCookie = null;

// ==========================================
// Step 1: Auto Authentication Flow
// ==========================================

async function setupAuth() {
  console.log('=== Step 1: Auto Authentication ===\n');

  // 1a. Sign up
  console.log('1a. Signing up test hospital...');
  const signupRes = await fetch(`${BASE_URL}${API_PREFIX}/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@hospital.com',
      password: 'Welcome123',
      name: 'City General Hospital',
      location: 'New York, NY',
    }),
  });

  const signupData = await signupRes.json();
  console.log('   ✓ Signup response status:', signupRes.status);

  // 1b. Login
  console.log('1b. Logging in...');
  const loginRes = await fetch(`${BASE_URL}${API_PREFIX}/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@hospital.com',
      password: 'Welcome123',
    }),
  });

  const loginData = await loginRes.json();
  // Extract set-cookie header
  const setCookie = loginRes.headers['set-cookie'];
  if (setCookie) {
    authCookie = setCookie.split(';')[0];
    console.log('   ✓ Login successful, cookie captured');
    console.log('   Cookie:', authCookie.substring(0, 50) + '...');
  } else {
    console.log('   ⚠ No cookie set - response:', loginData);
  }

  // 1c. Verify session
  console.log('1c. Verifying session...');
  const sessionRes = await fetch(`${BASE_URL}${API_PREFIX}/auth/session`, {
    method: 'GET',
    headers: authCookie ? { Cookie: authCookie } : {},
  });
  const sessionData = await sessionRes.json();
  console.log('   ✓ Session status:', sessionRes.status);
  console.log('   User:', sessionData.data?.user?.email || 'N/A');
}

// ==========================================
// Step 2: Public Endpoints
// ==========================================

async function testPublicEndpoints() {
  console.log('\n=== Step 2: Public Endpoints ===\n');

  // GET /
  console.log('2a. GET /api/v1/');
  const helloRes = await fetch(`${BASE_URL}${API_PREFIX}/`);
  const helloData = await helloRes.json();
  console.log('   ✓ Status:', helloRes.status);
  console.log('   Response:', helloData.data || helloData);

  // Auth endpoints (no auth required)
  console.log('\n2b. Auth endpoints (public):');
  const signUpRes = await fetch(`${BASE_URL}${API_PREFIX}/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'public@test.com',
      password: 'Test123',
      name: 'Public Hospital',
      location: 'Test City',
    }),
  });
  console.log('   ✓ Sign-up status:', signUpRes.status);

  const signInRes = await fetch(`${BASE_URL}${API_PREFIX}/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'public@test.com',
      password: 'Test123',
    }),
  });
  console.log('   ✓ Sign-in status:', signInRes.status);
}

// ==========================================
// Step 3: Protected Endpoints
// ==========================================

async function testProtectedEndpoints() {
  console.log('\n=== Step 3: Protected Endpoints ===\n');

  if (!authCookie) {
    console.log('⚠ No auth cookie available - skipping protected endpoints');
    return;
  }

  // GET /api/v1/user/me
  console.log('3a. GET /api/v1/user/me');
  const userRes = await fetch(`${BASE_URL}${API_PREFIX}/user/me`, {
    method: 'GET',
    headers: { Cookie: authCookie },
  });
  const userData = await userRes.json();
  console.log('   ✓ Status:', userRes.status);
  console.log('   Has profile:', userData.data ? 'YES' : 'NO');
  if (userData.data) {
    console.log('   Email:', userData.data.email);
    console.log('   Name:', userData.data.name);
    console.log('   Location:', userData.data.location);
  }

  // PATCH /api/v1/user/me
  console.log('\n3b. PATCH /api/v1/user/me (update location)');
  const patchRes = await fetch(`${BASE_URL}${API_PREFIX}/user/me`, {
    method: 'PATCH',
    headers: { 
      Cookie: authCookie,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ location: 'Boston, MA' }),
  });
  const patchData = await patchRes.json();
  console.log('   ✓ Status:', patchRes.status);
  console.log('   Updated location:', patchData.data?.location);

  // GET /api/v1/consultation/history
  console.log('\n3c. GET /api/v1/consultation/history');
  const historyRes = await fetch(`${BASE_URL}${API_PREFIX}/consultation/history`, {
    method: 'GET',
    headers: { Cookie: authCookie },
  });
  const historyData = await historyRes.json();
  console.log('   ✓ Status:', historyRes.status);
  console.log('   Has history:', historyData.data ? 'YES ( ' + historyData.data.length + ' items)' : 'NO');

  // POST /api/v1/consultation/process-audio (with dummy audio)
  console.log('\n3d. POST /api/v1/consultation/process-audio (with test audio)');
  const audioRes = await fetch(`${BASE_URL}${API_PREFIX}/consultation/process-audio`, {
    method: 'POST',
    headers: { Cookie: authCookie },
    // Attach a dummy audio buffer
    body: Buffer.alloc(200, 0), // 200 bytes of silence
  });
  const audioData = await audioRes.json();
  console.log('   ✓ Status:', audioRes.status);
  console.log('   Has consultation ID:', audioData.data ? 'YES - ' + audioData.data.id : 'NO');
}

// ==========================================
// Step 4: Benchmark Endpoint
// ==========================================

async function testBenchmarkEndpoint() {
  console.log('\n=== Step 4: Benchmark Endpoint ===\n');

  if (!authCookie) {
    console.log('⚠ No auth cookie available - skipping benchmark');
    return;
  }

  console.log('4a. POST /api/v1/benchmark/run (with reference text)');
  const benchmarkRes = await fetch(`${BASE_URL}${API_PREFIX}/benchmark/run`, {
    method: 'POST',
    headers: { 
      Cookie: authCookie,
      'Content-Type': 'multipart/form-data' 
    },
    // Attach dummy audio and reference text
    body: {
      referenceText: 'Patient presents with chest pain and shortness of breath.',
      file: Buffer.alloc(200, 0), // dummy audio
    },
  });

  const benchmarkData = await benchmarkRes.json();
  console.log('   ✓ Status:', benchmarkRes.status);
  if (benchmarkData.data) {
    const { sahara, groqWhisper, deepgram } = benchmarkData.data;
    console.log('   Sahara transcript:', sahara.transcript ? 'YES' : 'NO (err: ' + sahara.transcript + ')');
    console.log('   GroqWhisper transcript:', groqWhisper.transcript ? 'YES' : 'NO');
    console.log('   Deepgram transcript:', deepgram.transcript ? 'YES' : 'NO');
    console.log('   Latencies - Sahara:', sahara.latencyMs, 'ms, Groq:', groqWhisper.latencyMs, 'ms, Deepgram:', deepgram.latencyMs, 'ms');
    console.log('   WER scores - Sahara:', sahara.wer, ', Groq:', groqWhisper.wer, ', Deepgram:', deepgram.wer);
  } else {
    console.log('   Response data:', benchmarkData);
  }
}

// ==========================================
// Main Execution
// ==========================================

(async () => {
  console.log('========================================');
  console.log('Manual API Test Script');
  console.log('========================================\n');

  try {
    await setupAuth();
    await testPublicEndpoints();
    await testProtectedEndpoints();
    await testBenchmarkEndpoint();
  } catch (error) {
    console.error('\n❌ Test script error:', error.message);
  }

  console.log('\n========================================');
  console.log('Test script completed');
  console.log('========================================');
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason.message);
  process.exit(1);
});