'use client'

import { Search, Settings, LifeBuoy, Briefcase, LayoutDashboard, Users, UploadCloud, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from './theme-toggle'
import { useDashboardStore } from '@/lib/dashboard-store'

export function CustomSidebar() {
  const { activeTab, setActiveTab } = useDashboardStore()

  const research = [
    { title: 'Overview', icon: LayoutDashboard, tab: 'overview' as const },
    { title: 'Candidates', icon: Users, tab: 'candidates' as const, badge: '9' },
    { title: 'Profile Intake', icon: UploadCloud, tab: 'intake' as const },
    { title: 'AI Analysis', icon: Sparkles, tab: 'analysis' as const },
  ]

  const pipelines = [
    { title: 'Backend Squad', icon: Briefcase, badge: '24' },
    { title: 'ML Platform', icon: Briefcase, badge: '16' },
    { title: 'Frontend Guild', icon: Briefcase, badge: '11' },
  ]

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <Search className="size-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-sidebar-foreground">Talentgraph</span>
            <span className="text-xs text-muted-foreground">Candidate Research</span>
          </div>
        </button>
      </div>

      {/* Research Tools */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">Research Tools</h3>
          <div className="space-y-1">
            {research.map((item) => (
              <button
                key={item.title}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground ${
                  activeTab === item.tab
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="size-4 flex-shrink-0" />
                <span className="text-sm font-medium flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <span className="text-xs font-semibold bg-sidebar-primary/20 text-sidebar-primary px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pipelines */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">Pipelines</h3>
          <div className="space-y-2">
            {pipelines.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer group"
              >
                <item.icon className="size-5 flex-shrink-0 text-sidebar-primary" />
                <span className="text-sm font-medium text-sidebar-foreground flex-1">{item.title}</span>
                <span className="text-xs font-semibold text-sidebar-primary bg-sidebar-primary/20 px-2 py-0.5 rounded">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-3">
        {/* Settings & Support */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground">
            <Settings className="size-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground">
            <LifeBuoy className="size-4" />
            <span className="text-sm font-medium">Support</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
          <Avatar className="size-8 flex-shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
              RK
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground">Riya Kapoor</p>
            <p className="text-xs text-muted-foreground truncate">Lead Recruiter</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
