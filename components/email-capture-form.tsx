"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function EmailCaptureForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("loading")
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setStatus("success")
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-accent/10 border border-accent/20 rounded-xl max-w-md mx-auto fade-in animate-in slide-in-from-bottom-2">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-foreground mb-1">You're on the list!</h3>
        <p className="text-sm text-muted-foreground text-center">
          We'll keep you posted on the latest updates.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">Stay updated</h3>
        <p className="text-sm text-muted-foreground">Be the first to hear about new features and updates to the app.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder="First Name"
            className="flex h-9 w-full sm:w-1/3 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <input
            type="email"
            required
            placeholder="Email address"
            className="flex h-9 w-full sm:w-2/3 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
        <Button type="submit" disabled={status === "loading"} className="h-9 whitespace-nowrap">
          {status === "loading" ? "Joining..." : "Join"}
        </Button>
      </form>
    </div>
  )
}
