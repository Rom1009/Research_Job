"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { authApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ThemeCustomizer } from "@/components/theme-customizer";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-4">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <PasswordSettings />
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeCustomizer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <DataSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────── Sub-components ─────────── */

function AccountSettings() {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input value={user?.email ?? ""} disabled />
        </Field>
        <Field>
          <FieldLabel>Full name</FieldLabel>
          <Input defaultValue={user?.name ?? ""} />
        </Field>
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Input value={user?.role ?? ""} disabled />
        </Field>
        <Button>Save changes</Button>
      </CardContent>
    </Card>
  );
}

function PasswordSettings() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (next !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (next.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      toast.success("Password changed successfully");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      toast.error("Failed to change password", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change password</CardTitle>
        <CardDescription>
          Use a strong password you don't use elsewhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field>
          <FieldLabel htmlFor="current-pw">Current password</FieldLabel>
          <Input
            id="current-pw"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            disabled={saving}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-pw">New password</FieldLabel>
          <Input
            id="new-pw"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            disabled={saving}
            minLength={6}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-pw">Confirm new password</FieldLabel>
          <Input
            id="confirm-pw"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={saving}
            minLength={6}
          />
        </Field>
        <Button onClick={submit} disabled={saving}>
          {saving ? <Spinner /> : "Update password"}
        </Button>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    weeklyDigest: true,
    scoringComplete: true,
    newMatches: false,
  });

  const update = (key: keyof typeof prefs, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    // TODO: call API save preferences
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Weekly digest email</p>
            <p className="text-xs text-muted-foreground">
              Top matches sent every Monday
            </p>
          </div>
          <Switch
            checked={prefs.weeklyDigest}
            onCheckedChange={(v) => update("weeklyDigest", v)}
          />
        </label>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Scoring completion</p>
            <p className="text-xs text-muted-foreground">
              Notify when scoring finishes
            </p>
          </div>
          <Switch
            checked={prefs.scoringComplete}
            onCheckedChange={(v) => update("scoringComplete", v)}
          />
        </label>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">New job matches</p>
            <p className="text-xs text-muted-foreground">
              Alert when jobs above 80% match found
            </p>
          </div>
          <Switch
            checked={prefs.newMatches}
            onCheckedChange={(v) => update("newMatches", v)}
          />
        </label>
      </CardContent>
    </Card>
  );
}

function DataSettings() {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure? This will permanently delete your account and all data.",
      )
    )
      return;
    setDeleting(true);
    // TODO: call delete API
    setDeleting(false);
  }

  async function handleExport() {
    toast.info("Preparing export...");
    // TODO: call export API and download JSON
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export data</CardTitle>
          <CardDescription>
            Download all your data as JSON (GDPR compliant)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport}>
            Export all my data
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account. Cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Spinner /> : "Delete account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
