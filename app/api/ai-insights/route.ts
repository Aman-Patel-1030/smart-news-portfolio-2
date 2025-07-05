import { type NextRequest, NextResponse } from "next/server"
import { AIService } from "@/lib/ai-service"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { portfolio, news, portfolioId } = body

    if (!portfolio || !Array.isArray(portfolio)) {
      return NextResponse.json({ error: "Portfolio data is required" }, { status: 400 })
    }

    const aiService = AIService.getInstance()

    // Generate AI insights
    const insights = await aiService.analyzePortfolioImpact({
      portfolio,
      news: news || [],
    })

    // Store insights in database if portfolioId is provided
    if (portfolioId) {
      try {
        const aiInsight = await DatabaseService.insertAIInsight({
          portfolio_id: portfolioId,
          overall_sentiment: insights.overallSentiment,
          confidence_score: insights.confidenceScore,
          key_insights: insights.keyInsights,
          recommendations: insights.recommendations,
        })

        // Store individual stock analysis
        for (const analysis of insights.stockAnalysis) {
          await DatabaseService.insertStockAnalysis({
            insight_id: aiInsight.id,
            stock_symbol: analysis.symbol,
            impact: analysis.impact,
            reasoning: analysis.reasoning,
            confidence_score: analysis.confidenceScore,
          })
        }
      } catch (dbError) {
        console.error("Error storing AI insights in database:", dbError)
        // Continue without storing in database
      }
    }

    return NextResponse.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating AI insights:", error)
    return NextResponse.json(
      { error: "Failed to generate AI insights", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get("portfolioId")

    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio ID is required" }, { status: 400 })
    }

    // Get latest AI insight from database
    const insight = await DatabaseService.getLatestAIInsight(Number.parseInt(portfolioId))

    if (!insight) {
      return NextResponse.json({
        success: false,
        message: "No AI insights found for this portfolio",
      })
    }

    // Get associated stock analysis
    const stockAnalysis = await DatabaseService.getStockAnalysisByInsightId(insight.id)

    const response = {
      overallSentiment: insight.overall_sentiment,
      confidenceScore: insight.confidence_score,
      keyInsights: insight.key_insights,
      recommendations: insight.recommendations,
      stockAnalysis: stockAnalysis.map((sa) => ({
        symbol: sa.stock_symbol,
        impact: sa.impact,
        reasoning: sa.reasoning,
        confidenceScore: sa.confidence_score,
      })),
      generatedAt: insight.generated_at,
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("Error fetching AI insights:", error)
    return NextResponse.json({ error: "Failed to fetch AI insights" }, { status: 500 })
  }
}
