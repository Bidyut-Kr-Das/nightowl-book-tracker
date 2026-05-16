"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { BookOpen, Moon, Search } from "lucide-react";

interface NavbarProps {
  onSearchToggle?: () => void;
}

export default function Navbar({ onSearchToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? "oklch(0.11 0.008 260 / 80%)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled
          ? "1px solid oklch(1 0 0 / 5%)"
          : "1px solid transparent",
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
            style={{
              background: "oklch(0.82 0.12 70 / 12%)",
              border: "1px solid oklch(0.82 0.12 70 / 15%)",
            }}
          >
            <Moon
              size={16}
              className="text-lamp"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-lg font-semibold tracking-tight font-[family-name:var(--font-display)]">
            NightOwl
          </span>
        </Link>

        {/* Nav links — center */}
        <div className="hidden md:flex items-center gap-1">
          {["Library", "Reading", "Completed", "Wishlist"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-white/4 active:scale-97"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchToggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/4 transition-all duration-200 active:scale-95"
            aria-label="Toggle search"
          >
            <Search size={18} />
          </button>

          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: "oklch(0.82 0.12 70 / 10%)",
              border: "1px solid oklch(0.82 0.12 70 / 12%)",
              color: "oklch(0.82 0.12 70)",
            }}
          >
            <BookOpen size={12} />
            <span>3 reading</span>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
