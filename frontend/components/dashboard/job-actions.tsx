"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, EyeOff, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { jobApi, type JobAction } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ApplyStatus = JobAction["apply_status"];

const STATUS_COLORS: Record<ApplyStatus, string> = {
  not_applied: "",
  applied: "bg-blue-500/15 text-blue-600",
  interviewed: "bg-amber-500/15 text-amber-600",
  offered: "bg-emerald-500/15 text-emerald-600",
  rejected: "bg-red-500/15 text-red-600",
};

interface Props {
  jobId: string;
  initial?: {
    saved?: boolean;
    hidden?: boolean;
    apply_status?: ApplyStatus;
    notes?: string | null;
  };
  onHide?: (jobId: string) => void;
}

export function JobActions({ jobId, initial = {}, onHide }: Props) {
  const [saved, setSaved] = useState(initial.saved ?? false);
  const [status, setStatus] = useState<ApplyStatus>(
    initial.apply_status ?? "not_applied",
  );
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);
  const [hiding, setHiding] = useState(false);

  async function patch(update: Partial<JobAction>) {
    try {
      await jobApi.updateAction(jobId, update);
    } catch (e) {
      toast.error("Failed to save", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  async function handleHide() {
    setHiding(true);
    try {
      await jobApi.updateAction(jobId, { hidden: true });
      toast.success("Job hidden", {
        description: "You can restore it from the 'Hidden jobs' banner.",
      });
      onHide?.(jobId);
    } catch (e) {
      toast.error("Failed to hide job", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setHiding(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Save/Bookmark */}
      <Button
        size="icon"
        variant="ghost"
        aria-label={saved ? "Unsave job" : "Save job"}
        title={saved ? "Unsave" : "Save"}
        onClick={() => {
          const next = !saved;
          setSaved(next);
          patch({ saved: next });
        }}
      >
        <Bookmark
          className={cn("size-4", saved && "fill-primary text-primary")}
        />
      </Button>

      {/* Apply status */}
      <Select
        value={status}
        onValueChange={(v) => {
          const next = v as ApplyStatus;
          setStatus(next);
          patch({ apply_status: next });
        }}
      >
        <SelectTrigger
          className={cn("h-7 w-32 text-xs", STATUS_COLORS[status])}
          aria-label="Apply status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not_applied">Not applied</SelectItem>
          <SelectItem value="applied">Applied</SelectItem>
          <SelectItem value="interviewed">Interviewed</SelectItem>
          <SelectItem value="offered">Offered</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {/* Notes */}
      <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
        <SheetTrigger
          aria-label="Edit notes"
          title="Notes"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <FileText className="size-4" />
          {notes && (
            <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
          )}
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:!max-w-md p-6">
          <SheetHeader className="mb-4">
            <SheetTitle>Notes</SheetTitle>
          </SheetHeader>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes about this job..."
            rows={10}
            className="resize-none"
          />

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                patch({ notes });
                toast.success("Notes saved");
                setNotesOpen(false);
              }}
              className="flex-1"
            >
              Save
            </Button>
            <Button variant="ghost" onClick={() => setNotesOpen(false)}>
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Hide */}
      <Button
        size="icon"
        variant="ghost"
        aria-label="Hide job"
        title="Hide from list"
        onClick={handleHide}
        disabled={hiding}
      >
        <EyeOff className="size-4" />
      </Button>
    </div>
  );
}
