"use client";

import {
  CalendarIcon,
  HomeIcon,
  Library,
  MailIcon,
  Moon,
  PencilIcon,
  Search,
  Sun,
} from "lucide-react";
import Link from "next/link";
import React from "react";

// import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dock, DockIcon } from "@/components/ui/dock";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "@/lib/theme-provider";

export type IconProps = React.HTMLAttributes<SVGElement>;

const DATA = {
  navbar: [
    { href: "/dashboard", icon: Library, label: "Library" },
    { href: "/dashboard/search", icon: Search, label: "Search" },
  ],
};

export function MobileDock() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="absolute bottom-5 left-0 right-0 lg:hidden">
      <TooltipProvider>
        <Dock
          direction="middle"
          className="bg-blend-color-burn bg-accent rounded-md"
        >
          {DATA.navbar.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12 rounded-full",
                    )}
                  >
                    <item.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}

          <Separator orientation="vertical" className="h-full py-2" />
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3   rounded-xl text-sm  hover:text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.98]"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={18} strokeWidth={1.8} />
                    </>
                  ) : (
                    <>
                      <Moon size={18} strokeWidth={1.8} />
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Theme</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
          <Separator orientation="vertical" className="h-full" />

          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <UserButton />
              </TooltipTrigger>
              <TooltipContent>
                <p>user</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </div>
  );
}
