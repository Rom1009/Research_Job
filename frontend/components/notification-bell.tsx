"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  description?: string;
  read: boolean;
  link?: string;
  created_at: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const unread = items.filter((n) => !n.read).length;

  async function load() {
    try {
      const data = await apiFetch<Notification[]>("/notifications/?limit=20");
      setItems(data);
    } catch (e) {
      console.warn("Failed to load notifications:", e);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
    } catch {}
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
    } catch {}
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex size-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
        aria-label={`Notifications ${unread > 0 ? `(${unread} unread)` : ""}`}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            Notifications
          </span>
          {unread > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 gap-1 text-xs"
              onClick={markAllRead}
            >
              <CheckCheck className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto p-1">
          {items.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            items.map((n) => {
              const content = (
                <>
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {n.title}
                      </p>
                      {n.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.description}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              );

              const className = cn(
                "block rounded-md p-2 cursor-pointer transition-colors hover:bg-muted",
                !n.read && "bg-primary/[0.04]",
              );

              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  className={className}
                  onClick={() => markRead(n.id)}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={n.id}
                  className={className}
                  onClick={() => markRead(n.id)}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
