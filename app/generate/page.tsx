import { ReleaseForm } from '@/components/release-form'

export const metadata = {
  title: 'Plan Your Release — DropPlanner',
}

export default function GeneratePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md space-y-6 mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Build Your Release Timeline
        </h1>
        <p className="text-muted-foreground text-sm">
          Answer four questions. Get a date-anchored campaign plan built around
          your genre, runway, and posting schedule.
        </p>
      </div>
      <ReleaseForm />
    </main>
  )
}
