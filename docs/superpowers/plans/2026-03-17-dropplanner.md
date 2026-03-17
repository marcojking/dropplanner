# DropPlanner Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy DropPlanner — a 3-page Next.js app where indie musicians enter their release details and get a shareable, AI-generated milestone timeline.

**Architecture:** A Next.js 16 App Router app. The `/generate` page POSTs to `/api/generate`, which calls Claude Haiku 4.5 via Vercel AI Gateway using `streamText` + `Output.object()` to stream a structured milestone array. Once streaming completes, the full plan is saved to Supabase with a UUID and the user is redirected to `/plan/[uuid]` — a permanently shareable page.

**Tech Stack:** Next.js 16, Tailwind CSS, shadcn/ui, Vercel AI SDK v6 (`ai` + `@ai-sdk/react`), Zod, Supabase JS client (`@supabase/supabase-js`), Vercel AI Gateway (`anthropic/claude-haiku-4-5-20251001`)

---

## File Map

```
ENG310/
├── app/
│   ├── layout.tsx                    # Root layout, Geist font, dark theme
│   ├── page.tsx                      # Landing page (/)
│   ├── generate/
│   │   └── page.tsx                  # Form page (/generate)
│   ├── plan/
│   │   └── [uuid]/
│   │       └── page.tsx              # Shareable timeline (/plan/[uuid])
│   └── api/
│       └── generate/
│           └── route.ts              # POST: call AI, save to Supabase, return UUID + stream
├── components/
│   ├── release-form.tsx              # Form with all inputs + streaming milestone display
│   └── timeline.tsx                  # Vertical timeline with hover tooltips
├── lib/
│   ├── supabase.ts                   # Supabase client (server-side, anon key)
│   ├── schema.ts                     # Zod milestone schema (shared client + server)
│   └── system-prompt.ts             # Builds AI system prompt from user inputs + knowledge base
└── .env.local                        # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, VERCEL_OIDC_TOKEN (via vercel env pull)
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `ENG310/` (Next.js project root)
- Create: `.env.local`
- Create: `app/layout.tsx`

- [ ] **Step 1: Scaffold Next.js app with Tailwind**

Run inside `C:\Users\marco\Desktop\ProjectOS\`:
```bash
npx create-next-app@latest ENG310 --typescript --tailwind --app --no-src-dir --no-import-alias
```
When prompted: TypeScript=Yes, ESLint=Yes, Tailwind=Yes, App Router=Yes, src/=No, import alias=No.

- [ ] **Step 2: Install dependencies**

```bash
cd ENG310
npm install ai @ai-sdk/react zod @supabase/supabase-js
npm install geist
npx shadcn@latest init
```
For shadcn init: style=Default, base color=Zinc, CSS variables=Yes.

- [ ] **Step 3: Install shadcn components we'll use**

```bash
npx shadcn@latest add button card select label tooltip badge
```

- [ ] **Step 4: Set up .env.local**

Create `ENG310/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
NOTE: AI Gateway uses OIDC auth. Complete Task 8 (vercel link → enable AI Gateway → vercel env pull) before testing the AI route locally — this provisions the required credentials automatically. No provider-specific keys needed.

- [ ] **Step 5: Update root layout with Geist font and dark theme**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'DropPlanner — Indie Music Release Planner',
  description: 'AI-powered release timeline for indie musicians',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js app with Tailwind, shadcn, and dependencies"
```

---

## Task 2: Supabase Table + Client

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Copy the Project URL and anon key into `.env.local`.

- [ ] **Step 2: Create the plans table**

In the Supabase SQL editor, run:
```sql
create table plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  genre text not null,
  song_count integer not null,
  release_date date not null,
  posts_per_week integer not null,
  milestones jsonb not null
);
```

- [ ] **Step 3: Disable RLS for now (student project, public plans)**

```sql
alter table plans disable row level security;
```

- [ ] **Step 4: Create Supabase client**

Create `lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

- [ ] **Step 5: Smoke test — verify connection**

Add a temporary test in the browser console or a quick script:
```ts
// In any server component or route, temporarily add:
const { data, error } = await supabase.from('plans').select('id').limit(1)
console.log('Supabase connected:', !error)
```

- [ ] **Step 6: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add Supabase client and plans table"
```

---

## Task 3: Zod Schema + System Prompt

**Files:**
- Create: `lib/schema.ts`
- Create: `lib/system-prompt.ts`

- [ ] **Step 1: Write the Zod milestone schema**

Create `lib/schema.ts`:
```ts
import { z } from 'zod'

export const milestoneSchema = z.object({
  date: z.string(),        // ISO date string (YYYY-MM-DD)
  week: z.number(),        // weeks relative to release (negative = before, 0 = release week, positive = after)
  label: z.string(),       // short title e.g. "Upload to DistroKid"
  detail: z.string(),      // 2-3 sentence tooltip explanation
  category: z.enum(['social', 'production', 'distribution', 'press'])
})

export const planSchema = z.object({
  milestones: z.array(milestoneSchema)
})

export type Milestone = z.infer<typeof milestoneSchema>
export type Plan = z.infer<typeof planSchema>
```

- [ ] **Step 2a: Confirm the knowledge base file exists**

The file `lib/release-knowledge-base.md` was created during project setup at `C:\Users\marco\Desktop\ProjectOS\ENG310\lib\release-knowledge-base.md`. Verify it exists:
```bash
ls lib/release-knowledge-base.md
```
Expected: file is present. If missing, retrieve it from the project root above the Next.js project. Open it — you will paste its full contents into Step 2b.

- [ ] **Step 2b: Write the system prompt builder**

Create `lib/system-prompt.ts`.

This file contains the full knowledge base inline as a template string, plus a function that combines it with user inputs. Open `lib/release-knowledge-base.md`, copy its entire contents, and paste it as the value of `KNOWLEDGE_BASE`:

```ts
const KNOWLEDGE_BASE = `
[FULL CONTENTS OF lib/release-knowledge-base.md — copy and paste here at implementation time]
`

interface PromptInputs {
  genre: string
  songCount: number
  releaseDate: string   // ISO date string
  postsPerWeek: number
}

export function buildSystemPrompt(inputs: PromptInputs): string {
  const releaseType =
    inputs.songCount <= 2 ? 'Single' :
    inputs.songCount <= 6 ? 'EP' : 'Album'

  return `You are an expert indie music release strategist. Your job is to generate a personalized, date-anchored release timeline for an indie musician.

USER'S RELEASE DETAILS:
- Genre: ${inputs.genre}
- Release type: ${releaseType} (${inputs.songCount} song${inputs.songCount === 1 ? '' : 's'})
- Target release date: ${inputs.releaseDate}
- Posts per week: ${inputs.postsPerWeek}

KNOWLEDGE BASE (use this as your source of truth):
${KNOWLEDGE_BASE}

INSTRUCTIONS:
Generate a milestone timeline for this artist. Each milestone must:
1. Have an exact date (ISO format, counting backward from the release date and forward into post-release)
2. Have a week number (negative = weeks before release, 0 = release week, 1+ = post-release weeks)
3. Have a short label (5-8 words max)
4. Have a detail explanation (2-3 sentences explaining WHY this milestone matters and HOW to execute it)
5. Have a category: social, production, distribution, or press

RULES:
- Generate between 20 and 35 milestones total
- Space milestones appropriately — do not pile everything on release day
- For social milestones: respect the posts_per_week limit. Do not schedule more social posts per week than the user requested.
- Include genre-specific advice from the knowledge base for ${inputs.genre} genre
- Apply the correct runway for a ${releaseType}: ${releaseType === 'Single' ? '8 weeks' : releaseType === 'EP' ? '10-12 weeks' : '12+ weeks'}
- Always include: distributor upload, Spotify editorial pitch, pre-save setup, release day, and 2-4 weeks of post-release milestones
- Flag any distributor or pitch deadlines that are dangerously close to the release date in the detail field

Return ONLY a valid JSON object matching the schema. No extra text.`
}
```

- [ ] **Step 3: Verify schema imports correctly**

Quick check — ensure TypeScript compiles without errors:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/schema.ts lib/system-prompt.ts
git commit -m "feat: add Zod schema and AI system prompt builder"
```

---

## Task 4: API Generate Route

**Files:**
- Create: `app/api/generate/route.ts`

- [ ] **Step 1: Write the route**

Create `app/api/generate/route.ts`:
```ts
import { streamText, Output } from 'ai'
import { after } from 'next/server'
import { supabase } from '@/lib/supabase'
import { planSchema } from '@/lib/schema'
import { buildSystemPrompt } from '@/lib/system-prompt'

export const maxDuration = 60

export async function POST(req: Request) {
  const { genre, songCount, releaseDate, postsPerWeek } = await req.json()

  // Generate a UUID for this plan upfront
  const planId = crypto.randomUUID()

  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    output: Output.object({ schema: planSchema }),
    system: buildSystemPrompt({ genre, songCount, releaseDate, postsPerWeek }),
    prompt: `Generate the release timeline now.`,
    onFinish: async ({ output }) => {
      // Use after() so the Supabase write survives after the response is sent
      // (prevents serverless function from terminating before the insert completes)
      after(async () => {
        if (output) {
          await supabase.from('plans').insert({
            id: planId,
            genre,
            song_count: songCount,
            release_date: releaseDate,
            posts_per_week: postsPerWeek,
            milestones: output.milestones,
          })
        }
      })
    },
  })

  // Return the plan ID in headers so the client knows where to redirect
  const response = result.toTextStreamResponse()
  const headers = new Headers(response.headers)
  headers.set('X-Plan-Id', planId)

  return new Response(response.body, { headers })
}
```

- [ ] **Step 2: Test the route manually with curl**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"genre":"Folk","songCount":1,"releaseDate":"YOUR_RELEASE_DATE","postsPerWeek":3}' \
  -i
```
Expected: streaming JSON chunks in response body, `X-Plan-Id` header present.

NOTE: AI Gateway requires OIDC credentials to be present. Complete Task 8 Steps 1-3 (`vercel link` → enable AI Gateway in dashboard → `vercel env pull`) before testing this route locally. The gateway model string `'anthropic/claude-haiku-4.5'` routes automatically once credentials are in `.env.local`.

- [ ] **Step 3: Verify the plan was saved in Supabase**

In Supabase dashboard → Table Editor → plans. Confirm a row was inserted with milestones JSON.

- [ ] **Step 4: Commit**

```bash
git add app/api/generate/route.ts
git commit -m "feat: add AI generate route with streaming and Supabase save"
```

---

## Task 5: Release Form + /generate Page

**Files:**
- Create: `components/release-form.tsx`
- Create: `app/generate/page.tsx`

- [ ] **Step 1: Write the ReleaseForm component**

Create `components/release-form.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Milestone } from '@/lib/schema'

// Song count options with release type labels
const SONG_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1).concat([11]) // 11 = "10+"
const GENRE_OPTIONS = ['Folk', 'Pop', 'Country']
const POSTS_OPTIONS = [1, 2, 3, 4, 5]

function getReleaseTypeLabel(count: number): string {
  if (count <= 2) return 'Single'
  if (count <= 6) return 'EP'
  return 'Album'
}

export function ReleaseForm() {
  const router = useRouter()
  const [songCount, setSongCount] = useState<number>(1)
  const [genre, setGenre] = useState<string>('')
  const [releaseDate, setReleaseDate] = useState<string>('')
  const [postsPerWeek, setPostsPerWeek] = useState<number>(3)
  const [loading, setLoading] = useState(false)
  const [streamedMilestones, setStreamedMilestones] = useState<Milestone[]>([])
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genre || !releaseDate) return

    setLoading(true)
    setStreamedMilestones([])
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, songCount, releaseDate, postsPerWeek }),
      })

      const planId = response.headers.get('X-Plan-Id')

      // Read the streaming text and parse partial JSON
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })

        // Try to parse milestones from partial JSON as they stream in
        try {
          const match = accumulated.match(/"milestones"\s*:\s*(\[[\s\S]*?\])/)
          if (match) {
            // Parse what we have so far
            const partial = JSON.parse(match[1] + (match[1].endsWith(']') ? '' : ']').replace(/,\s*$/, ']'))
            if (Array.isArray(partial)) {
              setStreamedMilestones(partial.filter((m: any) => m.label && m.date))
            }
          }
        } catch {
          // Partial JSON not parseable yet — keep accumulating
        }
      }

      if (planId) {
        router.push(`/plan/${planId}`)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      {/* Song Count */}
      <div className="space-y-2">
        <Label>How many songs?</Label>
        <Select onValueChange={(v) => setSongCount(Number(v))} defaultValue="1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SONG_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                <span>{n === 11 ? '10+' : n}</span>
                <span className="ml-2 text-muted-foreground text-xs">
                  {getReleaseTypeLabel(n)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label>Genre</Label>
        <Select onValueChange={setGenre}>
          <SelectTrigger>
            <SelectValue placeholder="Select genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRE_OPTIONS.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Release Date */}
      <div className="space-y-2">
        <Label>Target release date</Label>
        <input
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          style={{ colorScheme: 'dark' }}
          required
        />
      </div>

      {/* Posts Per Week */}
      <div className="space-y-2">
        <Label>Posts per week</Label>
        <Select onValueChange={(v) => setPostsPerWeek(Number(v))} defaultValue="3">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSTS_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>{n}x / week</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={loading || !genre || !releaseDate} className="w-full">
        {loading ? 'Generating your plan…' : 'Generate My Plan'}
      </Button>

      {/* Streaming preview — milestones appear as they generate */}
      {loading && streamedMilestones.length > 0 && (
        <div className="space-y-2 pt-4">
          <p className="text-xs text-muted-foreground">Building your timeline…</p>
          {streamedMilestones.map((m, i) => (
            <div key={i} className="flex items-center gap-3 text-sm animate-in fade-in">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                m.category === 'social' ? 'bg-blue-400' :
                m.category === 'production' ? 'bg-yellow-400' :
                m.category === 'distribution' ? 'bg-green-400' : 'bg-purple-400'
              }`} />
              <span className="text-muted-foreground">{m.date}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Create the generate page**

Create `app/generate/page.tsx`:
```tsx
import { ReleaseForm } from '@/components/release-form'

export default function GeneratePage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Plan your release</h1>
        <p className="text-muted-foreground mb-8">
          Enter your details and get a personalized, date-anchored release timeline in seconds.
        </p>
        <ReleaseForm />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Test the form end-to-end**

Run `npm run dev`, go to http://localhost:3000/generate, fill the form, hit submit, verify:
- Loading state appears
- Milestones stream in progressively
- After completion, browser redirects to `/plan/[uuid]` (404 for now — that's fine)

- [ ] **Step 4: Commit**

```bash
git add components/release-form.tsx app/generate/page.tsx
git commit -m "feat: add release form with streaming milestone preview"
```

---

## Task 6: Timeline Page (/plan/[uuid])

**Files:**
- Create: `components/timeline.tsx`
- Create: `app/plan/[uuid]/page.tsx`

- [ ] **Step 1: Write the Timeline component**

Create `components/timeline.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { Milestone } from '@/lib/schema'

const CATEGORY_COLORS: Record<string, string> = {
  social:       'bg-blue-500/20 text-blue-300 border-blue-500/30',
  production:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  distribution: 'bg-green-500/20 text-green-300 border-green-500/30',
  press:        'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const DOT_COLORS: Record<string, string> = {
  social:       'bg-blue-400',
  production:   'bg-yellow-400',
  distribution: 'bg-green-400',
  press:        'bg-purple-400',
}

interface TimelineProps {
  milestones: Milestone[]
}

export function Timeline({ milestones }: TimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const sorted = [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-6 pl-12">
        {sorted.map((milestone, i) => (
          <div
            key={i}
            className="relative"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Dot */}
            <div className={`absolute -left-8 w-3 h-3 rounded-full border-2 border-background ${DOT_COLORS[milestone.category]}`} />

            {/* Content */}
            <div className="cursor-default">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(milestone.date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
                <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[milestone.category]}`}>
                  {milestone.category}
                </Badge>
                {milestone.week === 0 && (
                  <Badge className="text-xs bg-accent text-accent-foreground">Release Day</Badge>
                )}
              </div>
              <p className="font-medium mt-0.5">{milestone.label}</p>

              {/* Tooltip / expanded detail */}
              {hoveredIndex === i && (
                <p className="mt-1 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 max-w-prose">
                  {milestone.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create the plan page**

Create `app/plan/[uuid]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Timeline } from '@/components/timeline'
import { Button } from '@/components/ui/button'
import { CopyLinkButton } from '@/components/copy-link-button'

interface Props {
  params: Promise<{ uuid: string }>
}

export default async function PlanPage({ params }: Props) {
  const { uuid } = await params

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', uuid)
    .single()

  if (error || !data) notFound()

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold">Your Release Plan</h1>
            <p className="text-muted-foreground mt-1">
              {data.genre} · {data.song_count} song{data.song_count === 1 ? '' : 's'} ·{' '}
              {new Date(data.release_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })} release
            </p>
          </div>
          <CopyLinkButton />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Social</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Production</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /> Distribution</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> Press</span>
          <span className="text-muted-foreground/60">Hover a milestone for details</span>
        </div>

        <Timeline milestones={data.milestones} />

        {/* Footer CTA */}
        <div className="mt-12 pt-8 border-t border-border">
          <Button asChild variant="outline">
            <Link href="/generate">Make My Own Plan</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create CopyLinkButton component**

Create `components/copy-link-button.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" onClick={handleCopy} className="shrink-0">
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  )
}
```

- [ ] **Step 4: Test the plan page**

Generate a plan via `/generate`, get redirected to `/plan/[uuid]`, verify:
- Timeline renders with all milestones
- Milestones are sorted by date
- Hover shows detail text
- Dot and badge colors match category
- Copy Link button copies URL to clipboard

- [ ] **Step 5: Commit**

```bash
git add components/timeline.tsx components/copy-link-button.tsx app/plan/
git commit -m "feat: add shareable timeline page with hover tooltips"
```

---

## Task 7: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the landing page**

Replace `app/page.tsx`:
```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Static example milestones for the mockup section
const EXAMPLE_MILESTONES = [
  { date: '8 weeks out', label: 'Lock master + artwork', category: 'production' },
  { date: '7 weeks out', label: 'Upload to DistroKid', category: 'distribution' },
  { date: '6 weeks out', label: 'Pitch Spotify editorial', category: 'press' },
  { date: '3 weeks out', label: 'Post strongest hook teaser', category: 'social' },
  { date: 'Release day', label: 'Drop everywhere + go live', category: 'social' },
]

const DOT_COLORS: Record<string, string> = {
  social: 'bg-blue-400', production: 'bg-yellow-400',
  distribution: 'bg-green-400', press: 'bg-purple-400',
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-4 pt-24 pb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-semibold tracking-tight mb-4">
          Drop smarter.<br />Plan your release.
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Enter your release date and genre — get a personalized,
          date-anchored milestone timeline in seconds.
        </p>
        <Button asChild size="lg">
          <Link href="/generate">Plan My Release</Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">How it works</h2>
        <ul className="space-y-4 text-muted-foreground">
          <li className="flex gap-3">
            <span className="text-foreground font-mono text-sm w-5 shrink-0">01</span>
            <span>Tell us your release date, genre, and how often you want to post.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-foreground font-mono text-sm w-5 shrink-0">02</span>
            <span>Our AI builds a personalized timeline — distributor deadlines, Spotify pitching, social content, press outreach — all anchored to your actual dates.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-foreground font-mono text-sm w-5 shrink-0">03</span>
            <span>Share the link with your team, manager, or just bookmark it for yourself.</span>
          </li>
        </ul>
      </section>

      {/* Static timeline mockup */}
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">What you get</h2>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-6">Example plan · Folk · 1 song · 8-week runway</p>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-5 pl-10">
              {EXAMPLE_MILESTONES.map((m, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-7 w-3 h-3 rounded-full border-2 border-background ${DOT_COLORS[m.category]}`} />
                  <p className="text-xs text-muted-foreground">{m.date}</p>
                  <p className="font-medium text-sm">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-16 text-center">
        <Button asChild size="lg">
          <Link href="/generate">Plan My Release — Free</Link>
        </Button>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Verify landing page renders correctly**

Run `npm run dev`, go to http://localhost:3000, verify:
- Hero text visible
- 3-step explainer visible
- Static timeline mockup renders with colored dots
- "Plan My Release" buttons navigate to `/generate`

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with hero, explainer, and timeline mockup"
```

---

## Task 8: Deploy to Vercel

**Files:**
- No new files — deployment config only

- [ ] **Step 1: Install Vercel CLI**

```bash
npm i -g vercel
```

- [ ] **Step 2: Link project and set up AI Gateway**

```bash
vercel link
```
Follow prompts to create/link a Vercel project.

Then in the Vercel dashboard for this project:
- Go to Settings → AI Gateway → Enable
- This provisions the OIDC credentials the AI SDK needs

- [ ] **Step 3: Pull environment variables**

```bash
vercel env pull .env.local
```
This adds `VERCEL_OIDC_TOKEN` and AI Gateway credentials to `.env.local`. Now local dev uses the real AI Gateway.

- [ ] **Step 4: Add Supabase env vars to Vercel**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Paste the values when prompted. Select all environments (Production, Preview, Development).

- [ ] **Step 5: Revert any local-only API key workarounds from Task 4**

Make sure `app/api/generate/route.ts` uses `'anthropic/claude-haiku-4.5'` as the model string (gateway routing) — no direct provider SDK imports.

- [ ] **Step 6: Test locally with gateway auth**

```bash
npm run dev
```
Generate a plan at http://localhost:3000/generate. Verify the AI responds (uses gateway now, not direct API key).

- [ ] **Step 7: Deploy to Vercel**

```bash
vercel --prod
```
Vercel will build and deploy. Copy the production URL.

- [ ] **Step 8: Smoke test the live URL**

Open the production URL, generate a plan, verify the full flow works end-to-end: form → streaming → redirect → shareable timeline → copy link.

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: production deployment ready"
git push
```

---

## Appendix: ENG310 Submission Checklist

| Item | Where |
|------|-------|
| Idea paragraph (Canvas, Mar 22) | `docs/superpowers/specs/2026-03-17-web-app-project-design.md` § 9 |
| Income statement (Canvas, Mar 25) | Build a spreadsheet using the revenue model in § 6 of spec |
| Live URL (Canvas, Apr 1) | Output of Task 8 |
| AI feature test instructions (Canvas, Apr 8) | Navigate to `/generate`, fill the form, hit Generate |
| External feedback evidence (Canvas, Apr 18) | Share the live URL, screenshot reactions |
