# AI Teacher Assistant - API Contract

This document defines the confirmed API contract for the AI Teacher Assistant hackathon MVP, aligned with `ANTIGRAVITY_CONTEXT.md`.

## Base URL
`/api`

## Authentication & Headers
- Protected routes require a valid JWT token.
- Supported via:
  1. `Authorization: Bearer <token>` HTTP Header, or
  2. `token` HTTP-only Cookie.

---

## 1. Authentication Endpoints

### Register Teacher
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@school.edu",
    "password": "Password123"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "message": "Registration successful. 2-month free trial activated.",
    "token": "eyJhbGciOi...",
    "teacher": {
      "id": "670f...",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "trialStartDate": "2026-10-16T00:00:00.000Z",
      "trialEndDate": "2026-12-16T00:00:00.000Z",
      "isTrialActive": true,
      "daysRemaining": 61
    }
  }
  ```

### Login Teacher
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "jane@school.edu",
    "password": "Password123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOi...",
    "teacher": {
      "id": "670f...",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "trialStartDate": "2026-10-16T00:00:00.000Z",
      "trialEndDate": "2026-12-16T00:00:00.000Z",
      "isTrialActive": true,
      "daysRemaining": 61
    }
  }
  ```

### Logout Teacher
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. Teacher & Subscription Endpoints

### Current Teacher Profile
- **Method:** `GET`
- **Path:** `/api/teachers/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "teacher": {
      "id": "670f...",
      "name": "Jane Doe",
      "email": "jane@school.edu",
      "trialStartDate": "2026-10-16T00:00:00.000Z",
      "trialEndDate": "2026-12-16T00:00:00.000Z",
      "isTrialActive": true,
      "daysRemaining": 61,
      "usage": {
        "notesGenerated": 1,
        "assignmentsGenerated": 1,
        "questionsGenerated": 3,
        "totalAIGenerations": 5,
        "pdfExports": 2
      }
    }
  }
  ```

### Trial & Subscription Status
- **Method:** `GET`
- **Path:** `/api/subscription/status`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "trial": {
      "isActive": true,
      "isValid": true,
      "startDate": "2026-10-16T00:00:00.000Z",
      "endDate": "2026-12-16T00:00:00.000Z",
      "daysRemaining": 61,
      "isExpired": false,
      "planName": "2-Month Free Educator Trial"
    },
    "usage": {
      "notesGenerated": 1,
      "assignmentsGenerated": 1,
      "questionsGenerated": 3,
      "totalAIGenerations": 5,
      "pdfExports": 2
    }
  }
  ```

### System Health Check
- **Method:** `GET`
- **Path:** `/api/health`
- **Headers:** None (Public monitoring endpoint)
- **Response:** `200 OK`
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-17T12:00:00.000Z",
    "uptime": 128,
    "database": "mongodb"
  }
  ```

---

## 3. AI Generation Endpoints (Protected by Auth & Trial)

### Generate Notes
- **Method:** `POST`
- **Path:** `/api/ai/notes`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "subject": "Physics",
    "topic": "Newton's Laws of Motion",
    "gradeLevel": "High School",
    "additionalInstructions": "Include practical real-world examples"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "type": "notes",
    "subject": "Physics",
    "topic": "Newton's Laws of Motion",
    "title": "Comprehensive Notes: Newton's Laws of Motion",
    "content": "Markdown/formatted text content...",
    "wordCount": 540
  }
  ```

### Generate Assignment
- **Method:** `POST`
- **Path:** `/api/ai/assignments`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "subject": "History",
    "topic": "The Industrial Revolution",
    "difficulty": "medium",
    "instructions": "Include short essay prompts and research questions"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "type": "assignment",
    "subject": "History",
    "topic": "The Industrial Revolution",
    "difficulty": "medium",
    "title": "Assignment: The Industrial Revolution",
    "content": "Assignment structure, tasks, and rubric..."
  }
  ```

### Generate Questions
- **Method:** `POST`
- **Path:** `/api/ai/questions`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "subject": "Computer Science",
    "topic": "Binary Search Trees",
    "difficulty": "medium",
    "questionCount": 5,
    "questionType": "mixed"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "type": "questions",
    "subject": "Computer Science",
    "topic": "Binary Search Trees",
    "difficulty": "medium",
    "questionCount": 5,
    "title": "Question Bank: Binary Search Trees (Medium)",
    "content": "Formatted question list with answers/explanations..."
  }
  ```

---

## 4. Document Management Endpoints

### List Teacher's Documents
- **Method:** `GET`
- **Path:** `/api/documents`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "count": 2,
    "documents": [
      {
        "_id": "670f1a...",
        "title": "Comprehensive Notes: Newton's Laws of Motion",
        "subject": "Physics",
        "topic": "Newton's Laws of Motion",
        "type": "notes",
        "difficulty": "all",
        "createdAt": "2026-10-16T00:30:00.000Z",
        "updatedAt": "2026-10-16T00:30:00.000Z"
      }
    ]
  }
  ```

### Save / Create Document
- **Method:** `POST`
- **Path:** `/api/documents`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Comprehensive Notes: Newton's Laws of Motion",
    "subject": "Physics",
    "topic": "Newton's Laws of Motion",
    "type": "notes",
    "difficulty": "medium",
    "content": "# Newton's Laws..."
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "message": "Document saved successfully",
    "document": { ... }
  }
  ```

### Retrieve Owned Document
- **Method:** `GET`
- **Path:** `/api/documents/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "document": { ... }
  }
  ```

### Update Owned Document
- **Method:** `PATCH`
- **Path:** `/api/documents/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content..."
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Document updated successfully",
    "document": { ... }
  }
  ```

### Delete Owned Document
- **Method:** `DELETE`
- **Path:** `/api/documents/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```

---

## 5. PDF Export Endpoint

### Export Owned Document as PDF
- **Method:** `GET`
- **Path:** `/api/documents/:id/pdf`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="Document-Title.pdf"`
  - Body: Binary PDF stream

---

## 6. Error Handling Format

All endpoints return a standardized JSON error format:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": []
}
```
Standard status codes:
- `400 Bad Request`: Validation failure (missing required fields)
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Cross-teacher document access or trial expired
- `404 Not Found`: Resource does not exist
- `500 Internal Server Error`: Server or provider failure
