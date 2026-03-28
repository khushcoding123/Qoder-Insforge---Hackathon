# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TradeMentor AI** — an educational trading platform (Next.js + Claude API). The AI acts as a Socratic coach, never a signal provider. All work lives in `tradementor/`.

## Commands

All commands must be run from `tradementor/`:

```bash
cd tradementor

npm install          # Install dependencies
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

No test runner is configured.

## Next.js Version Warning

**Read `tradementor/AGENTS.md` before writing any Next.js code.** This project uses Next.js 16 (with React 19), which has breaking changes from older versions. APIs, conventions, and file structure differ from common training data. Check `node_modules/next/dist/docs/` for the authoritative reference.

## Architecture

### App Router structure (`src/app/`)

- `page.tsx` — landing page
- `dashboard/` — protected user hub
- `learn/` — lesson catalog + `[id]/` dynamic lesson pages
- `strategy/` — 5-step strategy builder wizard
- `practice/` — chart practice with Socratic/Guided AI coaching
- `journal/` — trade journaling + AI analysis
- `api/ai/{lesson,strategy,practice,journal}/route.ts` — Claude streaming endpoints

All API routes set `export const runtime = "nodejs"` and stream responses via `@anthropic-ai/sdk`.

### AI handlers (`src/lib/ai/`)

Four modular handlers, each with its own system prompt. Each has a paired API route:

| Handler | Route | Behavior |
|---|---|---|
| `lesson-handler.ts` | `POST /api/ai/lesson` | Socratic Q&A, max 1024 tokens |
| `strategy-handler.ts` | `POST /api/ai/strategy` | 5-step coaching, tracks asset class / experience / risk |
| `practice-handler.ts` | `POST /api/ai/practice` | Socratic mode (questions only) or Guided mode (explanation), max 512 tokens |
| `journal-handler.ts` | `POST /api/ai/journal` | Pattern + psychology analysis, streaming |

All handlers accept `conversationHistory` for multi-turn context. Model: `claude-opus-4-6`.

### Authentication (`src/lib/actions/auth.ts`, `src/lib/insforge*.ts`)

- Auth via **InsForge SDK** (server: `insforge-server.ts`, client: `insforge.ts`)
- Server actions: `signUp`, `signIn`, `signOut`, `verifyEmail`
- `ProtectedRoute` component checks auth + `onboarding_completed` flag; redirects accordingly
- Database table: `user_profiles`

### Data (`src/lib/data/`)

Mock data used in development: `lessons.ts` (18+ lessons), `strategies.ts`, `journal.ts`, `progress.ts`. These are static imports — no real DB reads on the frontend yet.

### UI components (`src/components/`)

- `ui/GlowCard.tsx` — primary card wrapper; accepts `glow` prop (`cyan` | `purple` | `blue` | `green` | `none`)
- `ui/StreamingText.tsx` — renders live Claude streaming output
- `layout/Navbar.tsx` — responsive nav with auth state

### Design tokens (defined in `globals.css`)

| Token | Value |
|---|---|
| Background | `#0A0A0F` |
| Card BG | `#0F0F1A` |
| Glassmorphism | `bg-white/5 backdrop-blur-xl` |
| Primary accent | `#00E5FF` (cyan) |
| Secondary accent | `#7C3AED` (purple) |
| Border | `border-white/10` |
| Glow shadow | `shadow-[0_0_30px_rgba(0,229,255,0.15)]` |

## Environment

Copy `.env.local.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_INSFORGE_URL=
NEXT_PUBLIC_INSFORGE_ANON_KEY=
```
