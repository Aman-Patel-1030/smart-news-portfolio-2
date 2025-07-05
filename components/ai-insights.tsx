"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react"

interface Stock {
  symbol: string
  quantity: number
  avgPrice: number
}

interface NewsItem {
  id: number
  headline: string
  source: string
  timestamp: string
  summary: string
  impact: "positive" | "negative" | "neutral"
  relevantStocks: string[]
}

interface AIInsightsProps {
  portfolio: Stock[]
  filteredNews: NewsItem[]
}

interface InsightData {
  overallSentiment: "positive" | "negative" | "neutral"
  confidenceScore: number
  keyInsights: string[]
  stockAnalysis: {
    symbol: string
    impact: "positive" | "negative" | "neutral"
    reasoning: string
    confidenceScore: number
  }[]
  recommendations: string[]
}

export function AIInsights({ portfolio, filteredNews }: AIInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock AI analysis (in real implementation, this would call OpenAI API)
  const generateInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock AI analysis based on portfolio and news
      const mockInsights: InsightData = {
        overallSentiment: "positive",
        confidenceScore: 78,
        keyInsights: [
          "IT sector showing strong momentum with positive Q3 results",
          "Banking sector remains stable despite rate concerns",
          "Energy sector benefiting from renewable energy investments",
          "Overall market sentiment is cautiously optimistic",
        ],
        stockAnalysis: portfolio.map((stock) => {
          const relevantNews = filteredNews.filter((news) => news.relevantStocks.includes(stock.symbol))

          let impact: "positive" | "negative" | "neutral" = "neutral"
          let reasoning = "No significant news impact detected"
          let confidenceScore = 50

          if (relevantNews.length > 0) {
            const positiveCount = relevantNews.filter((n) => n.impact === "positive").length
            const negativeCount = relevantNews.filter((n) => n.impact === "negative").length

            if (positiveCount > negativeCount) {
              impact = "positive"
              reasoning = "Recent positive news developments support upward momentum"
              confidenceScore = 75
            } else if (negativeCount > positiveCount) {
              impact = "negative"
              reasoning = "Negative news developments may create short-term pressure"
              confidenceScore = 70
            } else {
              impact = "neutral"
              reasoning = "Mixed news sentiment, likely to trade sideways"
              confidenceScore = 60
            }
          }

          return {
            symbol: stock.symbol,
            impact,
            reasoning,
            confidenceScore,
          }
        }),
        recommendations: [
          "Consider holding IT stocks for continued growth potential",
          "Monitor banking sector for any policy changes",
          "Diversify into renewable energy themes",
          "Maintain stop-losses for risk management",
        ],
      }

      setInsights(mockInsights)
    } catch (err) {
      setError("Failed to generate AI insights. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Portfolio Analysis
          </CardTitle>
          <CardDescription>Get intelligent insights on how current news might impact your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {!insights && !isLoading && (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">
                Generate AI-powered insights based on your portfolio and current market news
              </p>
              <Button onClick={generateInsights} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Generate AI Insights
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Analyzing your portfolio and market news...</p>
            </div>
          )}

          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {insights && (
            <div className="space-y-6">
              {/* Overall Sentiment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${getImpactColor(insights.overallSentiment)}`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getImpactIcon(insights.overallSentiment)}
                    <span className="text-2xl font-bold capitalize">{insights.overallSentiment}</span>
                  </div>
                  <div className="text-sm">Overall Portfolio Sentiment</div>
                </div>
                <div className="p-4 rounded-lg text-center bg-blue-100 text-blue-800">
                  <div className="text-2xl font-bold">{insights.confidenceScore}%</div>
                  <div className="text-sm">Confidence Score</div>
                </div>
              </div>

              {/* Key Insights */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Market Insights
                </h3>
                <div className="space-y-2">
                  {insights.keyInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock-wise Analysis */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Individual Stock Analysis</h3>
                <div className="space-y-3">
                  {insights.stockAnalysis.map((analysis, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{analysis.symbol}</span>
                          {getImpactIcon(analysis.impact)}
                          <Badge className={getImpactColor(analysis.impact)}>{analysis.impact}</Badge>
                        </div>
                        <Badge variant="outline">{analysis.confidenceScore}% confidence</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{analysis.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold mb-3">AI Recommendations</h3>
                <div className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refresh Button */}
              <div className="text-center">
                <Button
                  onClick={generateInsights}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
