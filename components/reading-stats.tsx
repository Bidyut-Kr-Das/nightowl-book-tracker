"use client";

import { motion } from "motion/react";
import { BookOpen, CheckCircle, Clock, Flame, TrendingUp } from "lucide-react";
import { getReadingStats } from "@/utils/bookUtils";
import { useBookStore } from "@/store/book.store";
// import { getReadingStats } from "@/lib/books-data";

export default function ReadingStats() {
  const { books } = useBookStore();
  const stats = getReadingStats({ books });

  const statItems = [
    {
      label: "Currently Reading",
      value: stats.reading,
      icon: BookOpen,
      color: "oklch(0.82 0.12 70)",
      bgColor: "oklch(0.82 0.12 70 / 8%)",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "oklch(0.72 0.12 145)",
      bgColor: "oklch(0.72 0.12 145 / 8%)",
    },
    {
      label: "Pages Read",
      value: stats.totalPagesRead.toLocaleString(),
      icon: Flame,
      color: "oklch(0.72 0.15 40)",
      bgColor: "oklch(0.72 0.15 40 / 8%)",
    },
    {
      label: "Avg. Rating",
      value: stats.avgRating.toFixed(1),
      icon: TrendingUp,
      color: "oklch(0.70 0.10 280)",
      bgColor: "oklch(0.70 0.10 280 / 8%)",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      {statItems.map((item, i) => (
        <motion.div
          key={item.label}
          className="relative rounded-xl p-4 md:p-5 overflow-hidden group"
          style={{
            background: "oklch(1 0 0 / 3%)",
            border: "1px solid oklch(1 0 0 / 6%)",
          }}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
              },
            },
          }}
          whileHover={{
            y: -2,
            transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
          }}
        >
          {/* Background glow */} 
          <div
            className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle, ${item.bgColor}, transparent 70%)`,
            }}
          />

          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
            style={{ background: item.bgColor }}
          >
            <item.icon size={16} style={{ color: item.color }} />
          </div>

          <p
            className="text-2xl md:text-3xl font-light tracking-tight font-(family-name:--font-display)"
            style={{ color: item.color }}
          >
            {item.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">
            {item.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
