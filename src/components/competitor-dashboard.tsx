"use client"

import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChart, PieChart, TrendingUp, Target } from "lucide-react"
import { GithubChart } from "@/components/github-chart"
// import { MetricsOverview } from "@/components/metrics-overview"
// import { MarketShareChart } from "@/components/market-share-chart"
// import { PerformanceMetrics } from "@/components/performance-metrics"

interface CompetitorData {
  name: string
  data: Array<{ date: string; count: number }>
  color: string
}

const sidebarItems = [
  { title: "Overview", icon: BarChart3, id: "overview" },
  { title: "Github Analysis", icon: LineChart, id: "github-analysis" },
  { title: "Market Share", icon: PieChart, id: "market-share" },
  { title: "Performance", icon: TrendingUp, id: "performance" },
]

export function CompetitorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [competitorData, setCompetitorData] = useState<CompetitorData[]>([])

  const loadCompetitorData = async () => {
    try {
      const response = await fetch('/api/competitors')
      if (!response.ok) {
        throw new Error('Failed to load competitor data')
      }
      const data = await response.json()
      setCompetitorData(data)
    } catch (error) {
      console.error("Error loading competitor data:", error)
    }
  }

  useEffect(() => {
    loadCompetitorData()
  }, [])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <Target className="h-6 w-6" />
              <span className="font-semibold">Competitor Analytics</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton onClick={() => setActiveTab(item.id)} isActive={activeTab === item.id}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold">Github Analysis Dashboard</h1>
                <p className="text-muted-foreground">Tracks the number of projects using the services on Github</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Last updated: {new Date().toLocaleDateString()}</Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="github-analysis">Github Analysis</TabsTrigger>
              <TabsTrigger value="market-share">Market Share</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* <MetricsOverview /> */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Competitor Comparison</CardTitle>
                    <CardDescription>Last 30 days performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GithubChart data={competitorData} height={300} />
                  </CardContent>
                </Card>
                {/* <MarketShareChart /> */}
              </div>
            </TabsContent>

            <TabsContent value="github-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Performance Over Time</CardTitle>
                  <CardDescription>
                    Tracks projects based on usage of service keys in the codebase (eg FAL_KEY environment variable)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GithubChart data={competitorData} height={400} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {competitorData.map((competitor, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: competitor.color }} />
                        {competitor.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {competitor.data[competitor.data.length - 1]?.count || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Latest count</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="market-share" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* <MarketShareChart /> */}
                <Card>
                  <CardHeader>
                    <CardTitle>Market Position</CardTitle>
                    <CardDescription>Current standings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {competitorData.map((competitor, index) => {
                      const latestCount = competitor.data[competitor.data.length - 1]?.count || 0
                      const totalMarket = competitorData.reduce(
                        (sum, comp) => sum + (comp.data[comp.data.length - 1]?.count || 0),
                        0,
                      )
                      const percentage = totalMarket > 0 ? ((latestCount / totalMarket) * 100).toFixed(1) : "0"

                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: competitor.color }} />
                            <span className="font-medium">{competitor.name}</span>
                          </div>
                          <Badge variant="outline">{percentage}%</Badge>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* <PerformanceMetrics /> */}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  )
}
