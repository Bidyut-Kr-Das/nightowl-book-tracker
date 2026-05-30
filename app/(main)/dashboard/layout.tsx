"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/lib/theme-provider";
import {
  BookOpen,
  Library,
  CheckCircle,
  Heart,
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  Pause,
  Home,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useBookStore } from "@/store/book.store";

const navItems = [
  { href: "/dashboard", label: "All Books", icon: Library },
  // { href: "/dashboard?status=READING", label: "Reading", icon: BookOpen },
  // {
  //   href: "/dashboard?status=COMPLETED",
  //   label: "Completed",
  //   icon: CheckCircle,
  // },
  // {
  //   href: "/dashboard?status=WANT_TO_READ",
  //   label: "Want to Read",
  //   icon: Heart,
  // },
  // { href: "/dashboard?status=ON_HOLD", label: "On Hold", icon: Pause },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getAllLibraryBooks, books } = useBookStore();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  //fetch book if the array is empty
  useEffect(() => {
    if (!books.length) {
      (async () => {
        await getAllLibraryBooks();
      })();
    }
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-65
          flex flex-col
          bg-sidebar border-r border-sidebar-border
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 pb-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
              style={{
                background: "oklch(from var(--primary) l c h / 12%)",
                border: "1px solid oklch(from var(--primary) l c h / 15%)",
              }}
            >
              
            </div> */}
            <Image
              src={"/android-chrome-512x512.png"}
              width={24}
              height={24}
              style={{
                width: "auto",
                height: "auto",
              }}
              alt="logo"
            />
            <span className="text-lg font-semibold tracking-tight font-(family-name:--font-dynapuff)">
              NightOwl
            </span>
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <div className="px-2 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Library
          </div>
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" && !item.href.includes("?")
                : false;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-200 active:scale-[0.98]
                  ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="px-2 py-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Discover
          </div>
          <Link
            href="/dashboard/search"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
              transition-all duration-200 active:scale-[0.98]
              ${
                pathname === "/dashboard/search"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }
            `}
          >
            <Search
              size={18}
              strokeWidth={pathname === "/dashboard/search" ? 2.2 : 1.8}
            />
            <span>Search</span>
          </Link>
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.98]"
          >
            {theme === "dark" ? (
              <>
                <Sun size={18} strokeWidth={1.8} />
                <span>Light mode</span>
              </>
            ) : (
              <>
                <Moon size={18} strokeWidth={1.8} />
                <span>Dark mode</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-auto min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-background/80 backdrop-blur-xl border-b border-border lg:hidden py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl lg:flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-95 hidden"
          >
            <Menu size={20} />
          </button>
          <span className="text-lg flex gap-4 font-semibold font-(family-name:--font-dynapuff) tracking-tight">
            <Image
              src={"/android-chrome-512x512.png"}
              width={24}
              height={24}
              alt="logo"
            />
            NightOwl
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1  px-4 pb-12 md:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
