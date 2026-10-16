/**
 * AI Teacher Assistant - Client-side Application Script
 */

let activeGenType = 'notes';
let currentDoc = {
  id: null,
  title: '',
  subject: '',
  topic: '',
  type: 'notes',
  difficulty: 'medium',
  content: '',
  isSaved: false
};

// Simple Markdown to HTML Parser
function parseMarkdown(md) {
  if (!md) return '';

  let html = md
    // Escape basic HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Unordered list items
  html = html.replace(/^[*\-] (.*$)/gim, '<li>$1</li>');

  // Ordered list items
  html = html.replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');

  // Wrap lists
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, '<ul>$1</ul>');

  // Paragraphs
  html = html.replace(/\n\s*\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  return html;
}

// Toast Alert Utility
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

// Auth Handlers
async function handleLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('loginAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  alertEl.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-spinner').style.display = 'inline-block';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed.');
    }

    showToast('Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 400);
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-spinner').style.display = 'none';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const alertEl = document.getElementById('registerAlert');
  const submitBtn = document.getElementById('registerSubmitBtn');
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  alertEl.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-spinner').style.display = 'inline-block';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    showToast('Registration successful! 2-Month trial activated.', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 400);
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-spinner').style.display = 'none';
  }
}

async function logoutUser() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  } catch (err) {
    window.location.href = '/login';
  }
}

function quickFillDemoLogin() {
  document.getElementById('email').value = 'teacher.demo@school.edu';
  document.getElementById('password').value = 'TeacherPass123';
  // If not yet registered, trigger register directly or submit
  const form = document.getElementById('loginForm');
  if (form) form.dispatchEvent(new Event('submit'));
}

// Dashboard Interactivity
function setSubjectTopic(subject, topic) {
  const subEl = document.getElementById('subjectInput');
  const topEl = document.getElementById('topicInput');
  if (subEl) subEl.value = subject;
  if (topEl) topEl.value = topic;
}

function switchGenerationType(type) {
  activeGenType = type;

  // Toggle tab buttons
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`tab${type.charAt(0).toUpperCase() + type.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Toggle options panels
  document.getElementById('notesOptions').style.display = type === 'notes' ? 'block' : 'none';
  document.getElementById('assignmentOptions').style.display = type === 'assignment' ? 'block' : 'none';
  document.getElementById('questionsOptions').style.display = type === 'questions' ? 'block' : 'none';
}

function setViewMode(mode) {
  const previewBtn = document.getElementById('btnPreviewMode');
  const editBtn = document.getElementById('btnEditMode');
  const previewPane = document.getElementById('previewPane');
  const editorPane = document.getElementById('editorPane');

  if (mode === 'preview') {
    previewBtn.classList.add('active');
    editBtn.classList.remove('active');
    previewPane.style.display = 'block';
    editorPane.style.display = 'none';
    renderPreview();
  } else {
    editBtn.classList.add('active');
    previewBtn.classList.remove('active');
    previewPane.style.display = 'none';
    editorPane.style.display = 'flex';
  }
}

function handleEditorInput() {
  const rawText = document.getElementById('rawEditor').value;
  currentDoc.content = rawText;
  currentDoc.isSaved = false;
  updateSaveStateBadge('Unsaved Changes', 'warning');
}

function renderPreview() {
  const previewEl = document.getElementById('previewContent');
  if (!currentDoc.content) {
    previewEl.innerHTML = `
      <div class="empty-workspace">
        <div class="empty-icon">💡</div>
        <h3>Your workspace is ready</h3>
        <p>Select a subject and topic on the left, then click <strong>"Generate with AI"</strong> to create lecture notes, assignments, or questions.</p>
      </div>`;
    return;
  }
  previewEl.innerHTML = parseMarkdown(currentDoc.content);
}

function updateSaveStateBadge(text, state) {
  const badge = document.getElementById('docSaveStateTag');
  if (!badge) return;
  badge.textContent = text;
  badge.className = 'badge ' + (state === 'saved' ? 'badge-questions' : state === 'warning' ? 'badge-assignment' : 'badge-neutral');
}

async function triggerAIGeneration() {
  const subjectInput = document.getElementById('subjectInput');
  const topicInput = document.getElementById('topicInput');
  const generateBtn = document.getElementById('generateBtn');
  const statusMsg = document.getElementById('generationStatusMsg');

  const subject = (subjectInput ? subjectInput.value : '').trim();
  const topic = (topicInput ? topicInput.value : '').trim();

  if (!subject) {
    showToast('Please enter a Subject (e.g. Physics, History)', 'error');
    if (subjectInput) subjectInput.focus();
    return;
  }

  if (!topic) {
    showToast('Please enter a Topic or Lesson Unit', 'error');
    if (topicInput) topicInput.focus();
    return;
  }

  generateBtn.disabled = true;
  generateBtn.querySelector('.btn-spinner').style.display = 'inline-block';
  statusMsg.style.display = 'flex';

  let endpoint = '/api/ai/notes';
  let payload = { subject, topic };
  let difficulty = 'medium';

  if (activeGenType === 'notes') {
    endpoint = '/api/ai/notes';
    const gradeLevel = document.getElementById('gradeLevel').value;
    const additionalInstructions = document.getElementById('notesInstructions').value;
    payload.gradeLevel = gradeLevel;
    payload.additionalInstructions = additionalInstructions;
  } else if (activeGenType === 'assignment') {
    endpoint = '/api/ai/assignments';
    const checkedDiff = document.querySelector('input[name="assignmentDifficulty"]:checked');
    difficulty = checkedDiff ? checkedDiff.value : 'medium';
    const instructions = document.getElementById('assignmentInstructions').value;
    payload.difficulty = difficulty;
    payload.instructions = instructions;
  } else if (activeGenType === 'questions') {
    endpoint = '/api/ai/questions';
    const checkedDiff = document.querySelector('input[name="questionDifficulty"]:checked');
    difficulty = checkedDiff ? checkedDiff.value : 'medium';
    const questionCount = document.getElementById('questionCount').value;
    const questionType = document.getElementById('questionType').value;
    payload.difficulty = difficulty;
    payload.questionCount = questionCount;
    payload.questionType = questionType;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      if (res.status === 403 && data.trial && data.trial.isExpired) {
        throw new Error('Your 2-month free trial has expired. Upgrade required to generate new content.');
      }
      throw new Error(data.message || 'Generation failed.');
    }

    // Populate Workspace State
    currentDoc.id = null; // New unsaved document
    currentDoc.title = data.title || `${subject} - ${topic}`;
    currentDoc.subject = subject;
    currentDoc.topic = topic;
    currentDoc.type = activeGenType;
    currentDoc.difficulty = difficulty;
    currentDoc.content = data.content;
    currentDoc.isSaved = false;

    // Update UI elements
    document.getElementById('docTitleInput').value = currentDoc.title;
    document.getElementById('rawEditor').value = currentDoc.content;
    document.getElementById('docTypeTag').textContent = activeGenType.toUpperCase();
    document.getElementById('docDifficultyTag').textContent = difficulty.toUpperCase();
    updateSaveStateBadge('Unsaved Changes', 'warning');

    // Switch to preview mode and render
    setViewMode('preview');
    showToast('AI content generated successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.querySelector('.btn-spinner').style.display = 'none';
    statusMsg.style.display = 'none';
  }
}

async function saveCurrentDocument() {
  if (!currentDoc.content) {
    showToast('Nothing to save. Please generate or write content first.', 'error');
    return;
  }

  const titleInput = document.getElementById('docTitleInput');
  const title = (titleInput ? titleInput.value : '').trim() || currentDoc.title || 'Untitled Document';
  const saveBtn = document.getElementById('saveDocBtn');

  saveBtn.disabled = true;

  try {
    let res;
    if (currentDoc.id) {
      // Update existing
      res = await fetch(`/api/documents/${currentDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: currentDoc.content,
          difficulty: currentDoc.difficulty
        })
      });
    } else {
      // Create new
      res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject: currentDoc.subject || 'General Education',
          topic: currentDoc.topic || 'Lesson Unit',
          type: currentDoc.type,
          difficulty: currentDoc.difficulty,
          content: currentDoc.content
        })
      });
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save document.');
    }

    currentDoc.id = data.document._id || data.document.id;
    currentDoc.title = title;
    currentDoc.isSaved = true;
    updateSaveStateBadge('Saved to Library', 'saved');
    showToast('Document saved to your library!', 'success');

    // Refresh history grid
    await refreshDocumentList();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saveBtn.disabled = false;
  }
}

async function exportCurrentPDF() {
  if (!currentDoc.content) {
    showToast('Please generate or select a document to export.', 'error');
    return;
  }

  // If not yet saved, save it first so it has an ID
  if (!currentDoc.id) {
    showToast('Saving document before PDF export...', 'info');
    await saveCurrentDocument();
  }

  if (currentDoc.id) {
    window.location.href = `/api/documents/${currentDoc.id}/pdf`;
  }
}

async function loadSavedDocument(id) {
  try {
    const res = await fetch(`/api/documents/${id}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load document.');
    }

    const doc = data.document;
    currentDoc = {
      id: doc._id || doc.id,
      title: doc.title,
      subject: doc.subject,
      topic: doc.topic,
      type: doc.type,
      difficulty: doc.difficulty || 'medium',
      content: doc.content,
      isSaved: true
    };

    document.getElementById('docTitleInput').value = currentDoc.title;
    document.getElementById('rawEditor').value = currentDoc.content;
    document.getElementById('docTypeTag').textContent = (currentDoc.type || 'DOCUMENT').toUpperCase();
    document.getElementById('docDifficultyTag').textContent = (currentDoc.difficulty || 'MEDIUM').toUpperCase();
    updateSaveStateBadge('Loaded (Saved)', 'saved');

    // Fill the generator inputs as well for easy continuation
    const subEl = document.getElementById('subjectInput');
    const topEl = document.getElementById('topicInput');
    if (subEl) subEl.value = currentDoc.subject;
    if (topEl) topEl.value = currentDoc.topic;
    switchGenerationType(currentDoc.type);

    setViewMode('preview');
    window.scrollTo({ top: 120, behavior: 'smooth' });
    showToast(`Loaded "${currentDoc.title}"`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteSavedDocument(id) {
  if (!confirm('Are you sure you want to delete this document from your library?')) {
    return;
  }

  try {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete document.');
    }

    showToast('Document deleted.', 'info');
    if (currentDoc.id === id) {
      clearWorkspace();
    }
    await refreshDocumentList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function refreshDocumentList() {
  try {
    const res = await fetch('/api/documents');
    const data = await res.json();
    if (!res.ok || !data.success) return;

    const grid = document.getElementById('documentsList');
    if (!grid) return;

    if (data.documents.length === 0) {
      grid.innerHTML = `
        <div id="noDocsNotice" class="no-docs-box">
          <div class="no-docs-icon">📂</div>
          <h4>No documents saved yet</h4>
          <p>Generated materials you save will appear here in your teacher library.</p>
        </div>`;
      return;
    }

    grid.innerHTML = data.documents.map(doc => `
      <div class="document-item-card" data-id="${doc._id || doc.id}" data-type="${doc.type}" data-title="${doc.title}" data-subject="${doc.subject}">
        <div class="doc-card-top">
          <span class="doc-badge badge-${doc.type}">${(doc.type || '').toUpperCase()}</span>
          <span class="doc-difficulty badge-subtle">${doc.difficulty || 'standard'}</span>
        </div>
        <h3 class="doc-card-title">${doc.title}</h3>
        <p class="doc-card-details"><strong>${doc.subject}</strong> &bull; ${doc.topic}</p>
        <p class="doc-card-date">Saved on ${new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</p>

        <div class="doc-card-actions">
          <button type="button" class="btn btn-outline-sm btn-block" onclick="loadSavedDocument('${doc._id || doc.id}')">
            👁️ Load in Workspace
          </button>
          <div class="doc-card-btn-row">
            <a href="/api/documents/${doc._id || doc.id}/pdf" class="btn btn-secondary-sm flex-1" target="_blank" download>
              📄 PDF
            </a>
            <button type="button" class="btn btn-outline-sm text-danger" onclick="deleteSavedDocument('${doc._id || doc.id}')">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to refresh document list:', err);
  }
}

function filterDocuments() {
  const query = (document.getElementById('searchDocsInput').value || '').toLowerCase();
  const cards = document.querySelectorAll('.document-item-card');

  cards.forEach(card => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const subject = (card.getAttribute('data-subject') || '').toLowerCase();
    const matches = title.includes(query) || subject.includes(query);
    card.style.display = matches ? 'flex' : 'none';
  });
}

function filterDocsByType(type, btn) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('.document-item-card');
  cards.forEach(card => {
    const cardType = card.getAttribute('data-type');
    if (type === 'all' || cardType === type) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function copyDocumentContent() {
  if (!currentDoc.content) {
    showToast('Workspace is empty.', 'error');
    return;
  }
  navigator.clipboard.writeText(currentDoc.content)
    .then(() => showToast('Content copied to clipboard!', 'success'))
    .catch(() => showToast('Failed to copy to clipboard.', 'error'));
}

function clearWorkspace() {
  currentDoc = {
    id: null,
    title: '',
    subject: '',
    topic: '',
    type: 'notes',
    difficulty: 'medium',
    content: '',
    isSaved: false
  };
  document.getElementById('docTitleInput').value = '';
  document.getElementById('rawEditor').value = '';
  updateSaveStateBadge('Ready', 'neutral');
  renderPreview();
  showToast('Workspace cleared.', 'info');
}
