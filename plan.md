# Smart Bharat – AI-Powered Civic Companion (Plan)

## 1) Objectives
- Prove Gemini (text + vision) works reliably with the provided `GEMINI_API_KEY` before building the app.
- Deliver a responsive V1 web app with: Civic AI chat (English/Hindi), Service Simplifier (AI summaries + caching), Issue Reporting (multi-step + real vision categorization), and Issue Tracking (Tracking ID timeline).
- Persist chat sessions, cached service summaries, and issues in MongoDB; no user auth.

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation: Gemini + Vision + JSON)
**Goal:** Validate the most failure-prone core: Gemini API key + structured outputs + vision.

**User stories (POC):**
1. As a developer, I want a minimal script that confirms the Gemini key is valid so I don’t build on a broken integration.
2. As a developer, I want Gemini to answer a civic question in English so chat works.
3. As a developer, I want Gemini to answer the same question in Hindi so the language toggle is feasible.
4. As a developer, I want Gemini vision to categorize a pothole/waste image so issue reporting can auto-tag.
5. As a developer, I want Gemini to return strict JSON for categorization so the UI can render consistently.

**Steps:**
1. Websearch: confirm current best practice for Gemini API (model names, vision request format, structured JSON output patterns).
2. Add backend env wiring: `GEMINI_API_KEY` in `/app/backend/.env` (do not commit).
3. Create standalone Python POC scripts (run locally in backend context):
   - `poc_gemini_text.py`: prompt for civic Q&A in English and Hindi.
   - `poc_gemini_vision.py`: send an image, request strict JSON: `{category, severity, short_description, confidence}`.
4. Validate:
   - Key works (if 401/403 or invalid format, stop and request a new key).
   - Latency acceptable and responses parse as JSON.
5. Freeze prompts + response schema for production endpoints.

**Exit criteria:**
- Text: consistent answers in EN/HI.
- Vision: returns valid JSON + correct category on sample images.

---

### Phase 2 — V1 App Development (Frontend + Backend, Core-first)
**User stories (V1):**
1. As a citizen, I can open the floating chat from any page and ask how to apply for a service.
2. As a citizen, I can toggle English/Hindi and get responses in the chosen language.
3. As a citizen, I can open a service card and see eligibility/documents/time-cost in plain language with an official “Apply Now” link.
4. As a citizen, I can report an issue with a photo and see the auto-detected category + severity before submitting.
5. As a citizen, I can submit an issue and receive a Tracking ID and later view its timeline by entering that ID.

**Backend (FastAPI + MongoDB):**
1. Data models/collections:
   - `chat_sessions` (session_id, messages[], language, timestamps)
   - `service_summaries` (service_key, language, summary_sections, updated_at)
   - `issues` (tracking_id, category, severity, description, location_text, image_url/meta, status_timeline, timestamps)
2. Gemini client module:
   - shared helper for text generation + vision analysis
   - strict JSON parsing + fallback/repair prompt if invalid JSON
3. API endpoints (MVP):
   - `POST /api/chat/send` (session_id, message, language) -> assistant message; persist to Mongo
   - `GET /api/chat/session/{session_id}` -> load history
   - `POST /api/services/simplify` (service_key, language) -> cached summary or generate+store
   - `POST /api/issues/analyze-image` (multipart image) -> JSON categorization via Gemini vision
   - `POST /api/issues/create` (form: category/severity/desc/location + optional image ref) -> tracking id
   - `GET /api/issues/{tracking_id}` -> issue + timeline
4. File handling:
   - store uploads on backend (local `/uploads`) with safe filenames; return URL for display.
5. Tracking ID generator:
   - format `SB-XXXXXX` (collision-checked).

**Frontend (React + Tailwind + Framer Motion + shadcn/ui):**
1. App shell:
   - Navbar + Hero + routes: Home, Services, Report Issue, Track Issue.
2. Civic AI Companion:
   - floating button bottom-right → side panel
   - staggered message bubbles, typing indicator (triple-dot), “thinking” animated gradient border
   - language toggle (EN/HI) affecting UI state + backend payload
3. Services dashboard:
   - grid of service cards w/ hover lift + spring
   - modal with 3 sections + official link
4. Issue reporting:
   - multi-step form w/ progress bar
   - image upload → call analyze endpoint → show category/severity + editable fields
   - submit → animated SVG checkmark + Tracking ID
5. Track issue:
   - input Tracking ID → timeline (Submitted → In Review → Resolved)

**Design + motion (apply throughout):**
- Colors: indigo primary, saffron secondary, slate-50 background, white cards.
- Framer Motion: page fade/slide-up, button whileTap 0.95, list staggerChildren 0.1, service card whileHover y:-5.

**Phase 2 close-out:**
- Run one end-to-end testing pass (agent) across: chat EN/HI, service modal caching, image analysis, issue create + track.

---

### Phase 3 — Stabilization + UX Polish (Post-V1)
**User stories (Polish):**
1. As a user, I see clear error messages if Gemini fails and can retry without losing my input.
2. As a user, I can continue a previous chat session within the same browser session.
3. As a user, I see loading skeletons and consistent animations so the app feels responsive.
4. As a user, I can edit the auto-detected category/severity if the model is wrong.
5. As a user, I can share my Tracking ID result page via URL.

**Steps:**
1. Improve reliability:
   - timeouts, retries (bounded), circuit-breaker style UI messaging
   - validate/normalize Gemini outputs; log parsing failures
2. Caching + cost control:
   - TTL/updated_at for service summaries; dedupe in-flight requests
3. UX/accessibility:
   - keyboard focus, aria labels for chat and modals, contrast checks
4. Testing:
   - second end-to-end pass (agent) + regression checklist.

---

## 3) Next Actions
1. Execute Phase 1 websearch + write/run POC scripts against the provided Gemini key.
2. If key fails (auth/model access), request a replacement key and re-run POC until green.
3. Once POC passes, implement Phase 2 backend endpoints + Mongo models.
4. Build Phase 2 frontend screens + chat widget + animations.
5. Run V1 end-to-end testing; fix blockers before starting Phase 3.

---

## 4) Success Criteria
- POC: Gemini text (EN/HI) + vision categorization returns parseable JSON reliably.
- Chat: floating widget works on all pages; session history stored/retrieved from MongoDB.
- Services: AI modal shows 3 required sections; caching prevents repeated calls for same service+language.
- Issue reporting: image upload triggers real vision analysis; submit returns Tracking ID; success animation plays.
- Tracking: entering Tracking ID shows correct timeline and issue details; graceful errors for invalid IDs.
