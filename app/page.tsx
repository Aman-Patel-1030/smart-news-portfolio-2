"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewsCard } from "@/components/news-card"
import { PortfolioManager } from "@/components/portfolio-manager"
import { AIInsights } from "@/components/ai-insights"
import { FilteredNews } from "@/components/filtered-news"
import { TrendingUp, Newspaper, Briefcase, Brain, Bell } from "lucide-react"

// Mock news data (simulating scraped news)
const mockGeneralNews = [
  {
    id: 1,
    headline: "Sensex surges 500 points as IT stocks rally on strong Q3 results",
    source: "Economic Times",
    timestamp: "2 hours ago",
    summary: "Indian benchmark indices closed higher led by IT and banking stocks...",
    impact: "positive",
    relevantStocks: ["TCS", "INFY", "WIPRO"],
  },
  {
    id: 2,
    headline: "RBI maintains repo rate at 6.5%, signals cautious approach",
    source: "Moneycontrol",
    timestamp: "4 hours ago",
    summary: "Reserve Bank of India keeps key interest rates unchanged...",
    impact: "neutral",
    relevantStocks: ["HDFCBANK", "ICICIBANK", "SBIN"],
  },
  {
    id: 3,
    headline: "Reliance Industries announces major expansion in renewable energy",
    source: "Business Standard",
    timestamp: "6 hours ago",
    summary: "RIL commits ₹75,000 crore investment in green energy projects...",
    impact: "positive",
    relevantStocks: ["RELIANCE"],
  },
  {
    id: 4,
    headline: "Auto sector faces headwinds as chip shortage continues",
    source: "Economic Times",
    timestamp: "8 hours ago",
    summary: "Major automakers report production delays due to semiconductor shortage...",
    impact: "negative",
    relevantStocks: ["MARUTI", "TATAMOTORS", "M&M"],
  },
  {
    id: 5,
    headline: "Pharma stocks gain on strong export demand and new drug approvals",
    source: "Moneycontrol",
    timestamp: "10 hours ago",
    summary: "Pharmaceutical companies see increased demand from international markets...",
    impact: "positive",
    relevantStocks: ["SUNPHARMA", "DRREDDY", "CIPLA"],
  },
]

export default function SmartNewsPortfolio() {
  const [portfolio, setPortfolio] = useState([
    { symbol: "TCS", quantity: 50, avgPrice: 3500 },
    { symbol: "RELIANCE", quantity: 25, avgPrice: 2800 },
    { symbol: "HDFCBANK", quantity: 30, avgPrice: 1650 },
    { symbol: "INFY", quantity: 40, avgPrice: 1450 },
  ])

  const [notifications, setNotifications] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const portfolioStocks = portfolio.map((stock) => stock.symbol)
  const filteredNews = mockGeneralNews.filter((news) =>
    news.relevantStocks.some((stock) => portfolioStocks.includes(stock)),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Smart News Portfolio Insights
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Automated stock market news curation with AI-powered portfolio impact analysis for Indian markets
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotifications(!notifications)}
              className="flex items-center gap-1"
            >
              <Bell className="h-4 w-4" />
              {notifications ? "Notifications On" : "Notifications Off"}
            </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              General News
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Portfolio Summary
                  </CardTitle>
                  <CardDescription>Your current holdings and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">₹4.2L</div>
                        <div className="text-sm text-gray-600">Total Value</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">+12.5%</div>
                        <div className="text-sm text-gray-600">Today's Change</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {portfolio.slice(0, 3).map((stock, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-green-600">+2.3%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Sentiment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Market Sentiment
                  </CardTitle>
                  <CardDescription>Overall market analysis based on latest news</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">Positive</div>
                      <div className="text-sm text-gray-600 mt-1">Market Sentiment</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Confidence Score</span>
                        <Badge variant="secondary">78%</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Strong IT sector performance and stable banking outlook driving positive sentiment
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Portfolio News */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio-Relevant News</CardTitle>
                <CardDescription>Latest news affecting your holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNews.slice(0, 3).map((news) => (
                    <NewsCard key={news.id} news={news} isCompact />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  General Market News
                </CardTitle>
                <CardDescription>Latest stock market news from Indian financial markets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockGeneralNews.map((news) => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioManager portfolio={portfolio} setPortfolio={setPortfolio} />
            <FilteredNews filteredNews={filteredNews} portfolioStocks={portfolioStocks} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AIInsights portfolio={portfolio} filteredNews={filteredNews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
