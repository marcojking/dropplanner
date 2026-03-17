import { Badge } from '@/components/ui/badge'
import type { Milestone } from '@/lib/schema'

const CATEGORY_STYLES: Record<Milestone['category'], string> = {
  social: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  production: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  distribution: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  press: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

const DOT_STYLES: Record<Milestone['category'], string> = {
  social: 'bg-violet-400',
  production: 'bg-amber-400',
  distribution: 'bg-sky-400',
  press: 'bg-emerald-400',
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function weekLabel(week: number) {
  if (week === 0) return 'Release Week'
  if (week < 0) return `${Math.abs(week)}w out`
  return `+${week}w`
}

interface TimelineProps {
  milestones: Milestone[]
}

export function Timeline({ milestones }: TimelineProps) {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(Object.keys(CATEGORY_STYLES) as Milestone['category'][]).map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${DOT_STYLES[cat]}`} />
            <span className="text-xs text-muted-foreground capitalize">{cat}</span>
          </div>
        ))}
      </div>

      {/* Vertical line */}
      <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-border hidden sm:block" />

      <ol className="space-y-0">
        {sorted.map((m, i) => (
          <li key={i} className="group relative flex gap-4 sm:gap-8 pb-8 last:pb-0">
            {/* Date column */}
            <div className="w-20 shrink-0 text-right">
              <span className="text-xs font-mono text-muted-foreground">
                {formatDate(m.date)}
              </span>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                {weekLabel(m.week)}
              </div>
            </div>

            {/* Dot */}
            <div className="relative z-10 hidden sm:flex items-start justify-center w-4 shrink-0 mt-0.5">
              <span
                className={`h-3 w-3 rounded-full border-2 border-background ring-1 ring-border group-hover:scale-125 transition-transform ${DOT_STYLES[m.category]}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium leading-snug">{m.label}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-4 capitalize border ${CATEGORY_STYLES[m.category]}`}
                >
                  {m.category}
                </Badge>
              </div>

              {/* Tooltip-style detail — shown on hover */}
              <p className="text-xs text-muted-foreground leading-relaxed max-w-prose opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-40 transition-all duration-200">
                {m.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
