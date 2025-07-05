import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface AIAnalysisRequest {
  portfolio: {
    symbol: string
    quantity: number
    avgPrice: number
  }[]
  news: {
    headline: string
    summary: string
    sentiment: string
    relevantStocks: string[]
  }[]
}

export interface AIAnalysisResponse {
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

export class AIService {
  private static instance: AIService
  private apiKey: string

  private constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ""
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async analyzePortfolioImpact(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.apiKey) {
      // Return mock data if no API key is provided
      return this.getMockAnalysis(request)
    }

    try {
      const prompt = this.buildAnalysisPrompt(request)

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: prompt,
        temperature: 0.3,
        maxTokens: 2000,
      })

      return this.parseAIResponse(text, request)
    } catch (error) {
      console.error("Error calling OpenAI API:", error)
      // Fallback to mock data
      return this.getMockAnalysis(request)
    }
  }

  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const portfolioSummary = request.portfolio
      .map((stock) => `${stock.symbol}: ${stock.quantity} shares at ₹${stock.avgPrice} avg price`)
      .join(", ")

    const newsSummary = request.news
      .map((news) => `- ${news.headline} (${news.sentiment}, affects: ${news.relevantStocks.join(", ")})`)
      .join("\n")

    return `
As a financial analyst specializing in Indian stock markets, analyze the following portfolio and recent news to provide investment insights.

PORTFOLIO:
${portfolioSummary}

RECENT NEWS:
${newsSummary}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallSentiment": "positive|negative|neutral",
  "confidenceScore": 0-100,
  "keyInsights": ["insight1", "insight2", "insight3"],
  "stockAnalysis": [
    {
      "symbol": "STOCK_SYMBOL",
      "impact": "positive|negative|neutral",
      "reasoning": "detailed reasoning",
      "confidenceScore": 0-100
    }
  ],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Focus on:
1. How the news specifically impacts each stock in the portfolio
2. Overall market sentiment and its effect on the portfolio
3. Actionable recommendations for portfolio management
4. Risk assessment and opportunities

Provide realistic confidence scores based on the strength of the news impact and market conditions.
`
  }

  private parseAIResponse(response: string, request: AIAnalysisRequest): AIAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Validate and sanitize the response
        return {
          overallSentiment: this.validateSentiment(parsed.overallSentiment),
          confidenceScore: Math.max(0, Math.min(100, parsed.confidenceScore || 50)),
          keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights.slice(0, 5) : [],
          stockAnalysis: this.validateStockAnalysis(parsed.stockAnalysis, request.portfolio),
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : [],
        }
      }
    } catch (error) {
      console.error("Error parsing AI response:", error)
    }

    // Fallback to mock data if parsing fails
    return this.getMockAnalysis(request)
  }

  private validateSentiment(sentiment: any): "positive" | "negative" | "neutral" {
    if (["positive", "negative", "neutral"].includes(sentiment)) {
      return sentiment
    }
    return "neutral"
  }

  private validateStockAnalysis(analysis: any, portfolio: any[]): AIAnalysisResponse["stockAnalysis"] {
    if (!Array.isArray(analysis)) {
      return []
    }

    return analysis
      .filter((item) => item.symbol && portfolio.some((p) => p.symbol === item.symbol))
      .map((item) => ({
        symbol: item.symbol,
        impact: this.validateSentiment(item.impact),
        reasoning: typeof item.reasoning === "string" ? item.reasoning : "No specific analysis available",
        confidenceScore: Math.max(0, Math.min(100, item.confidenceScore || 50)),
      }))
  }

  private getMockAnalysis(request: AIAnalysisRequest): AIAnalysisResponse {
    // Generate realistic mock analysis based on the actual data
    const portfolioStocks = request.portfolio.map((p) => p.symbol)
    const relevantNews = request.news.filter((news) =>
      news.relevantStocks.some((stock) => portfolioStocks.includes(stock)),
    )

    const positiveNews = relevantNews.filter((n) => n.sentiment === "positive").length
    const negativeNews = relevantNews.filter((n) => n.sentiment === "negative").length

    let overallSentiment: "positive" | "negative" | "neutral" = "neutral"
    if (positiveNews > negativeNews) {
      overallSentiment = "positive"
    } else if (negativeNews > positiveNews) {
      overallSentiment = "negative"
    }

    const confidenceScore = Math.min(90, 50 + relevantNews.length * 5)

    const stockAnalysis = request.portfolio.map((stock) => {
      const stockNews = relevantNews.filter((news) => news.relevantStocks.includes(stock.symbol))
      const stockPositive = stockNews.filter((n) => n.sentiment === "positive").length
      const stockNegative = stockNews.filter((n) => n.sentiment === "negative").length

      let impact: "positive" | "negative" | "neutral" = "neutral"
      let reasoning = "No significant news impact detected for this stock"

      if (stockPositive > stockNegative) {
        impact = "positive"
        reasoning = "Recent positive news developments support potential upward movement"
      } else if (stockNegative > stockPositive) {
        impact = "negative"
        reasoning = "Negative news sentiment may create short-term pressure on the stock"
      }

      return {
        symbol: stock.symbol,
        impact,
        reasoning,
        confidenceScore: stockNews.length > 0 ? Math.min(85, 60 + stockNews.length * 10) : 50,
      }
    })

    return {
      overallSentiment,
      confidenceScore,
      keyInsights: [
        `Portfolio has ${relevantNews.length} relevant news items affecting holdings`,
        `${positiveNews} positive and ${negativeNews} negative news items identified`,
        `Market sentiment appears ${overallSentiment} based on recent developments`,
        "Diversification across sectors provides balanced risk exposure",
      ],
      stockAnalysis,
      recommendations: [
        overallSentiment === "positive"
          ? "Consider holding current positions to benefit from positive momentum"
          : "Monitor positions closely for any significant changes",
        "Maintain stop-loss orders to protect against unexpected volatility",
        "Review portfolio allocation quarterly to ensure optimal diversification",
        "Stay updated with sector-specific news for better decision making",
      ],
    }
  }

  async generateMarketSummary(news: any[]): Promise<string> {
    if (!this.apiKey) {
      return this.getMockMarketSummary(news)
    }

    try {
      const prompt = `
Analyze the following Indian stock market news and provide a brief market summary (2-3 sentences):

${news.map((item) => `- ${item.headline}`).join("\n")}

Focus on overall market trends, sector performance, and key themes.
`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: prompt,
        temperature: 0.3,
        maxTokens: 200,
      })

      return text.trim()
    } catch (error) {
      console.error("Error generating market summary:", error)
      return this.getMockMarketSummary(news)
    }
  }

  private getMockMarketSummary(news: any[]): string {
    const positiveCount = news.filter((n) => n.sentiment === "positive").length
    const negativeCount = news.filter((n) => n.sentiment === "negative").length

    if (positiveCount > negativeCount) {
      return "Indian markets are showing positive momentum with strong performance across key sectors. IT and banking stocks are leading the rally with robust quarterly results."
    } else if (negativeCount > positiveCount) {
      return "Market sentiment remains cautious amid mixed earnings and global uncertainties. Investors are closely watching policy developments and sector-specific challenges."
    } else {
      return "Markets are trading in a range with mixed signals from different sectors. Selective stock picking based on fundamentals remains key in the current environment."
    }
  }
}
