# AI Teacher Assistant 🎓✨

> **Hackathon Submission Deadline:** Saturday, 17 October 2026
> **Shared Antigravity Source of Truth:** Aligned with [`ANTIGRAVITY_CONTEXT.md`](./ANTIGRAVITY_CONTEXT.md) and [`API_CONTRACT.md`](./API_CONTRACT.md).

AI Teacher Assistant is a web application designed to empower educators by streamlining the preparation of classroom-ready materials using AI. A teacher can register or log in, select any subject and topic, generate lecture notes, assignments, or tiered question banks (Easy, Medium, Hard), preview and edit the material live, save it to their personal library, and export it as a clean, professionally formatted PDF.

---

## 🚀 Key Features (MVP Delivered)

1. **Teacher Registration & Authentication:** Secure registration and login with bcrypt password hashing, HTTP-only JWT cookies, and session management.
2. **Two-Month Free Educator Trial & Usage Tracking:** Automatic 60-day trial activated on signup, with trial countdown badges, server-side trial enforcement, and per-teacher usage tracking (`notesGenerated`, `assignmentsGenerated`, `questionsGenerated`, `totalAIGenerations`, `pdfExports`).
3. **Protected Teacher Workspace & Dashboard:** Personalized dashboard with subject and topic selection and quick suggestions.
4. **AI Lecture Notes Generator:** Creates structured lecture notes with learning objectives, core concepts, in-depth breakdowns, real-world examples, and discussion prompts.
5. **AI Assignment Generator:** Generates coursework with conceptual foundations, problem-solving scenarios, point distributions, and teacher grading rubrics.
6. **AI Tiered Question Bank Generator:** Produces tiered questions across **Easy**, **Medium**, and **Hard** difficulty levels with multiple-choice, short-answer, and comprehensive answer keys/explanations.
7. **Live Preview & Interactive Editor:** Instant markdown-rendered preview alongside an editable raw text area for fine-tuning lesson materials before saving.
8. **Document Persistence & Teacher Isolation:** Full CRUD support (`/api/documents`) with strict ownership checks preventing one teacher from accessing another teacher's materials.
9. **Professional A4 PDF Export:** Generates clean, printable A4 PDF worksheets with metadata, dynamic height calculation, orphan heading prevention, answer key formatting, and zero trailing page overflow.
10. **Resilient AI & Database Architecture:** Supports Google Gemini API while featuring a built-in intelligent educational fallback engine and resilient storage adapter so the demo runs seamlessly anywhere.
11. **System Health & Deployment Monitoring:** Dedicated `/api/health` endpoint reporting service uptime, timestamp, and database adapter status for cloud deployment and uptime monitors.

---

## 🛠️ Technology Stack

- **Frontend:** EJS (Embedded JavaScript templates), Modern Vanilla JavaScript, CSS3 Design System.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose (with automated fallback store for offline testing).
- **Authentication:** JSON Web Tokens (JWT) & HTTP-only cookies, bcryptjs.
- **AI Integration:** Google Gemini Generative AI (`@google/generative-ai`) with resilient template fallback.
- **PDF Generation:** PDFKit.
- **Testing:** Comprehensive automated integration test suite (`tests/integration.test.js`).

---

## 👥 Team Ownership & Module Structure

| Role | Module | Key Files Owned |
| :--- | :--- | :--- |
| **Member 1** | Frontend & UI | `views/dashboard.ejs`, `views/auth/*.ejs`, `views/partials/*.ejs`, `public/css/styles.css`, `public/js/app.js`, `src/routes/viewRoutes.js` |
| **Member 2** | Backend, Auth & Database | `src/server.js`, `src/app.js`, `src/config/db.js`, `src/models/*.js`, `src/middleware/auth.js`, `src/routes/authRoutes.js`, `src/routes/teacherRoutes.js`, `API_CONTRACT.md` |
| **Member 3** | AI Integration & Content | `src/services/aiService.js`, `src/routes/aiRoutes.js` |
| **Member 4** | PDF, Trial Logic & Testing | `src/services/pdfService.js`, `src/middleware/trial.js`, `src/routes/documentRoutes.js`, `tests/integration.test.js` |

---

## 📂 Project Structure

```text
AI-Teacher-Assistant/
├── ANTIGRAVITY_CONTEXT.md      # Shared team specification & MVP checklist
├── API_CONTRACT.md             # Shared endpoint documentation
├── README.md                   # Setup guide and architecture overview
├── package.json                # Project dependencies and npm scripts
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── public/                     # Static assets
│   ├── css/
│   │   └── styles.css          # Modern educational UI stylesheet
│   └── js/
│       └── app.js              # Client-side reactivity, API calls, preview
├── src/                        # Backend application source
│   ├── config/
│   │   └── db.js               # MongoDB connection & fallback adapter
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & ownership middleware
│   │   └── trial.js            # 2-month free trial enforcement middleware
│   ├── models/
│   │   ├── Teacher.js          # Teacher schema & repository
│   │   └── Document.js         # Document schema & repository
│   ├── routes/
│   │   ├── authRoutes.js       # Register, Login, Logout
│   │   ├── teacherRoutes.js    # Teacher profile & subscription status
│   │   ├── aiRoutes.js         # Notes, Assignments, Question endpoints
│   │   ├── documentRoutes.js   # CRUD & PDF export routes
│   │   └── viewRoutes.js       # Page rendering routes
│   ├── services/
│   │   ├── aiService.js        # Gemini API & educational engine
│   │   └── pdfService.js       # PDFKit document generator
│   ├── app.js                  # Express application setup
│   └── server.js               # Server entry point
├── tests/
│   └── integration.test.js     # End-to-end automated test suite
└── views/                      # EJS templates
    ├── auth/
    │   ├── login.ejs
    │   └── register.ejs
    ├── partials/
    │   ├── header.ejs
    │   ├── footer.ejs
    │   └── 404.ejs
    ├── dashboard.ejs           # Main teacher workspace & library
    └── index.ejs               # Landing page
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- (Optional) MongoDB local service or MongoDB Atlas connection string. If MongoDB is not active, the system automatically runs with a built-in in-memory store so the app can be evaluated immediately without setup friction.
- (Optional) Google Gemini API Key. If none is supplied, the built-in intelligent educational fallback engine generates formatted materials.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/AI-Teacher-Assistant/AI-Teacher-Assistant.git
cd AI-Teacher-Assistant
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory (copied from `.env.example`):
```bash
cp .env.example .env
```

Default contents:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai-teacher-assistant
JWT_SECRET=ai_teacher_assistant_jwt_secret_key_hackathon_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Application
Start the development server:
```bash
npm start
```
The server will start at:
- **Web Application:** `http://localhost:3000`
- **Dashboard:** `http://localhost:3000/dashboard`
- **API Base:** `http://localhost:3000/api`

---

## 🧪 Running Automated Tests

Run the full end-to-end integration test suite:
```bash
npm test
```
The test suite validates 31 automated assertions across the entire backend:
- [x] Teacher registration and token generation.
- [x] Duplicate email rejection (400 Bad Request).
- [x] Teacher login and session verification.
- [x] Profile retrieval with accurate 2-month trial metadata and usage counters.
- [x] Unauthenticated request rejection (401 Unauthorized).
- [x] Empty subject/topic validation (400 Bad Request).
- [x] AI Notes generation with learning objectives and discussion prompts.
- [x] AI Assignment generation with grading rubrics.
- [x] AI Question generation across **Easy**, **Medium**, and **Hard** tiers with answer keys.
- [x] Document saving and retrieval.
- [x] Strict cross-teacher ownership isolation (Teacher 2 cannot read Teacher 1 documents).
- [x] Document inline editing and updates (PATCH).
- [x] Binary PDF export with correct headers (`%PDF-`).
- [x] Cross-teacher PDF download isolation (Teacher 2 cannot download Teacher 1 PDF by changing document ID).
- [x] PDF export rejects missing document IDs safely (404 Not Found).
- [x] PDF export rejects malformed document IDs safely without crashes or 500 errors (404 Not Found).
- [x] PDF export rejects unauthenticated requests (401 Unauthorized).
- [x] Multi-page PDF generation with question banks, callouts, and page numbers.
- [x] Expired trial blocks PDF export (403 Forbidden).
- [x] Server-side expired trial enforcement blocks AI generation (403 Forbidden).
- [x] Document deletion and library updates.
- [x] System health monitoring endpoint (`GET /api/health`).
- [x] Real-time usage tracking (`notesGenerated`, `assignmentsGenerated`, `questionsGenerated`, `totalAIGenerations`, `pdfExports`).
- [x] Strict cross-teacher usage isolation (Teacher 2 counters remain at zero).
- [x] Frontend profile endpoint (`GET /api/auth/me`).
- [x] Frontend MCQ Quiz generation (`POST /api/generate/quiz`).
- [x] Frontend Lesson Plan generation (`POST /api/generate/lesson`).
- [x] Frontend Assignment generation (`POST /api/generate/assignment`).
- [x] Frontend direct PDF export (`POST /api/export/pdf`).
- [x] Frontend interactive generator pages (`/quiz`, `/lesson`, `/assignment`).
- [x] Secure logout and auth cookie clearance.

---

## 💳 Subscription, Usage & Billing Gateway Assessment

- **60-Day Free Trial:** Every newly registered educator is automatically granted a 60-day full access trial (`planName: '2-Month Free Educator Trial'`).
- **Server-Side Enforcement:** Trial expiration is actively guarded on all AI generation and PDF export routes via `requireActiveTrial` middleware. Expired accounts receive a structured `403 Forbidden` response prompting renewal.
- **Granular Usage Tracking:** Real-time generation counters track usage across lecture notes, assignments, question banks, total AI calls, and PDF exports per educator account, exposed via `GET /api/teachers/me` and `GET /api/subscription/status`.
- **Payment Gateway Status:** **Pending (Post-Hackathon Phase)** — In strict accordance with hackathon requirements, no unapproved subscription fees or mockup billing forms are active. Educators and hackathon judges enjoy full platform access during the trial evaluation period with zero payment friction.

---

## 📖 API Summary

Refer to [`API_CONTRACT.md`](./API_CONTRACT.md) for full request/response schemas.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime, timestamp & database status | No |
| `POST` | `/api/auth/register` | Register new teacher with 60-day trial | No |
| `POST` | `/api/auth/login` | Authenticate teacher & set cookie/token | No |
| `POST` | `/api/auth/logout` | Clear session & cookie | No |
| `GET` | `/api/auth/me` | Current teacher profile in frontend schema | Yes |
| `GET` | `/api/teachers/me` | Current teacher profile with usage metrics | Yes |
| `GET` | `/api/subscription/status`| Check 2-month trial status & usage metrics | Yes |
| `POST` | `/api/generate/quiz` | Generate MCQ questions for Quiz Maker | Yes + Active Trial |
| `POST` | `/api/generate/lesson` | Generate complete structured Lesson Plan | Yes + Active Trial |
| `POST` | `/api/generate/assignment` | Generate customized Assignment worksheet | Yes + Active Trial |
| `POST` | `/api/export/pdf` | Export HTML/Text directly as binary PDF | Yes + Active Trial |
| `POST` | `/api/ai/notes` | Generate lecture notes (increments usage) | Yes + Active Trial |
| `POST` | `/api/ai/assignments` | Generate assignment & rubrics (increments usage) | Yes + Active Trial |
| `POST` | `/api/ai/questions` | Generate Easy, Medium, or Hard questions (increments usage) | Yes + Active Trial |
| `GET` | `/api/documents` | List teacher's documents | Yes |
| `POST` | `/api/documents` | Save document to library | Yes |
| `GET` | `/api/documents/:id` | Retrieve single document (owned) | Yes |
| `PATCH`| `/api/documents/:id` | Update document title/content | Yes |
| `DELETE`| `/api/documents/:id`| Delete document | Yes |
| `GET` | `/api/documents/:id/pdf`| Export document as PDF (increments usage) | Yes + Active Trial |


---

## 🏆 MVP Completion Status

- [x] Teacher registration and login with bcrypt hashing and JWT.
- [x] Protected teacher dashboard with reactive interface.
- [x] Subject and topic input with instant suggestions.
- [x] AI-generated notes with pedagogical structure.
- [x] AI-generated assignments with point rubrics.
- [x] AI-generated questions with Easy, Medium, and Hard difficulty tiers.
- [x] Generated-content preview and live editing.
- [x] Save, retrieve, and delete educator documents.
- [x] Multi-page A4 PDF export with callouts, answer keys, page numbers, and zero trailing page overflow.
- [x] Two-month free-trial status and strict server-side expiry checks.
- [x] Granular per-teacher usage metrics tracking.
- [x] Strict cross-teacher data and PDF download isolation.
- [x] Comprehensive input validation and resilient in-memory fallback.
- [x] 31/31 automated integration tests passing.
