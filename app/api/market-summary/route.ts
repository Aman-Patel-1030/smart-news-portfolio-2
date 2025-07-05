import { type NextRequest, NextResponse } from "next/server"
import { AIService } from "@/lib/ai-service"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const aiService = AIService.getInstance()

    // Get latest news for market summary
    const news = await DatabaseService.getLatestNews(10)

    // Generate market summary
    const summary = await aiService.generateMarketSummary(news)

    // Calculate market statistics
    const positiveNews = news.filter((n) => n.sentiment === "positive").length
    const negativeNews = news.filter((n) => n.sentiment === "negative").length
    const neutralNews = news.filter((n) => n.sentiment === "neutral").length

    const marketSentiment =
      positiveNews > negativeNews ? "positive" : negativeNews > positiveNews ? "negative" : "neutral"

    return NextResponse.json({
      success: true,
      data: {
        summary,
        sentiment: marketSentiment,
        statistics: {
          totalNews: news.length,
          positive: positiveNews,
          negative: negativeNews,
          neutral: neutralNews,
        },
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating market summary:", error)
    return NextResponse.json({ error: "Failed to generate market summary" }, { status: 500 })
  }
}
