"use client";

import { motion } from "motion/react";
import Image from "next/image";
// import { getBooksByStatus } from "@/lib/books-data";
import { BookOpen, ArrowDown } from "lucide-react";
import { useBookStore } from "@/store/book.store";
import { getBooksByStatus } from "@/utils/bookUtils";
import { ReadingStatus } from "@/lib/generated/prisma/browser";

export default function HeroSection() {
  const { books } = useBookStore();
  const currentlyReading = getBooksByStatus({
    books,
    status: ReadingStatus.READING,
  });
  const displayBooks = currentlyReading.slice(0, 3);

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Ambient background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[15%] left-[10%] w-125 h-125 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.82 0.12 70 / 8%), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[15%] w-100 h-100 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.15 40 / 10%), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-5">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
          style={{
            background: "oklch(1 0 0 / 4%)",
            border: "1px solid oklch(1 0 0 / 8%)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <BookOpen size={14} className="text-lamp" />
          <span className="text-muted-foreground">
            Your personal reading sanctuary
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] font-(family-name:--font-display)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          Your books,
          <br />
          <span
            className="font-normal"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.08 70), oklch(0.72 0.15 40))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            beautifully shelved
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-light leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          Track your reading journey in a space that feels like home. Cozy,
          immersive, and thoughtfully crafted.
        </motion.p>

        {/* Animated bookshelf preview — 3 books */}
        <motion.div
          className="mt-14 flex items-end justify-center gap-4 md:gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.7 },
            },
          }}
        >
          {displayBooks.map((book, i) => (
            <motion.div
              key={book.id}
              className="relative"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 40,
                  rotateZ: i === 1 ? 0 : i === 0 ? -3 : 3,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateZ: i === 1 ? 0 : i === 0 ? -3 : 3,
                  transition: {
                    duration: 0.8,
                    ease: [0.23, 1, 0.32, 1],
                  },
                },
              }}
              whileHover={{
                y: -12,
                rotateZ: 0,
                transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
              }}
            >
              <div
                className={`relative overflow-hidden rounded-sm ${
                  i === 1
                    ? "w-35 h-52.5 md:w-45 md:h-67.5"
                    : "w-27.5 h-41.25 md:w-35 md:h-52.5"
                }`}
                style={{
                  boxShadow:
                    i === 1
                      ? "-8px 10px 30px rgba(0,0,0,0.5), 0 0 40px rgba(200,160,80,0.08)"
                      : "-6px 8px 20px rgba(0,0,0,0.4)",
                }}
              >
                <Image
                  src={book.coverImage || "/placeholder-cover.png"}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="180px"
                  priority
                />
                {/* Spine */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.75"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
                  }}
                />
              </div>

              {/* Reading progress bar */}
              {book.progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/30">
                  <motion.div
                    className="h-full"
                    style={{
                      background: "oklch(0.82 0.12 70)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${book.progress}%` }}
                    transition={{
                      delay: 1.5 + i * 0.15,
                      duration: 1,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Shelf under hero books */}
        <motion.div
          className="mt-0 w-95 md:w-130 mx-auto"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{
            delay: 1.2,
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <div
            className="h-2 rounded-b-sm"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.32 0.05 50), oklch(0.25 0.04 45))",
              boxShadow:
                "0 4px 16px -2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          />
          <div
            className="h-1 rounded-b-sm"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.28 0.04 48), oklch(0.22 0.03 42))",
            }}
          />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} className="text-muted-foreground/30" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
