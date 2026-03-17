'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const GENRES = ['Folk', 'Pop', 'Country']

export function ReleaseForm() {
  const router = useRouter()
  const [genre, setGenre] = useState('')
  const [songCount, setSongCount] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [postsPerWeek, setPostsPerWeek] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!genre || !songCount || !releaseDate || !postsPerWeek) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          songCount: parseInt(songCount),
          releaseDate,
          postsPerWeek: parseInt(postsPerWeek),
        }),
      })

      const planId = res.headers.get('X-Plan-Id')
      if (!planId) throw new Error('No plan ID returned')

      // Drain the stream before redirecting so the server finishes saving
      const reader = res.body?.getReader()
      if (reader) {
        while (true) {
          const { done } = await reader.read()
          if (done) break
        }
      }

      router.push(`/plan/${planId}`)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Plan Your Release</CardTitle>
        <CardDescription className="text-muted-foreground">
          Fill in your details and we&apos;ll build a personalized timeline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Genre */}
          <div className="space-y-1.5">
            <Label htmlFor="genre">Genre</Label>
            <Select value={genre} onValueChange={(v) => setGenre(v ?? '')}>
              <SelectTrigger id="genre" className="w-full">
                <SelectValue placeholder="Select genre…" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Song Count */}
          <div className="space-y-1.5">
            <Label htmlFor="songCount">Number of Songs</Label>
            <Select value={songCount} onValueChange={(v) => setSongCount(v ?? '')}>
              <SelectTrigger id="songCount" className="w-full">
                <SelectValue placeholder="How many tracks?" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? 'song' : 'songs'}{' '}
                    {n <= 2 ? '(Single)' : n <= 6 ? '(EP)' : '(Album)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Release Date */}
          <div className="space-y-1.5">
            <Label htmlFor="releaseDate">Target Release Date</Label>
            <input
              id="releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Posts Per Week */}
          <div className="space-y-1.5">
            <Label htmlFor="postsPerWeek">Posts Per Week</Label>
            <Select value={postsPerWeek} onValueChange={(v) => setPostsPerWeek(v ?? '')}>
              <SelectTrigger id="postsPerWeek" className="w-full">
                <SelectValue placeholder="How often do you post?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1× / week (minimum viable)</SelectItem>
                <SelectItem value="3">3× / week (recommended)</SelectItem>
                <SelectItem value="5">5× / week (aggressive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Building your timeline…' : 'Generate Timeline →'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
