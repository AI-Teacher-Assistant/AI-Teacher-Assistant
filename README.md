# AI Teacher Assistant 🎓

> Hackathon project — Deadline: Saturday, 17 October 2026

An AI-powered tool that helps teachers instantly generate quizzes, lesson plans, and assignments using Google Gemini.

---

## Team

| Member | Role | Branch |
|--------|------|--------|
| Sunaina (Member 1) | Frontend & UI | `frontend` |
| Member 2 | Backend, Auth, DB, API Contracts | `backend` |
| Member 3 | AI Integration (Gemini) | `ai` |
| Member 4 | PDF Export, Free Trial Logic, Testing | `testing` |

---

## Getting Started

### Backend (Member 2 sets this up)
```bash
cd backend
npm install
cp .env.example .env   # fill in secrets
node server.js         # runs on http://localhost:5000
```

### Frontend (no build step needed)
Open `frontend/index.html` with **Live Server** (VS Code extension) or any static server:
```bash
npx serve frontend
# or open index.html directly in browser
```

---

## Project Structure

```
ai-teacher-assistant/
├── frontend/               ← Member 1
│   ├── index.html          Login / Signup
│   ├── dashboard.html      Main dashboard
│   ├── quiz.html           Quiz generator
│   ├── lesson.html         Lesson planner
│   ├── assignment.html     Assignment maker
│   ├── css/styles.css      All styles
│   └── js/
│       ├── api.js          Centralised fetch layer
│       ├── auth.js         Token & session helpers
│       └── free-trial.js   Trial counter UI
├── backend/                ← Member 2
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── generate.js
│   │   └── export.js
│   ├── models/User.js
│   ├── middleware/auth.js
│   └── .env
├── README.md
└── API_CONTRACT.md
```

---

## Stack

- **Frontend**: Plain HTML + CSS + Vanilla JS (ES Modules, no build step)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini API
- **Auth**: JWT (JSON Web Tokens)
- **PDF**: Puppeteer / html-pdf (backend)

---

## Environment Variables

See `API_CONTRACT.md` for the full list.
