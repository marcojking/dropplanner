# ENG310 Web App Project — Design Spec
**Date:** 2026-03-17
**Course:** ENG310 — 4-Week Service Business Project

---

## 1. Business Concept

**Product name (working):** DropPlanner

**One-line description:** An AI-powered release planner for indie musicians — enter your goal, get a personalized date-anchored timeline, and share it with a link.

**Target customer:** Indie musicians planning a single, EP, or album release who have no manager, no label, and no structured plan for how to execute the release.

**Pain point:** Indie artists know they should be posting on social media and hitting certain production milestones before their release, but they don't know what to do, in what order, or how far in advance. Generic blog posts exist but aren't personalized or actionable.

**Why it's better:** The tool takes your specific release date, genre, and posting frequency and generates a fully date-anchored, personalized timeline — not a generic checklist. It's shareable via link so the artist can reference it anytime.

---

## 2. AI Feature

**Input form fields:**
- Song count (dropdown 1–10+, with greyed labels: 1–2 = "Single", 3–6 = "EP", 7+ = "Album")
- Genre (Folk, Pop, Country)
- Release date (date picker)
- Posts per week (1, 2, 3, 4, or 5)

**How the AI works:**
A large system prompt containing pre-written best practices for indie music releases (general + genre-specific for Folk, Pop, Country) is combined with the user's inputs and sent to the model. The AI returns a structured JSON array of milestones via streaming.

**AI model:** `claude-haiku-4-5` via Vercel AI Gateway (`anthropic/claude-haiku-4-5`)

**Structured output schema (Zod):**
```ts
z.object({
  milestones: z.array(z.object({
    date: z.string(),       // ISO date string e.g. "2025-03-01"
    week: z.number(),       // weeks before release (negative = before, 0 = release week)
    label: z.string(),      // short milestone title e.g. "Post acoustic teaser"
    detail: z.string(),     // tooltip/hover content with explanation
    category: z.enum(['social', 'production', 'distribution', 'press'])
  }))
})
```

**Streaming:** Uses AI SDK v6 `streamText` + `Output.object()`. Milestones stream in and appear on screen as they build. Once complete, full JSON is saved to Supabase.

---

## 3. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| AI | Claude Haiku 4.5 via Vercel AI Gateway |
| AI SDK | Vercel AI SDK v6 (`streamText` + `Output.object()`) |
| Database | Supabase (stores generated plans as JSON with UUID) |
| Hosting | Vercel |
| Styling | Tailwind CSS + shadcn/ui |

---

## 4. Website Structure

### Page 1: `/` — Landing Page
- Hero section: headline, subheadline, CTA ("Plan My Release")
- 3-bullet explainer of what the tool does
- Static mockup showing an example finished timeline

### Page 2: `/generate` — Form Page
- Song count dropdown (1–10+ with Single/EP/Album greyed labels)
- Genre selector (Folk, Pop, Country)
- Release date picker
- Posts per week selector (1–5)
- "Generate My Plan" button
- Streaming loading state: milestones appear as they stream in

### Page 3: `/plan/[uuid]` — Shareable Timeline
- Vertical timeline, date-anchored milestones
- Hover tooltip on each milestone showing `detail` field
- Color-coded by category (social, production, distribution, press)
- "Copy Link" button
- "Make My Own" CTA → links back to `/generate`

---

## 5. Data Model (Supabase)

**Table: `plans`**
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, auto-generated |
| `created_at` | `timestamp` | Auto-set |
| `genre` | `text` | Folk / Pop / Country |
| `song_count` | `integer` | 1–10+ |
| `release_date` | `date` | User's target release date |
| `posts_per_week` | `integer` | 1–5 |
| `milestones` | `jsonb` | Full milestone array from AI |

No auth required. Plans are publicly readable by UUID.

---

## 6. Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Generate 1 plan, shareable link |
| Pro | $9/month | Unlimited generations, regenerate/update existing plan, PDF export |

**Path to $3,000/month profit:**
- ~350 Pro subscribers × $9 = $3,150/month revenue
- Infrastructure costs: Vercel (~$20) + Supabase (~$25) + AI API (~$30) = ~$75/month
- **Monthly profit: ~$3,075**

350 subscribers is achievable in the indie music creator niche (millions of active indie artists globally).

---

## 7. Project Timeline (ENG310 Deadlines)

| Deadline | Deliverable |
|----------|-------------|
| Sun Mar 22 | Coding environment set up + idea submitted to Canvas |
| Wed Mar 25 | Pitch video + income statement (spreadsheet) submitted |
| Wed Apr 1 | Deployed website live URL submitted |
| Sun Apr 5 | Written response to peer feedback |
| Wed Apr 8 | Final website URL + AI feature test instructions |
| Wed Apr 18 | External feedback evidence + 3–4 min video reflection |

---

## 8. Build Phases

**Phase 1 (Now → Mar 22):** Finalize idea, submit to Canvas, set up repo + Vercel + Supabase

**Phase 2 (Mar 22 → Apr 1):** Build all 3 pages, wire up AI endpoint, deploy to Vercel

**Phase 3 (Apr 1 → Apr 8):** Incorporate peer feedback, polish AI feature, write test instructions

**Phase 4 (Apr 8 → Apr 18):** Real-world outreach, collect feedback evidence, record reflection video

---

## 9. Idea Submission (Canvas — due Mar 22)

> DropPlanner is an AI-powered release planning tool for indie musicians. The target customer is an indie artist who has a single, EP, or album coming up but no manager or label to guide the rollout. The user enters their release date, genre, and how often they want to post on social media. The AI — drawing from a pre-built knowledge base of indie music release best practices — generates a fully personalized, date-anchored milestone timeline showing exactly what to do and when: from locking the final mix and uploading to distributors, to what type of social content to post each week. This is better than existing alternatives (blog posts, generic checklists) because it is specific to the user's actual release date and posting frequency, delivered instantly, and shareable via a permanent link.
