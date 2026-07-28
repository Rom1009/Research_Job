"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobResponse } from "@/lib/api";

export type SortKey = "score" | "date" | "company";

export interface FilterState {
  search: string;
  scoreRange: [number, number];
  companies: Set<string>;
  sortBy: SortKey;
}

export const DEFAULT_FILTER: FilterState = {
  search: "",
  scoreRange: [0, 100],
  companies: new Set(),
  sortBy: "score",
};

interface Props {
  jobs: JobResponse[];
  filter: FilterState;
  onChange: (f: FilterState) => void;
}

export function JobFilterBar({ jobs, filter, onChange }: Props) {
  const companies = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((j) => j.company).filter(Boolean)),
      ) as string[],
    [jobs],
  );

  const filterCount =
    filter.companies.size +
    (filter.scoreRange[0] > 0 || filter.scoreRange[1] < 100 ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-48">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          className="pl-9"
          value={filter.search}
          onChange={(e) => onChange({ ...filter, search: e.target.value })}
        />
      </div>

      <Select
        value={filter.sortBy}
        onValueChange={(v) => onChange({ ...filter, sortBy: v as SortKey })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score">Highest match</SelectItem>
          <SelectItem value="date">Newest</SelectItem>
          <SelectItem value="company">Company A-Z</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger
          render={<Button variant="outline" className="gap-1.5" />}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {filterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
              {filterCount}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">
              Score range: {filter.scoreRange[0]} - {filter.scoreRange[1]}
            </label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={filter.scoreRange}
              onValueChange={(v) =>
                onChange({ ...filter, scoreRange: v as [number, number] })
              }
            />
          </div>

          {companies.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold">Companies</label>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {companies.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={filter.companies.has(c)}
                      onCheckedChange={(v) => {
                        const next = new Set(filter.companies);
                        if (v) next.add(c);
                        else next.delete(c);
                        onChange({ ...filter, companies: next });
                      }}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onChange(DEFAULT_FILTER)}
          >
            Clear all filters
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Helper để filter + sort jobs
export function applyFilter(
  jobs: JobResponse[],
  scores: Record<string, number>,
  f: FilterState,
): JobResponse[] {
  return jobs
    .filter((j) => {
      const q = f.search.toLowerCase();
      if (q) {
        const hay = `${j.title} ${j.company} ${j.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const score = scores[j.job_id] ?? 0;
      if (score < f.scoreRange[0] || score > f.scoreRange[1]) return false;
      if (f.companies.size > 0 && !f.companies.has(j.company ?? ""))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (f.sortBy === "score")
        return (scores[b.job_id] ?? 0) - (scores[a.job_id] ?? 0);
      if (f.sortBy === "company")
        return (a.company ?? "").localeCompare(b.company ?? "");
      return 0;
    });
}
