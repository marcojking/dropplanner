import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { EmailCaptureForm } from '@/components/email-capture-form'

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 bg-background">
      {/* Hero Section */}
      <section className="w-full max-w-4xl pt-24 pb-16 text-center space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-mono uppercase tracking-widest text-accent font-semibold">
            Built for independent artists
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Stop guessing.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">
              Drop on schedule.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            DropPlanner turns your release date into a step-by-step campaign timeline —
            distribution deadlines, Spotify pitches, social content, and rollout strategies automatically scheduled out for you.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/generate" className={buttonVariants({ size: "lg", className: "h-12 px-8 text-base" })}>
            Plan my release
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-8 text-base" })}>
            Meet the builder
          </Link>
        </div>
      </section>

      {/* Feature Divider */}
      <div className="w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-border to-transparent my-12" />

      {/* Email Capture Section */}
      <section className="w-full max-w-2xl pb-24">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {/* Subtle background gradient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <EmailCaptureForm />
          </div>
        </div>
      </section>
    </main>
  )
}
