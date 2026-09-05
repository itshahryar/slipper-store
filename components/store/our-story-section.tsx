"use client";

import { Footprints, Lightbulb, Scale, Compass, Hammer } from "lucide-react";

interface OurStorySectionProps {
  videoSrc?: string;
}

export function OurStorySection({
  videoSrc = "/story video/story_video.mp4",
}: OurStorySectionProps) {
  return (
    <section className="w-full bg-card border-y py-10 sm:py-14 px-4 sm:px-8 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b">
          <div className="space-y-1.5 text-left flex-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
              ✨ Our Story
            </span>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight text-foreground leading-snug uppercase">
              It Started As A Refusal To Settle, <br className="hidden sm:inline" />
              Not A Business Plan.
            </h2>
          </div>

          {/* Golden Rule Quote Card */}
          <div className="p-3.5 border border-amber-500/20 rounded-xl bg-amber-500/5 border-l-4 border-l-amber-500 space-y-1 lg:max-w-md shrink-0 text-left shadow-xs">
            <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-widest block">
              Our Golden Rule
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-foreground italic">
              &ldquo;Would I be proud to have this on my own feet?&rdquo;
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              If the answer&apos;s yes, it earns its place in our store. If not, it doesn&apos;t.
            </p>
          </div>
        </div>

        {/* 3-Column Redesigned Grid: Left Cards | Centered Video | Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-center">
          {/* LEFT COLUMN: Cards 1 & 2 */}
          <div className="space-y-4">
            {/* Card 1: Deserving Real Comfort */}
            <div className="p-4 border rounded-xl bg-card shadow-xs space-y-1.5 text-left hover:border-primary/40 transition-colors">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="h-3.5 w-3.5 text-primary shrink-0" />
                Deserving Real Comfort
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Our feet <span className="text-foreground font-bold">do it all</span> — busy mornings, long workdays, quick errands, midnight tea, and lazy Sundays at home. They carry us through it all, so when the day slows down, they <span className="text-foreground font-bold">deserve</span> one thing: real comfort.
              </p>
            </div>

            {/* Card 2: The Market Gap */}
            <div className="p-4 border rounded-xl bg-card shadow-xs space-y-1.5 text-left hover:border-primary/40 transition-colors">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
                The Market Gap
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                It was either <span className="text-foreground font-bold">typical plastic</span> and <span className="text-foreground font-bold">cheap</span> but <span className="text-foreground font-bold">uncomfortable</span>, or <span className="text-foreground font-bold">stylish</span> but <span className="text-foreground font-bold">overpriced.</span> And even when something felt right, it was usually made for <span className="text-foreground font-bold">indoors — not for stepping out.</span>
              </p>
            </div>
          </div>

          {/* CENTER COLUMN: Brand Story Video Container (Seamless Borderless) */}
          <div className="w-full">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-xl flex items-center justify-center">
              <video
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Cards 3 & 4 */}
          <div className="space-y-4">
            {/* Card 3: That’s Where It All Began */}
            <div className="p-4 border rounded-xl bg-card shadow-xs space-y-1.5 text-left hover:border-primary/40 transition-colors">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                That’s Where It All Began
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Visiting local markets, we kept seeing the same thing — <span className="text-foreground font-bold">Gen Z</span> wanted something <span className="text-foreground font-bold">different.</span> Something modern, genuinely comfortable, and made for everyday life, but the options always fell short.
              </p>
            </div>

            {/* Card 4: Comfort Anywhere */}
            <div className="p-4 border rounded-xl bg-card shadow-xs space-y-1.5 text-left hover:border-primary/40 transition-colors">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary shrink-0" />
                Comfort Anywhere
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                We believed there had to be a better choice. Comfort <span className="text-foreground font-bold">shouldn’t</span> be boring, expensive, or limited to the indoors. It should <span className="text-foreground font-bold">go wherever you do.</span>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM FULL-WIDTH ROW: Card 5 Under Video */}
        <div className="max-w-2xl mx-auto pt-1">
          <div className="p-4 border rounded-xl bg-card shadow-xs space-y-1.5 text-center hover:border-primary/40 transition-colors">
            <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Hammer className="h-3.5 w-3.5 text-primary shrink-0" />
              Building It Ourselves
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xl mx-auto">
              We had <span className="text-foreground font-bold">no background in footwear</span> — just a clear feeling that something was missing. So instead of waiting for someone else to fill the gap, we decided to build it ourselves.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
