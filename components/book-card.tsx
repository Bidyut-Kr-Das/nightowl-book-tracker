"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useSpring, useTransform, useMotionValue } from "motion/react";
import { IBook } from "@/types/interface";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
// import type { Book } from "@/lib/books-data";

interface BookCardProps {
  book: IBook;
  index: number;
  onSelect?: (book: IBook) => void;
  size?: "sm" | "md" | "lg";
}

export default function BookCard({
  book,
  index,
  onSelect,
  size = "md",
}: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-powered 3D tilt — feels alive per Emil's spring philosophy
  const rotateX = useSpring(0, { stiffness: 150, damping: 15 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 15 });

  const sizeClasses = {
    sm: "w-[100px] h-[150px]",
    md: "w-[140px] h-[210px]",
    lg: "w-[180px] h-[270px]",
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);

      mouseX.set(x);
      mouseY.set(y);
      rotateX.set(-y * 8);
      rotateY.set(x * 8);
    },
    [mouseX, mouseY, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const glowOpacity = useTransform(mouseX, [-1, 0, 1], [0.1, 0.2, 0.3]);

  return (
    <motion.div
      ref={cardRef}
      className="relative cursor-pointer group"
      style={{
        perspective: 800,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect?.(book)}
    >
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-sm overflow-hidden`}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          y: -8,
          transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
        }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Book spine edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.75 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.1))",
          }}
        />

        {/* Cover image */}
        <div className="relative w-full h-full">
          {/* Shimmer loading state */}
          {!imageLoaded && (
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.18 0.008 260), oklch(0.22 0.01 260), oklch(0.18 0.008 260))",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite linear",
              }}
            />
          )}
          <Image
            src={book.coverImage || "/placeholder-cover.png"}
            alt={`${book.title} by ${book.authors.join(", ")}`}
            fill
            className={`object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            sizes={
              size === "lg"
                ? "180px"
                : size === "md"
                  ? "140px"
                  : "100px"
            }
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Hover glow overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, rgba(210, 170, 100, ${isHovered ? 0.12 : 0}), transparent 70%)`,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Page edge effect on right side */}
        <div
          className="absolute right-0 top-0.5 bottom-0.5 w-1"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.02) 1px, rgba(0,0,0,0.05) 2px)",
          }}
        />

        {/* Shadow below book — lifts on hover */}
        <div
          className={`absolute -bottom-2 left-1 right-1 h-4 transition-all duration-300 ${
            isHovered ? "blur-lg opacity-60" : "blur-md opacity-40"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.7), transparent)",
            transform: isHovered ? "translateY(4px) scaleX(1.05)" : "none",
          }}
        />

        {/* Reading progress bar */}
        {book.status === ReadingStatus.READING && book.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-black/40">
            <motion.div
              className="h-full rounded-r-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.82 0.12 70), oklch(0.72 0.15 40))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${book.progress}%` }}
              transition={{
                duration: 1.2,
                delay: index * 0.1 + 0.5,
                ease: [0.23, 1, 0.32, 1],
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Book info below */}
      <motion.div
        className="mt-3 px-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.06 + 0.3 }}
      >
        <p
          className="text-[13px] font-medium text-foreground/90 leading-tight line-clamp-2 font-(family-name:--font-display)"
          title={book.title}
        >
          {book.title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {book.authors.join(", ")}
        </p>
        {book.averageRating && (
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-[10px] ${i < book.averageRating! ? "text-lamp" : "text-muted-foreground/30"}`}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
