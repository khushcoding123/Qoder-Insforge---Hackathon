# TradeMentor AI

An AI-powered trading education platform that helps beginners and intermediate traders learn through structured practice, reflection, and guided reasoning.

---

## What This Is

TradeMentor AI is an **educational platform** — not a signal service, not a get-rich-quick tool. It is a structured learning system built around a repeatable practice loop:

**Learn → Build → Practice → Reflect → Refine → Repeat**

The AI (powered by Claude) acts as a coach and reasoning partner. It guides thinking, asks high-quality questions, explains concepts, and adapts to your level. It never provides financial advice or guaranteed outcomes.

---

## Core Features

| Feature | Description |
|---|---|
| Learn Center | Structured lessons across 18+ topics — market structure, risk management, psychology, and more |
| Strategy Builder | Guided, multi-step flow to build a personalized trading strategy with AI coaching |
| Practice Page | Real-time AI coach (Socratic and Guided modes) with checklist and confluence tracker |
| Chrome Extension UI | Concept UI showing how the extension would overlay a paper trading platform |
| Journal & Review | Trade journaling with AI-powered pattern analysis and psychology insights |
| Dashboard | Central hub showing progress, streaks, strategy, and the learning loop |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion
- **AI**: Claude API via `@anthropic-ai/sdk` (model: `claude-opus-4-6`)
- **State**: Zustand
- **Icons**: Lucide React

---

## AI Architecture

Claude API powers four modular handlers, each with a dedicated system prompt and API route:

| Handler | Route | Purpose |
|---|---|---|
| Lesson Assistant | `POST /api/ai/lesson` | Answers questions, simplifies concepts, recommends next steps |
| Strategy Builder | `POST /api/ai/strategy` | Guides strategy creation with coaching questions |
| Practice Coach | `POST /api/ai/practice` | Socratic or Guided mode coaching during chart review |
| Journal Analyzer | `POST /api/ai/journal` | Identifies patterns, psychology insights, recurring mistakes |

All routes use streaming (`claude-opus-4-6`) for real-time response display.

---

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in all three values:

```env
# From https://console.anthropic.com/account/keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# From your InsForge project dashboard → Settings → API Keys
NEXT_PUBLIC_INSFORGE_URL=https://your-app-key.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_anon_key_here
```

**3. (Optional) Enable Google OAuth**

Google sign-in is configured in InsForge, not in this repo's `.env`:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application)
2. Add this **Authorized redirect URI**: `<NEXT_PUBLIC_INSFORGE_URL>/auth/v1/callback`
   - Example: `https://myapp.us-east-1.insforge.app/auth/v1/callback`
   - For local dev add: `http://localhost:7130/auth/v1/callback` (if running InsForge locally)
3. Copy the **Client ID** and **Client Secret** into your InsForge dashboard:
   - InsForge Dashboard → Auth → OAuth Providers → Google → Enable → paste credentials

**4. Run the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Troubleshooting for team members**: If the app shows a blank screen or auth fails immediately, the most common cause is missing `NEXT_PUBLIC_INSFORGE_URL` / `NEXT_PUBLIC_INSFORGE_ANON_KEY` in your `.env.local`.

---

## Project Structure

```
src/
  app/
    page.tsx              # Landing page
    dashboard/page.tsx    # User dashboard
    learn/page.tsx        # Lesson catalog
    learn/[id]/page.tsx   # Individual lesson + AI assistant
    strategy/page.tsx     # Strategy Builder
    practice/page.tsx     # Practice + AI coach
    extension/page.tsx    # Chrome Extension concept UI
    journal/page.tsx      # Journal & Review
    api/ai/
      lesson/route.ts     # Claude lesson handler
      strategy/route.ts   # Claude strategy handler
      practice/route.ts   # Claude practice handler
      journal/route.ts    # Claude journal handler
  components/
    layout/               # Navbar, Footer
    ui/                   # GlowCard, Badge, ProgressRing, StreamingText, etc.
  lib/
    ai/                   # Claude API handler modules
    data/                 # Mock data (lessons, strategies, journal, progress)
    cn.ts                 # Tailwind class utility
```

---

## Design System

| Token | Value | Use |
|---|---|---|
| Base background | `#0A0A0F` | Page background |
| Card background | `#0F0F1A` | Cards and panels |
| Glassmorphism | `bg-white/5 backdrop-blur-xl` | Overlay cards |
| Accent cyan | `#00E5FF` | Primary interactive elements |
| Accent purple | `#7C3AED` | Secondary highlights |
| Border | `border-white/10` | All card borders |
| Glow | `shadow-[0_0_30px_rgba(0,229,255,0.15)]` | Hover/active glow |

---

## Disclaimer

TradeMentor AI is an **educational tool only**. Nothing on this platform constitutes financial advice. Trading financial instruments involves significant risk of loss. Past performance is not indicative of future results. Always consult a qualified financial professional before making investment decisions.

---

## Future Roadmap

- User authentication and profiles (InsForge integration)
- Strategy and journal cloud storage
- Chrome extension (reads chart context, overlays coaching prompts)
- Progress analytics and performance tracking
- Community strategy sharing
