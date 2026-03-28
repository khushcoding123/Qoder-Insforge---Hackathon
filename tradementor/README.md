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

**2. Set your API key**
```bash
cp .env.local.example .env.local
# Add your Anthropic API key to .env.local
```

```env
ANTHROPIC_API_KEY=your_api_key_here
```

**3. Run the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
