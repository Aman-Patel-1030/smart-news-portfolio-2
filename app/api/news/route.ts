import { type NextRequest, NextResponse } from "next/server"
import { NewsScraperService } from "@/lib/news-scraper"
import { DatabaseService } from "@/lib/database"

// Mock news data - in real implementation, this would scrape from actual sources
const mockNews = [
  {
    id: 1,
    headline: "Sensex surges 500 points as IT stocks rally on strong Q3 results",
    source: "Economic Times",
    timestamp: "2 hours ago",
    summary:
      "Indian benchmark indices closed higher led by IT and banking stocks after strong quarterly results from major companies.",
    impact: "positive",
    relevantStocks: ["TCS", "INFY", "WIPRO", "HDFCBANK", "ICICIBANK"],
  },
  {
    id: 2,
    headline: "RBI maintains repo rate at 6.5%, signals cautious approach",
    source: "Moneycontrol",
    timestamp: "4 hours ago",
    summary:
      "Reserve Bank of India keeps key interest rates unchanged while maintaining a cautious stance on inflation.",
    impact: "neutral",
    relevantStocks: ["HDFCBANK", "ICICIBANK", "SBIN"],
  },
  {
    id: 3,
    headline: "Reliance Industries announces major expansion in renewable energy",
    source: "Business Standard",
    timestamp: "6 hours ago",
    summary: "RIL commits ₹75,000 crore investment in green energy projects over the next 5 years.",
    impact: "positive",
    relevantStocks: ["RELIANCE"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const scraper = new NewsScraperService()
    let news

    if (source === "database") {
      // Get news from database
      news = await DatabaseService.getLatestNews(limit)
    } else {
      // Scrape fresh news
      switch (source) {
        case "moneycontrol":
          news = await scraper.scrapeMoneycontrol()
          break
        case "economictimes":
          news = await scraper.scrapeEconomicTimes()
          break
        case "businessstandard":
          news = await scraper.scrapeBusinessStandard()
          break
        default:
          news = await scraper.scrapeAllSources()
      }

      // Store scraped news in database
      for (const article of news) {
        try {
          const insertedArticle = await DatabaseService.insertNewsArticle({
            headline: article.headline,
            summary: article.summary,
            source: article.source,
            url: article.url,
            published_at: article.publishedAt.toISOString(),
            sentiment: article.sentiment,
            impact_score: article.impactScore,
          })

          // Insert stock relevance data
          for (const stock of article.relevantStocks) {
            await DatabaseService.insertNewsStockRelevance(
              insertedArticle.id,
              stock,
              0.8, // Default relevance score
            )
          }
        } catch (error) {
          console.error("Error storing news article:", error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json(
      { error: "Failed to fetch news", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "scrape") {
      // Trigger manual news scraping
      const scraper = new NewsScraperService()
      const news = await scraper.scrapeAllSources()

      return NextResponse.json({
        success: true,
        message: `Scraped ${news.length} articles`,
        data: news,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in news POST endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
