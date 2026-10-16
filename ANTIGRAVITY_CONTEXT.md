# AI Teacher Assistant --- Shared Antigravity Context

> **Purpose:** This is the shared source of truth for all four team
> members using Antigravity. Keep this file in the project root and
> commit it to the shared Git repository.
>
> **Target submission:** Saturday, 17 October 2026.
>
> **Important:** This file describes the intended project and proposed
> contracts. Always inspect the existing repository first. If working
> code or established naming differs, document the difference and agree
> as a team before changing anything.

## 1. Project overview

AI Teacher Assistant is a web application that helps teachers prepare
educational material with AI. A teacher should be able to register or
log in, select a subject and topic, generate notes, assignments, or
questions, preview and edit the generated material, save it, and export
it as a PDF.

The immediate goal is a **stable, integrated MVP**, not a large
collection of unfinished features.

## 2. Core MVP scope

1.  Teacher registration and login.
2.  Protected teacher dashboard.
3.  Subject and topic input.
4.  AI-generated notes.
5.  AI-generated assignments.
6.  AI-generated questions with Easy, Medium, and Hard difficulty.
7.  Generated-content preview and editing.
8.  Save and retrieve the teacher's generated documents.
9.  PDF download.
10. Two-month free-trial status and server-side expiry checks.
11. Validation, useful error messages, and a tested setup guide.

### Optional features --- only after the MVP works

-   Syllabus PDF analysis.
-   Question-paper builder with marks and duration.
-   Answer keys and marking rubrics.
-   Teacher AI chat assistant.
-   Translation, simplification, and examples.
-   Answer evaluation assistance.
-   Department content library and syllabus analytics.
-   Real payment-gateway integration.

Do not begin optional work if it puts the core flow at risk.

## 3. Expected technology stack

Use the repository's current stack and conventions wherever possible.
The intended stack is:

-   Frontend: EJS, HTML, CSS, JavaScript.
-   Backend: Node.js and Express.
-   Database: MongoDB and Mongoose.
-   Authentication: the existing agreed secure approach (JWT or secure
    sessions).
-   AI: one selected provider API called from the backend.
-   PDF: an appropriate PDF generation library.
-   Email: Nodemailer only if the implementation requires it.
-   Collaboration: Git and GitHub.

Do not add a dependency before checking whether the project already has
a suitable one.

## 4. Team ownership

### Member 1 --- Frontend and UI

Owns login/register/dashboard views, subject and topic forms, difficulty
controls, generation buttons, loading/error states, preview/edit UI,
document history UI, and wiring the UI to agreed APIs.

### Member 2 --- Backend, authentication, database, and API contract

Owns the Express server, MongoDB connection, teacher/document models,
auth routes and middleware, protected APIs, document persistence,
ownership checks, and the written API contract.

### Member 3 --- AI integration

Owns one reusable backend AI service and the generation logic for notes,
assignments, and questions. Coordinates endpoint request/response
formats with Member 2. Keeps provider credentials on the server.

### Member 4 --- PDF, trial, testing, and integration coordination

Owns PDF export, coordination of trial-expiry enforcement with Member 2,
end-to-end test cases, integration checks, setup documentation, and demo
readiness.

**Ownership is not permission to change another member's module
silently.** Discuss shared-file changes before making them.

## 5. Execution order

### Phase A --- Inspect and agree first

1.  Inspect the repository, `package.json`, entry point, folder layout,
    environment variables, current Git status, and existing
    implementation.
2.  Do not recreate or overwrite working code.
3.  Agree the exact endpoint names, JSON fields, database schema, and
    authentication strategy.
4.  Record the confirmed decisions in `README.md` and/or
    `API_CONTRACT.md`.
5.  Each member uses a separate branch or isolated worktree and owns a
    clearly defined set of files.

### Phase B --- Build the foundation

1.  Member 2 verifies server startup and database connectivity, then
    implements or verifies auth and shared schemas.
2.  Member 1 builds the UI using the agreed page structure and API
    contract.
3.  Member 3 verifies provider access and implements the reusable AI
    service.
4.  Member 4 prepares the PDF/trial test plan and checks the chosen PDF
    approach.

### Phase C --- Connect core functionality

1.  Complete registration and login.
2.  Connect the dashboard and subject/topic form.
3.  Connect notes, assignments, and question generation.
4.  Save generated documents and retrieve history.
5.  Add preview/edit and PDF export.
6.  Enforce trial status on the server.

### Phase D --- Integrate and test

1.  Integrate small changes early; do not wait until the final day.
2.  Review and merge changes from each branch using the team's agreed
    process.
3.  Test the complete journey from login to PDF download.
4.  Fix blocking bugs before adding optional features.
5.  Verify `.env.example`, `.gitignore`, README instructions, and the
    demo.

## 6. Proposed API contract --- confirm against the repository

These are **proposals**, not facts about the existing codebase. Member 2
must inspect current routes and publish the final contract. If
equivalent routes already exist, reuse them rather than creating
duplicates.

  Method   Proposed endpoint            Responsibility
  -------- ---------------------------- ----------------------------------
  POST     `/api/auth/register`         Register teacher
  POST     `/api/auth/login`            Log in teacher
  POST     `/api/auth/logout`           Log out teacher
  GET      `/api/teachers/me`           Current teacher profile
  POST     `/api/ai/notes`              Generate notes
  POST     `/api/ai/assignments`        Generate assignment
  POST     `/api/ai/questions`          Generate questions
  GET      `/api/documents`             List current teacher's documents
  GET      `/api/documents/:id`         Retrieve one owned document
  PATCH    `/api/documents/:id`         Update one owned document
  GET      `/api/documents/:id/pdf`     Export one owned document
  GET      `/api/subscription/status`   Trial/subscription status

### Example question-generation request

``` json
{
  "subject": "Computer Science",
  "topic": "Binary Search Trees",
  "difficulty": "medium",
  "questionCount": 10,
  "questionType": "mixed"
}
```

The exact fields and response schema must be agreed before frontend
integration. The frontend must not guess response keys; the AI service
must not invent a separate format.

## 7. Shared code rules

-   Keep one application entry point, one agreed authentication
    strategy, and one shared set of models/routes.
-   Follow existing file names, import style, and code conventions.
-   Do not duplicate AI services, route handlers, middleware, schemas,
    or server instances.
-   Do not change shared endpoint names or response formats without team
    agreement.
-   Do not edit another member's uncommitted changes.
-   Avoid simultaneous edits to shared files such as the server entry
    point, shared models, route registries, and `package.json`.
-   If a shared change is necessary, explain why, coordinate with the
    owner, and update the contract/documentation.
-   Validate incoming input and return consistent error responses.
-   Keep secrets and provider keys on the backend in environment
    variables.
-   Never commit `.env`, credentials, tokens, or real API keys.
-   Use `.env.example` with placeholder values only.
-   Check authorization and document ownership on the server, not only
    in the UI.
-   Do not claim a feature is complete until it has been run and tested.
-   Do not make unrelated formatting or refactoring changes.

## 8. Git coordination

Suggested branch names (adjust if the team already has a branch
convention):

-   `feature/frontend`
-   `feature/backend-auth`
-   `feature/ai-generation`
-   `feature/pdf-testing`

Before starting, each member should confirm the correct repository and
base branch with the team. Do not assume `main` is the correct base
without checking.

Example workflow:

``` bash
git status
git branch
git checkout <your-branch>
git pull
```

After making changes:

``` bash
git status
git add <your-related-files>
git commit -m "Describe the feature"
git push -u origin <your-branch>
```

Review changes before merging. Resolve conflicts with the relevant file
owner; do not blindly accept one side. After merging, run the
application and relevant tests.

## 9. Environment and security

The actual environment-variable names must match the existing code and
chosen provider. Common placeholders might include:

``` env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
AI_API_KEY=your_ai_provider_api_key
```

These are examples only. Do not commit real values. Ensure `.env` is
ignored by Git. The application should report missing configuration
clearly without printing secret values.

## 10. Definition of done

A task is complete only when:

1.  The implementation is in the agreed location.
2.  It follows the shared contract and project conventions.
3.  It handles invalid inputs and expected errors.
4.  It has been tested, with the actual result recorded.
5.  Only relevant files have been changed.
6.  Changes are committed to the assigned branch.
7.  Required environment variables and setup steps are documented.
8.  The feature has been checked with the other modules it depends on.

## 11. Final MVP test checklist

-   [ ] Registration works.
-   [ ] Login and logout work.
-   [ ] Protected endpoints reject unauthenticated requests.
-   [ ] One teacher cannot access another teacher's documents.
-   [ ] Subject/topic input is validated.
-   [ ] Notes generation works.
-   [ ] Assignment generation works.
-   [ ] Easy, Medium, and Hard question generation works.
-   [ ] Generated content displays correctly.
-   [ ] Documents can be saved and retrieved.
-   [ ] Editing a saved document works.
-   [ ] PDF export produces a readable file.
-   [ ] Trial status is stored and checked server-side.
-   [ ] Expired trial restrictions are enforced on protected
    functionality.
-   [ ] AI/provider errors are handled gracefully.
-   [ ] No secrets are committed.
-   [ ] The project starts from a clean setup using the documented
    steps.
-   [ ] README and demo instructions have been verified.

## 12. Deadline plan

**Wednesday, 14 October 2026:** inspect repository, lock API contracts,
assign branches, establish the foundation.

**Thursday, 15 October 2026:** complete auth/dashboard basics and
connect the first end-to-end AI generation flow.

**Friday, 16 October 2026:** finish PDF and trial checks, integrate
modules, fix critical bugs, test setup and demo.

**Saturday, 17 October 2026:** run final verification, check
documentation and environment configuration, and submit.

## 13. Standard instruction for every Antigravity task

Before editing, inspect the repository and this file. Confirm the
assigned member role. State the files you plan to change. Implement only
the assigned module and preserve working code. Do not change shared
APIs, models, or response formats without team agreement. Run relevant
tests and report:

-   Files created or modified.
-   APIs or schemas changed.
-   Dependencies or environment variables needed.
-   Commands/tests executed and their actual results.
-   Any unresolved issue or incomplete work.

**Priority: keep one shared understanding, one agreed contract, small
reviewed changes, and a working integrated MVP.**
