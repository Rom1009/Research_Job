"use client"

import * as React from "react"
import { Search, ArrowUpDown, Filter } from "lucide-react"
import { GithubIcon, LinkedinIcon } from "@/components/dashboard/brand-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { candidates, type Candidate } from "@/lib/candidates"
import { cn } from "@/lib/utils"

const MIN_SCORE = 70

function scoreTone(score: number) {
  if (score >= 90) return "bg-chart-3/15 text-chart-3 border-chart-3/30"
  if (score >= 80) return "bg-chart-1/15 text-chart-1 border-chart-1/30"
  return "bg-chart-4/15 text-chart-4 border-chart-4/30"
}

const statusTone: Record<Candidate["status"], string> = {
  Shortlisted: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  Contacted: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  Reviewed: "bg-secondary text-secondary-foreground border-transparent",
  New: "bg-muted text-muted-foreground border-transparent",
}

type SortKey = "score" | "skillMatch" | "experience"

interface CandidatesTableProps {
  onSelectCandidate?: (candidate: Candidate) => void
}

export function CandidatesTable({ onSelectCandidate }: CandidatesTableProps = {}) {
  const [query, setQuery] = React.useState("")
  const [onlyQualified, setOnlyQualified] = React.useState(true)
  const [sortKey, setSortKey] = React.useState<SortKey>("score")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")

  const rows = React.useMemo(() => {
    let out = [...candidates]
    if (onlyQualified) out = out.filter((c) => c.score > MIN_SCORE)
    if (query.trim()) {
      const q = query.toLowerCase()
      out = out.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.topSkills.some((s) => s.toLowerCase().includes(q)),
      )
    }
    out.sort((a, b) =>
      sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey],
    )
    return out
  }, [query, onlyQualified, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Candidate Rankings</CardTitle>
            <CardDescription>
              AI-scored profiles from resume, Git, and LinkedIn signals.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, role, skill…"
                className="w-full pl-9 sm:w-56"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              variant={onlyQualified ? "default" : "outline"}
              onClick={() => setOnlyQualified((v) => !v)}
            >
              <Filter data-icon="inline-start" />
              {"Score > 70"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Candidate</TableHead>
                <TableHead className="hidden md:table-cell">Skills</TableHead>
                <TableHead>
                  <SortButton
                    label="Match"
                    active={sortKey === "skillMatch"}
                    dir={sortDir}
                    onClick={() => toggleSort("skillMatch")}
                  />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortButton
                    label="Exp."
                    active={sortKey === "experience"}
                    dir={sortDir}
                    onClick={() => toggleSort("experience")}
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="AI Score"
                    active={sortKey === "score"}
                    dir={sortDir}
                    onClick={() => toggleSort("score")}
                  />
                </TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right">Links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onSelectCandidate?.(c)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-secondary text-xs">
                          {c.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.title} · {c.location}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.topSkills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono tabular-nums">
                      {c.skillMatch}%
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-muted-foreground">
                      {c.experience} yrs
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-sm font-semibold tabular-nums",
                        scoreTone(c.score),
                      )}
                    >
                      {c.score}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant="outline"
                      className={cn(statusTone[c.status])}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`${c.name} GitHub`}
                            >
                              <GithubIcon />
                            </Button>
                          }
                        />
                        <TooltipContent>github.com/{c.github}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`${c.name} LinkedIn`}
                            >
                              <LinkedinIcon />
                            </Button>
                          }
                        />
                        <TooltipContent>
                          linkedin.com/in/{c.linkedin}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {rows.length} of {candidates.length} candidates
          {onlyQualified ? " · filtered to AI score above 70" : ""}
        </p>
      </CardContent>
    </Card>
  )
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: "asc" | "desc"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      <ArrowUpDown
        className={cn("size-3", active && dir === "asc" && "rotate-180")}
      />
    </button>
  )
}
