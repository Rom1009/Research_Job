import { Users, Target, TrendingUp, CheckCircle2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { candidates } from "@/lib/candidates"

export function StatCards() {
  const total = candidates.length
  const qualified = candidates.filter((c) => c.score > 70).length
  const avg = Math.round(
    candidates.reduce((s, c) => s + c.score, 0) / total,
  )
  const shortlisted = candidates.filter(
    (c) => c.status === "Shortlisted" || c.status === "Contacted",
  ).length

  const stats = [
    {
      label: "Profiles researched",
      value: String(total),
      delta: "+3 this week",
      icon: Users,
    },
    {
      label: "Qualified (>70)",
      value: String(qualified),
      delta: `${Math.round((qualified / total) * 100)}% of pool`,
      icon: Target,
    },
    {
      label: "Average AI score",
      value: String(avg),
      delta: "+6 vs last month",
      icon: TrendingUp,
    },
    {
      label: "In outreach",
      value: String(shortlisted),
      delta: "2 awaiting reply",
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-start justify-between gap-3 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="font-mono text-3xl font-semibold tabular-nums">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">{s.delta}</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <s.icon className="size-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
