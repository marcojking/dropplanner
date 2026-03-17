import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="max-w-xl text-center space-y-6">
        {/* Eyebrow */}
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          For indie musicians
        </p>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Stop guessing.
          <br />
          <span className="text-accent">Drop on schedule.</span>
        </h1>

        {/* Subhead */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
          DropPlanner turns your release date into a step-by-step campaign timeline —
          distribution deadlines, Spotify pitches, social content, and more.
        </p>

        {/* CTA */}
        <div className="pt-2">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-base font-medium px-8 h-9 transition-all hover:opacity-90"
          >
            Plan my release →
          </Link>
        </div>

        {/* Social proof stub */}
        <p className="text-xs text-muted-foreground/50 pt-4">
          Free · No account required · Shareable link
        </p>
      </div>

      {/* Feature pills */}
      <div className="mt-16 flex flex-wrap gap-3 justify-center max-w-lg">
        {[
          '📅 Date-anchored milestones',
          '🎵 Folk, Pop & Country',
          '📣 Singles, EPs & Albums',
          '📊 Posts-per-week pacing',
          '🔗 Shareable plan link',
        ].map((f) => (
          <span
            key={f}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground"
          >
            {f}
          </span>
        ))}
      </div>
    </main>
  )
}
