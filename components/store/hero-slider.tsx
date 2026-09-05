"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SlideItem {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgImage: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: "SEASONAL SALE",
    title: "SUMMER SALE UP TO 50% OFF",
    subtitle: "Handcrafted calfskin leather slippers & ergonomic slides.",
    ctaText: "SHOP LEATHER SLIPPERS",
    ctaLink: "/collections/men",
    bgImage: "/banner images/1.jpeg",
  },
  {
    id: 2,
    badge: "PURE COMFORT",
    title: "PLUSH SHEARLING & CLOUD FOAM",
    subtitle: "Ultra-soft indoor slippers designed for morning warmth.",
    ctaText: "SHOP WOMEN'S COLLECTION",
    ctaLink: "/collections/women",
    bgImage: "/banner images/2.jpeg",
  },
  {
    id: 3,
    badge: "TRADITIONAL ELEGANCE",
    title: "ENGINEERED FOR SUPREME COMFORT",
    subtitle: "Authentic Peshawari chappals & handcrafted leather sandals.",
    ctaText: "SHOP PESHAWARI CHAPPAL",
    ctaLink: "/collections/men-peshawari",
    bgImage: "/banner images/3.jpeg",
  },
  {
    id: 4,
    badge: "FOOTWEAR PROTECTION",
    title: "DISTINCTIVE DETAILS THAT IMPRESS",
    subtitle: "Natural beeswax polish & 100% horsehair shine brushes.",
    ctaText: "SHOP CARE KITS",
    ctaLink: "/collections/care-accessories",
    bgImage: "/banner images/4.jpeg",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto advance slide every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div
      className="relative w-full h-[300px] sm:h-[400px] md:h-[460px] lg:h-[490px] bg-neutral-900 overflow-hidden text-white group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Background Images */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.bgImage}
            alt={slide.title}
            fill
            priority={idx === 0}
            className="object-cover object-center opacity-80"
          />
          {/* Dark Gradient Overlay for optimal legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Slide Text Content */}
          <div className="container mx-auto h-full px-6 sm:pl-24 lg:pl-28 sm:pr-12 flex flex-col justify-center max-w-7xl relative z-20 space-y-3.5">
            <span className="inline-block text-xs sm:text-sm font-extrabold tracking-widest text-amber-400 uppercase">
              {slide.badge}
            </span>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight uppercase drop-shadow-md">
              {slide.title}
            </h2>

            <p className="text-neutral-300 text-xs sm:text-base max-w-xl leading-relaxed">
              {slide.subtitle}
            </p>

            <div className="pt-1">
              <Link href={slide.ctaLink}>
                <Button
                  variant="outline"
                  size="default"
                  className="h-10 sm:h-11 px-6 font-extrabold text-xs sm:text-sm uppercase tracking-widest border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  {slide.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Left Arrow Button (Hidden on mobile, visible on desktop/tablet) */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/30 backdrop-blur-xs text-white hover:bg-white hover:text-black transition-all items-center justify-center shadow-lg cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Right Arrow Button (Hidden on mobile, visible on desktop/tablet) */}
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/30 backdrop-blur-xs text-white hover:bg-white hover:text-black transition-all items-center justify-center shadow-lg cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === currentSlide
                ? "w-7 bg-amber-400"
                : "w-2 bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
