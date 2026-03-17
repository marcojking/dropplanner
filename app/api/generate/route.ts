import { streamText } from 'ai'
import { after } from 'next/server'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { planSchema } from '@/lib/schema'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { genre, songCount, releaseDate, postsPerWeek } = await req.json()

  const planId = crypto.randomUUID()

  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    system: buildSystemPrompt({ genre, songCount, releaseDate, postsPerWeek }),
    prompt: 'Generate the release timeline now.',
  })

  after(async () => {
    try {
      const text = await result.text
      const parsed = planSchema.parse(JSON.parse(text))
      await supabase.from('plans').insert({
        id: planId,
        genre,
        song_count: songCount,
        release_date: releaseDate,
        posts_per_week: postsPerWeek,
        milestones: parsed.milestones,
      })
    } catch (e) {
      console.error('[generate] failed to save plan:', e)
    }
  })

  const streamResponse = result.toTextStreamResponse()
  return new Response(streamResponse.body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Plan-Id': planId,
    },
  })
}
