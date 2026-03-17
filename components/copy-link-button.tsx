'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Link } from 'lucide-react'

export function CopyLinkButton({ planId }: { planId: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/plan/${planId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-400" />
          Copied!
        </>
      ) : (
        <>
          <Link className="h-3.5 w-3.5" />
          Copy link
        </>
      )}
    </Button>
  )
}
