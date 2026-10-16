# AI Teacher Assistant 🎓✨

> **Hackathon Submission Deadline:** Saturday, 17 October 2026
> **Shared Antigravity Source of Truth:** Aligned with [`ANTIGRAVITY_CONTEXT.md`](./ANTIGRAVITY_CONTEXT.md) and [`API_CONTRACT.md`](./API_CONTRACT.md).

AI Teacher Assistant is a web application designed to empower educators by streamlining the preparation of classroom-ready materials using AI. A teacher can register or log in, select any subject and topic, generate lecture notes, assignments, or tiered question banks (Easy, Medium, Hard), preview and edit the material live, save it to their personal library, and export it as a clean, professionally formatted PDF.

---

## 🚀 Key Features (MVP Delivered)

1. **Teacher Registration & Authentication:** Secure registration and login with bcrypt password hashing, HTTP-only JWT cookies, and session management.
2. **Two-Month Free Educator Trial:** Automatic 60-day trial activated on signup, with trial countdown badges and server-side trial enforcement.
3. **Protected Teacher Workspace & Dashboard:** Personalized dashboard with subject and topic selection and quick suggestions.
4. **AI Lecture Notes Generator:** Creates structured lecture notes with learning objectives, core concepts, in-depth breakdowns, real-world examples, and discussion prompts.
5. **AI Assignment Generator:** Generates coursework with conceptual foundations, problem-solving scenarios, point distributions, and teacher grading rubrics.
6. **AI Tiered Question Bank Generator:** Produces tiered questions across **Easy**, **Medium**, and **Hard** difficulty levels with multiple-choice, short-answer, and comprehensive answer keys/explanations.
7. **Live Preview & Interactive Editor:** Instant markdown-rendered preview alongside an editable raw text area for fine-tuning lesson materials before saving.
8. **Document Persistence & Teacher Isolation:** Full CRUD support (`/api/documents`) with strict ownership checks preventing one teacher from accessing another teacher's materials.
9. **PDF Export:** Generates high-quality, printable PDF worksheets complete with headers, metadata, student-friendly formatting, and page numbers.
10. **Resilient AI & Database Architecture:** Supports Google Gemini API while featuring a built-in intelligent educational fallback engine and resilient storage adapter so the demo runs seamlessly anywhere.

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
The test suite validates:
- [x] Teacher registration and token generation.
- [x] Duplicate email rejection.
- [x] Teacher login and session verification.
- [x] Profile retrieval and 2-month trial metadata.
- [x] Unauthenticated request rejection (401).
- [x] Empty subject/topic validation (400).
- [x] AI Notes generation with learning objectives.
- [x] AI Assignment generation with grading rubrics.
- [x] AI Question generation across **Easy**, **Medium**, and **Hard** tiers with answer keys.
- [x] Document saving and retrieval.
- [x] Strict cross-teacher ownership isolation (Teacher 2 cannot access Teacher 1 documents).
- [x] Document inline editing and updates (PATCH).
- [x] Binary PDF export with correct headers (`%PDF-`).
- [x] Server-side expired trial enforcement (403 Forbidden).
- [x] Document deletion.
- [x] Logout handling.

---

## 📖 API Summary

Refer to [`API_CONTRACT.md`](./API_CONTRACT.md) for full request/response schemas.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new teacher with 60-day trial | No |
| `POST` | `/api/auth/login` | Authenticate teacher & set cookie/token | No |
| `POST` | `/api/auth/logout` | Clear session & cookie | No |
| `GET` | `/api/teachers/me` | Current teacher profile | Yes |
| `GET` | `/api/subscription/status`| Check 2-month trial status & days remaining | Yes |
| `POST` | `/api/ai/notes` | Generate lecture notes | Yes + Active Trial |
| `POST` | `/api/ai/assignments` | Generate assignment & rubrics | Yes + Active Trial |
| `POST` | `/api/ai/questions` | Generate Easy, Medium, or Hard questions | Yes + Active Trial |
| `GET` | `/api/documents` | List teacher's documents | Yes |
| `POST` | `/api/documents` | Save document to library | Yes |
| `GET` | `/api/documents/:id` | Retrieve single document (owned) | Yes |
| `PATCH`| `/api/documents/:id` | Update document title/content | Yes |
| `DELETE`| `/api/documents/:id`| Delete document | Yes |
| `GET` | `/api/documents/:id/pdf`| Export document as PDF | Yes + Active Trial |

---

## 🏆 MVP Completion Status

- [x] Teacher registration and login.
- [x] Protected teacher dashboard.
- [x] Subject and topic input with instant suggestions.
- [x] AI-generated notes.
- [x] AI-generated assignments.
- [x] AI-generated questions with Easy, Medium, and Hard difficulty.
- [x] Generated-content preview and live editing.
- [x] Save and retrieve the teacher's generated documents.
- [x] PDF download with educator metadata and formatting.
- [x] Two-month free-trial status and server-side expiry checks.
- [x] Cross-teacher data ownership isolation.
- [x] Validation, clear error messages, and verified setup guide.
