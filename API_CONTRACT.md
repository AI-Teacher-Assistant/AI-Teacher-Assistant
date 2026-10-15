# API Contract — AI Teacher Assistant

> **Do not change endpoint names, request fields, or response formats without team agreement.**
> Last updated: 15 October 2026 — Member 1 (Sunaina)

---

## Base URL
```
http://localhost:5000/api
```
Frontend uses this value in `frontend/js/api.js → API_BASE`.

---

## Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### `POST /api/auth/register`
**Request**
```json
{ "name": "string", "email": "string", "password": "string" }
```
**Response `200`**
```json
{
  "success": true,
  "token": "jwt_string",
  "user": { "name": "string", "email": "string", "trialsUsed": 0, "trialLimit": 5 }
}
```

---

### `POST /api/auth/login`
**Request**
```json
{ "email": "string", "password": "string" }
```
**Response `200`**
```json
{
  "success": true,
  "token": "jwt_string",
  "user": { "name": "string", "email": "string", "trialsUsed": 0, "trialLimit": 5 }
}
```

---

### `GET /api/auth/me` *(Protected)*
**Response `200`**
```json
{
  "success": true,
  "user": { "name": "string", "email": "string", "trialsUsed": 2, "trialLimit": 5 }
}
```

---

### `POST /api/generate/quiz` *(Protected)*
**Request**
```json
{ "topic": "string", "numQuestions": 5, "difficulty": "easy|medium|hard", "grade": "string" }
```
**Response `200`**
```json
{
  "success": true,
  "data": {
    "topic": "string",
    "questions": [
      { "question": "string", "options": ["A","B","C","D"], "answer": "A" }
    ]
  },
  "trialsUsed": 1,
  "trialLimit": 5
}
```

---

### `POST /api/generate/lesson` *(Protected)*
**Request**
```json
{ "topic": "string", "grade": "string", "duration": "45 minutes" }
```
**Response `200`**
```json
{
  "success": true,
  "data": {
    "topic": "string",
    "objectives": ["string"],
    "introduction": "string",
    "mainContent": "string",
    "activities": ["string"],
    "summary": "string",
    "homework": "string"
  },
  "trialsUsed": 2,
  "trialLimit": 5
}
```

---

### `POST /api/generate/assignment` *(Protected)*
**Request**
```json
{ "topic": "string", "grade": "string", "numQuestions": 10, "type": "short-answer|long-answer|mixed" }
```
**Response `200`**
```json
{
  "success": true,
  "data": {
    "topic": "string",
    "questions": [
      { "question": "string", "type": "short-answer", "marks": 2 }
    ]
  },
  "trialsUsed": 3,
  "trialLimit": 5
}
```

---

### `POST /api/export/pdf` *(Protected)*
**Request**
```json
{ "htmlContent": "string", "filename": "string" }
```
**Response**: PDF binary (`Content-Type: application/pdf`)

---

## Error Format (all endpoints)
```json
{ "success": false, "message": "Human-readable error description" }
```

---

## Database Model — User

```js
{
  name:       String,   // required
  email:      String,   // required, unique
  password:   String,   // bcrypt hashed
  trialsUsed: Number,   // default: 0
  trialLimit: Number,   // default: 5
  createdAt:  Date
}
```

---

## Environment Variables (`backend/.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-teacher-assistant
JWT_SECRET=replace_with_strong_secret
GEMINI_API_KEY=replace_with_gemini_key
```
