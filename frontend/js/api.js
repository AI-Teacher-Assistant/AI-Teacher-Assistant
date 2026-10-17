/**
 * api.js — Centralised API layer
 * All fetch() calls live here. Backend base URL is configured once.
 * Member 1: Frontend (Sunaina)
 */

const API_BASE = '/api';

/** Low-level request helper */
async function request(method, path, body = null) {
  const token = localStorage.getItem('ata_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    // Surface backend error message to callers
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

/* -------- Auth -------- */
export const api = {
  auth: {
    register: (name, email, password) =>
      request('POST', '/auth/register', { name, email, password }),

    login: (email, password) =>
      request('POST', '/auth/login', { email, password }),

    me: () => request('GET', '/auth/me'),
  },

  /* -------- Generate -------- */
  generate: {
    quiz: (topic, numQuestions, difficulty, grade) =>
      request('POST', '/generate/quiz', { topic, numQuestions, difficulty, grade }),

    lesson: (topic, grade, duration) =>
      request('POST', '/generate/lesson', { topic, grade, duration }),

    assignment: (topic, grade, numQuestions, type) =>
      request('POST', '/generate/assignment', { topic, grade, numQuestions, type }),
  },

  /* -------- Export -------- */
  export: {
    pdf: async (htmlContent, filename) => {
      const token = localStorage.getItem('ata_token');
      const res = await fetch(`${API_BASE}/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ htmlContent, filename }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Export failed');
      }
      // Return blob for download
      return res.blob();
    },
  },
};
