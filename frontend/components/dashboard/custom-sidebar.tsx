"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Settings,
  Briefcase,
  LayoutDashboard,
  Sparkles,
  LogOut,
  User as UserIcon,
  ChevronsUpDown,
  Menu,
  X, // ← THÊM
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { useMyProfile } from "@/hooks/use-my-profile";
import { api, jobApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notification-bell";

const NAV = [
  {
    title: "Home",
    icon: LayoutDashboard,
    href: "/dashboard",
    tourKey: "home",
  },
  {
    title: "My Profile",
    icon: UserIcon,
    href: "/dashboard/my-profile",
    tourKey: "profile",
  },
  {
    title: "Job Matches",
    icon: Briefcase,
    href: "/dashboard/jobs",
    tourKey: "jobs",
  },
  {
    title: "AI Analysis",
    icon: Sparkles,
    href: "/dashboard/ai-analysis",
    tourKey: "analysis",
  },
];

export function CustomSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <div className="fixed left-4 top-4 z-40 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Open menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="!w-64 !max-w-64 p-0"
            showCloseButton={false} // tắt X mặc định nếu prop có
          >
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="flex h-full w-64 flex-col overflow-y-auto border-r border-border bg-sidebar">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          onClick={onNavigate}
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Talentgraph</div>
            <div className="text-xs text-muted-foreground">
              Your AI Career Copilot
            </div>
          </div>
        </Link>

        {/* Chỉ hiện X trên mobile (khi onNavigate được pass) */}
        {onNavigate && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onNavigate}
            aria-label="Close menu"
            className="lg:hidden"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Research Tools
        </h3>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              data-tour={`sidebar-${item.tourKey}`}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          );
        })}

        <ProgressChecklist />
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* User dropdown — flex-1 + min-w-0 để truncate đúng */}
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/50">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold leading-tight">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground leading-tight">
                  {user?.email}
                </p>
              </div>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent side="right" align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard/my-profile" />}>
                <UserIcon className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* ThemeToggle đã có label + switch — không cần wrap thêm */}
              <div className="px-1 py-1">
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationBell />
        </div>
      </div>
    </aside>
  );
}

/* ─────────── Progress checklist ─────────── */

function ProgressChecklist() {
  const { profile, loading } = useMyProfile();
  const [jobsCount, setJobsCount] = useState(0);
  const [scoresCount, setScoresCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    jobApi
      .list()
      .then((data) => setJobsCount(data.length))
      .catch(() => {});
    api
      .getUserScores(profile.candidate_id)
      .then((data) => setScoresCount(data.length))
      .catch(() => {});
  }, [profile]);

  if (loading) return null;

  const steps = [
    { label: "Upload CV", done: !!profile },
    { label: "Add GitHub", done: !!profile?.github_url },
    { label: "Find jobs", done: jobsCount > 0 },
    { label: "Score matches", done: scoresCount > 0 },
  ];
  const completed = steps.filter((s) => s.done).length;

  if (completed === steps.length) return null;

  const progressPct = (completed / steps.length) * 100;

  return (
    <div className="mx-1 my-4 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold">
          Get started ({completed}/{steps.length})
        </p>
        <span className="text-[10px] font-mono text-primary">
          {Math.round(progressPct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span
              className={
                s.done
                  ? "flex size-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-500"
                  : "flex size-4 items-center justify-center rounded-full border border-muted-foreground/30 text-[10px] text-muted-foreground"
              }
            >
              {s.done ? "✓" : ""}
            </span>
            <span
              className={
                s.done ? "line-through opacity-60" : "text-foreground/90"
              }
            >
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
