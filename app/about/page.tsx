import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-16 bg-background">
      <div className="w-full max-w-4xl space-y-16">
        
        {/* Header & Bio */}
        <section className="space-y-6 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Meet the Builder</h1>
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            <div className="w-48 h-48 shrink-0 relative rounded-full overflow-hidden border-4 border-accent/20">
              <Image 
                src="/media/headshot.jpg" 
                alt="Marco King" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Hey, I'm Marco. I built DropPlanner because I know firsthand how chaotic it can be to coordinate a music release. 
                Between finishing the masters, shooting the music video, and trying to figure out Spotify pitching deadlines, it's easy to let things slip through the cracks.
              </p>
              <p>
                I'm passionate about both making music and filmmaking. Whether I'm producing a track in the studio or directing 
                behind the camera on an indie short film or music video shoot, I love the entire creative process. 
                DropPlanner is my way of giving independent artists the structured rollout strategy they deserve, 
                so they can spend less time guessing and more time creating.
              </p>
            </div>
          </div>
        </section>

        {/* 30-Second Pitch Video */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">The 30-Second Pitch</h2>
          <div className="aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-muted border border-border shadow-sm relative">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/yrOLyydQm4w"
              title="DropPlanner Explainer Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold tracking-tight">Behind the Scenes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="relative aspect-square sm:aspect-auto sm:h-80 rounded-xl overflow-hidden border border-border group">
              <Image 
                src="/media/bts (2 of 3).jpg" 
                alt="Behind the scenes filmmaking" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <p className="text-white text-sm font-medium">On Set</p>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-4 h-[800px] sm:h-80">
              <div className="relative rounded-xl overflow-hidden border border-border group">
                <Image 
                  src="/media/rockmtviewguitar_1.2.1-AoPJPqqWQNcOn6kj.jpg" 
                  alt="Playing Guitar" 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="relative rounded-xl overflow-hidden border border-border group">
                  <Image 
                    src="/media/AlbumCover.png" 
                    alt="Album Cover Art" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative rounded-xl overflow-hidden border border-border group">
                  <Image 
                    src="/media/IMG_8395.jpg" 
                    alt="Studio Session" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative rounded-xl overflow-hidden border border-border group">
                  <Image 
                    src="/media/thumb-mxBMbRbJpaT3yk0e.jpg" 
                    alt="Headshot" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
