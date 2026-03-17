import { buttonVariants } from '@/components/ui/button-variants'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-24 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Get in touch</h1>
          <p className="text-muted-foreground">
            Have questions about DropPlanner or want to collaborate on a project? 
            Reach out through any of the channels below.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <a href="mailto:marcojking@gmail.com" className={buttonVariants({ variant: "outline", className: "w-full h-12 text-base justify-start px-6" })}>
            <span className="w-6 shrink-0 text-left">✉️</span> 
            marcojking@gmail.com
          </a>
          
          <a href="https://www.instagram.com/marcojking/" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", className: "w-full h-12 text-base justify-start px-6" })}>
            <span className="w-6 shrink-0 text-left">📸</span> 
            @marcojking
          </a>

          <a href="https://www.linkedin.com/in/marcojking/" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", className: "w-full h-12 text-base justify-start px-6" })}>
            <span className="w-6 shrink-0 text-left">💼</span> 
            linkedin.com/in/marcojking
          </a>

          <a href="https://marcoking.com" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", className: "w-full h-12 text-base justify-start px-6" })}>
            <span className="w-6 shrink-0 text-left">🌐</span> 
            marcoking.com
          </a>
        </div>

        <div className="pt-12">
          <Link href="/" className={buttonVariants({ variant: "ghost", className: "text-muted-foreground hover:text-foreground" })}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
