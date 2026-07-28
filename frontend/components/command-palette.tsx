"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Home,
  User as UserIcon,
  Briefcase,
  Sparkles,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (path: string) => {
    router.push(path);
    setOpen(false);
    setSearch("");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    setOpen(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-24 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b px-3">
          <Search className="size-4 text-muted-foreground" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent p-3 outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="ml-2 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="p-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="mb-2">
            <Item
              onSelect={() => go("/dashboard")}
              icon={<Home className="size-4" />}
            >
              Home
            </Item>
            <Item
              onSelect={() => go("/dashboard/my-profile")}
              icon={<UserIcon className="size-4" />}
            >
              My Profile
            </Item>
            <Item
              onSelect={() => go("/dashboard/jobs")}
              icon={<Briefcase className="size-4" />}
            >
              Job Matches
            </Item>
            <Item
              onSelect={() => go("/dashboard/ai-analysis")}
              icon={<Sparkles className="size-4" />}
            >
              AI Analysis
            </Item>
          </Command.Group>

          <Command.Group heading="Settings">
            <Item
              onSelect={() => go("/dashboard/settings")}
              icon={<Settings className="size-4" />}
            >
              Settings
            </Item>
            <Item onSelect={handleLogout} icon={<LogOut className="size-4" />}>
              Sign out
            </Item>
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between border-t px-3 py-2 text-[10px] text-muted-foreground">
          <span>Press Cmd+K anywhere</span>
          <span>↑↓ to navigate · ↵ to select</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

function Item({
  children,
  icon,
  onSelect,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm aria-selected:bg-muted"
    >
      {icon}
      {children}
    </Command.Item>
  );
}
