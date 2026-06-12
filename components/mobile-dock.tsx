"use client";

import {
  CalendarIcon,
  HomeIcon,
  Library,
  MailIcon,
  Moon,
  PencilIcon,
  PlusIcon,
  Search,
  Settings2,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

// import { ModeToggle } from "@/components/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dock, DockIcon } from "@/components/ui/dock";
import { useUser } from "@clerk/nextjs";
import { useUserStore } from "@/store/user.store";
// import { useTheme } from "@/lib/theme-provider";
import BookFormDialog from "./book-form-dialog/book-form-dialog";
import { useTheme } from "./theme-provider";

export type IconProps = React.HTMLAttributes<SVGElement>;

const DATA = {
  navbar: [
    { href: "/dashboard", icon: Library, label: "Library" },
    { href: "/dashboard/search", icon: Search, label: "Search" },
    // { href: "/profile", icon: User, label: "Profile" },
  ],
};

export function MobileDock() {
  const { user, isLoaded } = useUser();
  const { profile, fetchProfile } = useUserStore();
  const { theme, toggleMode, mode } = useTheme();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  

  return (
    <div className="absolute bottom-5 left-0 right-0 lg:hidden text-black z-50">
      <TooltipProvider>
        <Dock
          direction="middle"
          className="bg-main border-2 rounded-full"
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
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="bg-transparent flex items-center gap-3   rounded-xl text-sm  hover:text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.98]"
                  onClick={() => {
                    setEditDialogOpen((prev) => !prev);
                  }}
                >
                  <PlusIcon />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>

          <Separator orientation="vertical" className="h-full py-2" />
           <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={"/settings"}
                  aria-label={"Settings"}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12 rounded-full",
                  )}
                >
                  <Settings2 className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleMode}
                  className="flex items-center gap-3   rounded-xl text-sm  hover:text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.98]"
                >
                  {mode === "dark" ? (
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
                <Link
                  href={"/profile"}
                  aria-label={"Profile"}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12 rounded-full",
                  )}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border">
                    {isLoaded && user?.imageUrl ? (
                      <Image
                        src={profile?.Avatar?.url || user.imageUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="size-4" />
                      </div>
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
      <BookFormDialog
        mode="create"
        // book={book}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={(data) => {
          // console.log(data);
        }}
      />
    </div>
  );
}
