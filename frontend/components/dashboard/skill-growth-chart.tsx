"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface Point {
  date: string;
  skills: number;
  work: number;
  projects: number;
}

export function SkillGrowthChart({ data }: { data: Point[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skill growth over time</CardTitle>
        <CardDescription>Track how your profile evolves</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="skills"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Skills"
            />
            <Line
              type="monotone"
              dataKey="work"
              stroke="#10b981"
              strokeWidth={2}
              name="Work exp"
            />
            <Line
              type="monotone"
              dataKey="projects"
              stroke="#a855f7"
              strokeWidth={2}
              name="Projects"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
