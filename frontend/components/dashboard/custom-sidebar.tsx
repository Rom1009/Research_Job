"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Settings,
  LifeBuoy,
  Briefcase,
  LayoutDashboard,
  Users,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export function CustomSidebar() {
  const pathname = usePathname();

  const { user, logout } = useAuth();
  const router = useRouter();

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

  const research = [
    { title: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    {
      title: "Candidates",
      icon: Users,
      href: "/dashboard/candidates",
      badge: "9",
    },
    {
      title: "Profile Intake",
      icon: UploadCloud,
      href: "/dashboard/profile-intake",
    },
    { title: "Job Scraping", icon: Briefcase, href: "/dashboard/jobs" },
    { title: "AI Analysis", icon: Sparkles, href: "/dashboard/ai-analysis" },
  ];

  const pipelines = [
    { title: "Backend Squad", icon: Briefcase, badge: "24" },
    { title: "ML Platform", icon: Briefcase, badge: "16" },
    { title: "Frontend Guild", icon: Briefcase, badge: "11" },
  ];

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="flex h-screen w-64 flex-col overflow-y-auto border-r border-border bg-sidebar">
      {/* Header */}
      <div className="border-b border-sidebar-border p-4">
        <Link
          href="/dashboard"
          className="flex w-full items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search className="size-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Talentgraph
            </span>
            <span className="text-xs text-muted-foreground">
              Candidate Research
            </span>
          </div>
        </Link>
      </div>

      {/* Research Tools */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6">
          <h3 className="mb-3 px-2 text-xs font-semibold text-muted-foreground">
            Research Tools
          </h3>
          <div className="space-y-1">
            {research.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="rounded bg-sidebar-primary/20 px-2 py-0.5 text-xs font-semibold text-sidebar-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pipelines (chưa có route thật) */}
        <div>
          <h3 className="mb-3 px-2 text-xs font-semibold text-muted-foreground">
            Pipelines
          </h3>
          <div className="space-y-2">
            {pipelines.map((item) => (
              <div
                key={item.title}
                className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent/50"
              >
                <item.icon className="size-5 shrink-0 text-sidebar-primary" />
                <span className="flex-1 text-sm font-medium text-sidebar-foreground">
                  {item.title}
                </span>
                <span className="rounded bg-sidebar-primary/20 px-2 py-0.5 text-xs font-semibold text-sidebar-primary">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-3 border-t border-sidebar-border p-3">
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50">
            <Settings className="size-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50">
            <LifeBuoy className="size-4" />
            <span className="text-sm font-medium">Support</span>
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {user?.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          <span className="text-sm font-medium">Sign out</span>
        </button>

        <ThemeToggle />
      </div>
    </aside>
  );
}
