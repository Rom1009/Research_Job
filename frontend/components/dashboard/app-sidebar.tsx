"use client"


import {
  LayoutDashboard,
  Users,
  UploadCloud,
  BarChart3,
  Sparkles,
  Search,
  Settings,
  LifeBuoy,
  Briefcase,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "./theme-toggle"
import { useDashboardStore } from "@/lib/dashboard-store"


const research = [
  { title: "Overview", icon: LayoutDashboard, tab: "overview" as const },
  { title: "Candidates", icon: Users, tab: "candidates" as const, badge: "9" },
  { title: "Profile Intake", icon: UploadCloud, tab: "intake" as const },
  { title: 'Job Scraping', icon: Briefcase, tab: 'jobs' as const },
  { title: "AI Analysis", icon: Sparkles, tab: "analysis" as const },
]


const pipelines = [
  { title: "Backend Squad", icon: Briefcase, badge: "24" },
  { title: "ML Platform", icon: Briefcase, badge: "16" },
  { title: "Frontend Guild", icon: Briefcase, badge: "11" },
]


export function AppSidebar() {
  const { activeTab, setActiveTab } = useDashboardStore()


  return (
    <Sidebar>
      <SidebarHeader>
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 px-2 py-3 hover:opacity-80 transition-opacity w-full"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search className="size-4" />
          </div>
          <div className="flex flex-col leading-tight text-left">
            <span className="text-sm font-semibold">Talentgraph</span>
            <span className="text-xs text-muted-foreground">
              Candidate Research
            </span>
          </div>
        </button>
      </SidebarHeader>


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Research Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {research.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <button
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.tab
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <item.icon className="size-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </button>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel>Pipelines</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pipelines.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LifeBuoy />
                  <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      <SidebarFooter>
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-lg p-2 flex-1">
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary text-xs">
                RK
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium">Riya Kapoor</span>
              <span className="truncate text-xs text-muted-foreground">
                Lead Recruiter
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
