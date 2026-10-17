/**
 * AI Teacher Assistant - Comprehensive Automated Integration Test Suite
 * Tests all MVP criteria from ANTIGRAVITY_CONTEXT.md Section 11
 */

const assert = require('assert');
const app = require('../src/app');
const { TeacherRepository } = require('../src/models/Teacher');
const { DocumentRepository } = require('../src/models/Document');

const PORT = 3899;
let server;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let teacher1Token = '';
let teacher1Id = '';
let teacher2Token = '';
let teacher2Id = '';
let document1Id = '';

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  return fn()
    .then(() => {
      passedTests++;
      console.log(`  ✓ PASS: ${name}`);
    })
    .catch((err) => {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}`);
    });
}

async function start() {
  console.log('\n======================================================');
  console.log('   AI Teacher Assistant - Integration Verification');
  console.log('======================================================\n');

  // Start HTTP server for testing
  server = app.listen(PORT);

  // Test 1: Health / 404 Check
  await runTest('API returns JSON 404 for unknown endpoints', async () => {
    const res = await fetch(`${BASE_URL}/api/unknown-endpoint-test`);
    const data = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
  });

  // Test 2: Teacher Registration (Teacher 1)
  await runTest('Teacher 1 registration activates 2-month trial & returns token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prof. Ada Lovelace',
        email: `ada_${Date.now()}@test.edu`,
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Token should be returned');
    assert.ok(data.teacher.id, 'Teacher ID should be returned');
    assert.strictEqual(data.teacher.isTrialActive, true);
    assert.ok(data.teacher.daysRemaining >= 59, 'Should have ~60 days trial remaining');

    teacher1Token = data.token;
    teacher1Id = data.teacher.id;
  });

  // Test 3: Duplicate Registration Rejection
  await runTest('Registration rejects duplicate email', async () => {
    const teacher = await TeacherRepository.findById(teacher1Id);
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Ada',
        email: teacher.email,
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  // Test 4: Teacher 2 Registration (for ownership testing)
  await runTest('Teacher 2 registration for access-control verification', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prof. Charles Babbage',
        email: `babbage_${Date.now()}@test.edu`,
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    teacher2Token = data.token;
    teacher2Id = data.teacher.id;
  });

  // Test 5: Teacher Login
  await runTest('Teacher login succeeds with valid credentials', async () => {
    const teacher = await TeacherRepository.findById(teacher1Id);
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: teacher.email,
        password: 'Password123'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
  });

  // Test 6: Teacher Profile (/api/teachers/me)
  await runTest('GET /api/teachers/me retrieves authenticated teacher profile', async () => {
    const res = await fetch(`${BASE_URL}/api/teachers/me`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.teacher.name, 'Prof. Ada Lovelace');
    assert.strictEqual(data.teacher.isTrialValid, true);
  });

  // Test 7: Subscription / Trial Status (/api/subscription/status)
  await runTest('GET /api/subscription/status returns 2-month trial metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/subscription/status`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.trial.isExpired, false);
    assert.strictEqual(data.trial.isValid, true);
  });

  // Test 8: Unauthenticated Request Rejection
  await runTest('Protected endpoints reject unauthenticated requests (401)', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'Math', topic: 'Calculus' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  // Test 9: Input Validation for Subject and Topic
  await runTest('AI Generation rejects empty subject or topic with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher1Token}`
      },
      body: JSON.stringify({ subject: '', topic: '' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  // Test 10: Generate Notes
  await runTest('POST /api/ai/notes generates comprehensive structured notes', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher1Token}`
      },
      body: JSON.stringify({
        subject: 'Computer Science',
        topic: 'Binary Search Trees',
        gradeLevel: 'Undergraduate'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.type, 'notes');
    assert.ok(data.content.length > 100, 'Notes content should be substantial');
  });

  // Test 11: Generate Assignment
  await runTest('POST /api/ai/assignments generates structured assignment with rubric', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher1Token}`
      },
      body: JSON.stringify({
        subject: 'Physics',
        topic: 'Newtonian Dynamics',
        difficulty: 'medium'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.type, 'assignment');
    assert.ok(data.content.includes('Assignment') || data.content.includes('Section'));
  });

  // Test 12: Generate Questions - Easy, Medium, Hard
  for (const diff of ['easy', 'medium', 'hard']) {
    await runTest(`POST /api/ai/questions generates ${diff.toUpperCase()} questions with answer keys`, async () => {
      const res = await fetch(`${BASE_URL}/api/ai/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacher1Token}`
        },
        body: JSON.stringify({
          subject: 'World History',
          topic: 'The Industrial Revolution',
          difficulty: diff,
          questionCount: 4,
          questionType: 'mixed'
        })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.type, 'questions');
      assert.strictEqual(data.difficulty, diff);
      assert.strictEqual(data.questionCount, 4);
      assert.ok(data.content.includes('Question'));
    });
  }

  // Test 13: Save Document
  await runTest('POST /api/documents saves document for Teacher 1', async () => {
    const res = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher1Token}`
      },
      body: JSON.stringify({
        title: 'Binary Search Trees - Master Lecture',
        subject: 'Computer Science',
        topic: 'Binary Search Trees',
        type: 'notes',
        difficulty: 'medium',
        content: '# Binary Search Trees\n\nBST is a node-based binary tree data structure with logarithmic search.'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.document._id || data.document.id);
    document1Id = data.document._id || data.document.id;
  });

  // Test 14: List Documents
  await runTest('GET /api/documents returns list of Teacher 1 documents', async () => {
    const res = await fetch(`${BASE_URL}/api/documents`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.count, 1);
    assert.strictEqual(data.documents[0].title, 'Binary Search Trees - Master Lecture');
  });

  // Test 15: Cross-Teacher Ownership Isolation (Crucial Checklist Item)
  await runTest('One teacher CANNOT access another teacher documents (403 Forbidden)', async () => {
    // Teacher 2 attempts to fetch Teacher 1's document
    const res = await fetch(`${BASE_URL}/api/documents/${document1Id}`, {
      headers: { Authorization: `Bearer ${teacher2Token}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403, 'Must return 403 Forbidden for cross-teacher access');
    assert.strictEqual(data.success, false);
  });

  // Test 16: Edit / Update Owned Document (PATCH)
  await runTest('PATCH /api/documents/:id updates document content', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${document1Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher1Token}`
      },
      body: JSON.stringify({
        title: 'Binary Search Trees - Updated Edition',
        content: '# Updated Binary Search Trees\n\nContent revised with balanced AVL tree extensions.'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.document.title, 'Binary Search Trees - Updated Edition');
  });

  // Test 17: PDF Export - Logged-in teacher downloads own saved document
  await runTest('GET /api/documents/:id/pdf generates and streams valid binary PDF', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${document1Id}/pdf`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    assert.ok(res.headers.get('content-disposition').includes('attachment; filename='));

    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 500, 'PDF buffer must contain binary PDF data');
    const headerBytes = new Uint8Array(buffer.slice(0, 5));
    const headerStr = String.fromCharCode(...headerBytes);
    assert.strictEqual(headerStr, '%PDF-', 'Must start with standard PDF magic number %PDF-');
  });

  // Test 18: Cross-Teacher PDF Download Isolation (ID tampering returns 403 Forbidden)
  await runTest('Teacher 2 CANNOT download Teacher 1 PDF by changing document ID (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${document1Id}/pdf`, {
      headers: { Authorization: `Bearer ${teacher2Token}` }
    });
    assert.strictEqual(res.status, 403, 'Must return 403 Forbidden for cross-teacher PDF download');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Access denied. You do not have permission to export this document.');
  });

  // Test 19: PDF Export Rejects Missing Document ID (404 Not Found)
  await runTest('GET /api/documents/:id/pdf rejects non-existent document ID with 404', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/non_existent_doc_id_999/pdf`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Document not found.');
  });

  // Test 20: PDF Export Rejects Malformed Document ID Safely (404, no server crash or 500)
  await runTest('GET /api/documents/:id/pdf rejects malformed ID safely with 404', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/!@#$%^&*()_invalid_id/pdf`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Document not found.');
  });

  // Test 21: PDF Export Rejects Unauthenticated Requests (401 Unauthorized)
  await runTest('GET /api/documents/:id/pdf rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${document1Id}/pdf`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  // Test 22: PDF Generation with Long Multi-Page Content, Questions & Callouts
  await runTest('PDFService generates multi-page document with questions and callouts', async () => {
    let longContent = '# Advanced Comprehensive Biology: Cellular Respiration\n\n';
    longContent += '## Module Overview & Core Mechanisms\n';
    longContent += '> **Teacher Note:** Ensure students understand both glycolysis and oxidative phosphorylation.\n\n';
    longContent += '### Section 1: Detailed Concepts\n';
    for (let k = 1; k <= 15; k++) {
      longContent += `Concept point ${k}: Cellular metabolic pathway step ${k} produces ATP through enzyme catalysis.\n`;
    }
    longContent += '\n---\n\n### Section 2: Question Bank\n';
    for (let q = 1; q <= 6; q++) {
      longContent += `#### Question ${q} [Multiple Choice - 2 Marks]\n`;
      longContent += `What is the net gain of ATP in pathway step ${q}?\n`;
      longContent += `- A) 2 ATP molecules\n- B) 4 ATP molecules [Correct]\n- C) 32 ATP molecules\n- D) Zero\n\n`;
      longContent += `*Answer Key:* **B**\n*Explanation:* Step ${q} yields net 4 ATP through substrate-level phosphorylation.\n\n`;
    }

    const createDocRes = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher1Token}`
      },
      body: JSON.stringify({
        title: 'Cellular Respiration Comprehensive Exam',
        subject: 'Biology',
        topic: 'Cellular Respiration',
        type: 'questions',
        difficulty: 'hard',
        content: longContent
      })
    });
    const docData = await createDocRes.json();
    assert.strictEqual(createDocRes.status, 201);
    const longDocId = docData.document._id || docData.document.id;

    // Export long document PDF
    const pdfRes = await fetch(`${BASE_URL}/api/documents/${longDocId}/pdf`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    assert.strictEqual(pdfRes.status, 200);
    assert.strictEqual(pdfRes.headers.get('content-type'), 'application/pdf');
    const pdfBuffer = await pdfRes.arrayBuffer();
    assert.ok(pdfBuffer.byteLength > 2000, 'Multi-page PDF must be larger than 2KB');

    // Clean up temporary long document
    await fetch(`${BASE_URL}/api/documents/${longDocId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
  });

  // Test 23: Expired Trial Specifically Rejects PDF Export (403 Forbidden)
  await runTest('Expired trial blocks PDF export route with 403 Forbidden', async () => {
    // Expire trial
    await TeacherRepository.updateTrialStatus(teacher1Id, {
      isTrialActive: false,
      trialEndDate: new Date(Date.now() - 1000 * 60 * 60 * 24)
    });

    const pdfRes = await fetch(`${BASE_URL}/api/documents/${document1Id}/pdf`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    assert.strictEqual(pdfRes.status, 403);
    const data = await pdfRes.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.trial.isExpired);

    // Restore trial
    await TeacherRepository.updateTrialStatus(teacher1Id, {
      isTrialActive: true,
      trialEndDate: new Date(Date.now() + 60 * 1000 * 60 * 60 * 24)
    });
  });

  // Test 18: Expired Trial Enforcement
  await runTest('Expired trial restrictions are enforced server-side (403 Forbidden)', async () => {
    // Simulate expired trial by setting trialEndDate in past
    await TeacherRepository.updateTrialStatus(teacher1Id, {
      isTrialActive: false,
      trialEndDate: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    });

    // Try AI generation with expired trial
    const res = await fetch(`${BASE_URL}/api/ai/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacher1Token}`
      },
      body: JSON.stringify({
        subject: 'Math',
        topic: 'Algebra'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403, 'Must return 403 Forbidden when trial is expired');
    assert.strictEqual(data.success, false);
    assert.ok(data.trial.isExpired, 'Trial status must reflect expiry');

    // Restore trial for cleanup
    await TeacherRepository.updateTrialStatus(teacher1Id, {
      isTrialActive: true,
      trialEndDate: new Date(Date.now() + 60 * 1000 * 60 * 60 * 24)
    });
  });

  // Test 19: Delete Owned Document
  await runTest('DELETE /api/documents/:id deletes document successfully', async () => {
    const res = await fetch(`${BASE_URL}/api/documents/${document1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    // Verify document is no longer listed
    const checkRes = await fetch(`${BASE_URL}/api/documents`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.count, 0);
  });

  // Health Check Endpoint
  await runTest('GET /api/health returns 200 with operational status and database mode', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.timestamp);
    assert.ok(typeof data.uptime === 'number');
    assert.ok(data.database === 'in-memory-fallback' || data.database === 'mongodb');
  });

  // Subscription & Usage Metrics for Active Teacher
  await runTest('GET /api/subscription/status accurately reports usage counters for Teacher 1', async () => {
    const res = await fetch(`${BASE_URL}/api/subscription/status`, {
      headers: { Authorization: `Bearer ${teacher1Token}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.trial.isActive);
    assert.strictEqual(data.trial.daysRemaining, 60);

    const usage = data.usage;
    assert.ok(usage, 'Usage metrics object must be present');
    assert.strictEqual(usage.notesGenerated, 1, 'Should reflect 1 note generated');
    assert.strictEqual(usage.assignmentsGenerated, 1, 'Should reflect 1 assignment generated');
    assert.strictEqual(usage.questionsGenerated, 3, 'Should reflect 3 question sets generated');
    assert.strictEqual(usage.totalAIGenerations, 5, 'Should reflect 5 total AI generations');
    assert.strictEqual(usage.pdfExports, 2, 'Should reflect 2 PDF exports');
  });

  // Cross-Teacher Usage Isolation
  await runTest('Teacher 2 usage counters remain zero (strict teacher usage isolation)', async () => {
    const res = await fetch(`${BASE_URL}/api/subscription/status`, {
      headers: { Authorization: `Bearer ${teacher2Token}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const usage = data.usage;
    assert.ok(usage, 'Usage metrics object must be present');
    assert.strictEqual(usage.notesGenerated, 0);
    assert.strictEqual(usage.assignmentsGenerated, 0);
    assert.strictEqual(usage.questionsGenerated, 0);
    assert.strictEqual(usage.totalAIGenerations, 0);
    assert.strictEqual(usage.pdfExports, 0);
  });

  // Logout
  await runTest('POST /api/auth/logout clears auth cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });

  console.log('\n------------------------------------------------------');
  console.log(`   Integration Test Results: ${passedTests}/${totalTests} Passed`);
  console.log('------------------------------------------------------\n');

  server.close(() => {
    process.exit(passedTests === totalTests ? 0 : 1);
  });
}

start().catch(err => {
  console.error('Test runner fatal error:', err);
  if (server) server.close();
  process.exit(1);
});
