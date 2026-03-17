import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button-variants'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="DropPlanner Logo" 
              width={32} 
              height={32} 
              className="rounded-sm"
            />
            <span className="font-bold tracking-tight">DropPlanner</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Home
            </Link>
            <Link href="/generate" className="transition-colors hover:text-foreground/80 text-foreground/60">
              App
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
              About
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Contact
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/generate" className={buttonVariants({ variant: "outline", size: "sm", className: "hidden sm:flex" })}>
            Launch App
          </Link>
          
          {/* Mobile Nav Toggle placeholder (can expand if needed) */}
          <div className="md:hidden flex gap-3 text-sm font-medium">
            <Link href="/" className="text-foreground/60 hover:text-foreground">Home</Link>
            <Link href="/about" className="text-foreground/60 hover:text-foreground">About</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
