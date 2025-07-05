import { neon } from "@neondatabase/serverless"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: number
  user_id: number
  name: string
  created_at: string
  updated_at: string
}

export interface PortfolioHolding {
  id: number
  portfolio_id: number
  stock_symbol: string
  quantity: number
  avg_price: number
  created_at: string
  updated_at: string
}

export interface NewsArticle {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  published_at: string
  scraped_at: string
  sentiment: "positive" | "negative" | "neutral"
  impact_score: number
}

export interface NewsStockRelevance {
  id: number
  news_id: number
  stock_symbol: string
  relevance_score: number
}

export interface AIInsight {
  id: number
  portfolio_id: number
  overall_sentiment: "positive" | "negative" | "neutral"
  confidence_score: number
  key_insights: string[]
  recommendations: string[]
  generated_at: string
}

export interface StockAnalysis {
  id: number
  insight_id: number
  stock_symbol: string
  impact: "positive" | "negative" | "neutral"
  reasoning: string
  confidence_score: number
}

export interface UserNotification {
  id: number
  user_id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

// Database operations
export class DatabaseService {
  // User operations
  static async createUser(email: string, name: string): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, name)
      VALUES (${email}, ${name})
      RETURNING *
    `
    return result[0] as User
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return (result[0] as User) || null
  }

  // Portfolio operations
  static async createPortfolio(userId: number, name: string): Promise<Portfolio> {
    const result = await sql`
      INSERT INTO portfolios (user_id, name)
      VALUES (${userId}, ${name})
      RETURNING *
    `
    return result[0] as Portfolio
  }

  static async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    const result = await sql`
      SELECT * FROM portfolios WHERE user_id = ${userId}
    `
    return result as Portfolio[]
  }

  static async getPortfolioHoldings(portfolioId: number): Promise<PortfolioHolding[]> {
    const result = await sql`
      SELECT * FROM portfolio_holdings WHERE portfolio_id = ${portfolioId}
    `
    return result as PortfolioHolding[]
  }

  static async addPortfolioHolding(
    portfolioId: number,
    stockSymbol: string,
    quantity: number,
    avgPrice: number,
  ): Promise<PortfolioHolding> {
    const result = await sql`
      INSERT INTO portfolio_holdings (portfolio_id, stock_symbol, quantity, avg_price)
      VALUES (${portfolioId}, ${stockSymbol}, ${quantity}, ${avgPrice})
      RETURNING *
    `
    return result[0] as PortfolioHolding
  }

  static async removePortfolioHolding(holdingId: number): Promise<void> {
    await sql`
      DELETE FROM portfolio_holdings WHERE id = ${holdingId}
    `
  }

  // News operations
  static async getLatestNews(limit = 20): Promise<NewsArticle[]> {
    const result = await sql`
      SELECT * FROM news_articles 
      ORDER BY published_at DESC 
      LIMIT ${limit}
    `
    return result as NewsArticle[]
  }

  static async getNewsForStocks(stockSymbols: string[]): Promise<NewsArticle[]> {
    const result = await sql`
      SELECT DISTINCT n.* 
      FROM news_articles n
      JOIN news_stock_relevance nsr ON n.id = nsr.news_id
      WHERE nsr.stock_symbol = ANY(${stockSymbols})
      ORDER BY n.published_at DESC
    `
    return result as NewsArticle[]
  }

  static async insertNewsArticle(article: Omit<NewsArticle, "id" | "scraped_at">): Promise<NewsArticle> {
    const result = await sql`
      INSERT INTO news_articles (headline, summary, source, url, published_at, sentiment, impact_score)
      VALUES (${article.headline}, ${article.summary}, ${article.source}, ${article.url}, ${article.published_at}, ${article.sentiment}, ${article.impact_score})
      RETURNING *
    `
    return result[0] as NewsArticle
  }

  static async insertNewsStockRelevance(
    newsId: number,
    stockSymbol: string,
    relevanceScore: number,
  ): Promise<NewsStockRelevance> {
    const result = await sql`
      INSERT INTO news_stock_relevance (news_id, stock_symbol, relevance_score)
      VALUES (${newsId}, ${stockSymbol}, ${relevanceScore})
      RETURNING *
    `
    return result[0] as NewsStockRelevance
  }

  // AI Insights operations
  static async insertAIInsight(insight: Omit<AIInsight, "id" | "generated_at">): Promise<AIInsight> {
    const result = await sql`
      INSERT INTO ai_insights (portfolio_id, overall_sentiment, confidence_score, key_insights, recommendations)
      VALUES (${insight.portfolio_id}, ${insight.overall_sentiment}, ${insight.confidence_score}, ${insight.key_insights}, ${insight.recommendations})
      RETURNING *
    `
    return result[0] as AIInsight
  }

  static async getLatestAIInsight(portfolioId: number): Promise<AIInsight | null> {
    const result = await sql`
      SELECT * FROM ai_insights 
      WHERE portfolio_id = ${portfolioId}
      ORDER BY generated_at DESC
      LIMIT 1
    `
    return (result[0] as AIInsight) || null
  }

  static async insertStockAnalysis(analysis: Omit<StockAnalysis, "id">): Promise<StockAnalysis> {
    const result = await sql`
      INSERT INTO stock_analysis (insight_id, stock_symbol, impact, reasoning, confidence_score)
      VALUES (${analysis.insight_id}, ${analysis.stock_symbol}, ${analysis.impact}, ${analysis.reasoning}, ${analysis.confidence_score})
      RETURNING *
    `
    return result[0] as StockAnalysis
  }

  static async getStockAnalysisByInsightId(insightId: number): Promise<StockAnalysis[]> {
    const result = await sql`
      SELECT * FROM stock_analysis WHERE insight_id = ${insightId}
    `
    return result as StockAnalysis[]
  }

  // Notification operations
  static async createNotification(
    userId: number,
    title: string,
    message: string,
    type = "info",
  ): Promise<UserNotification> {
    const result = await sql`
      INSERT INTO user_notifications (user_id, title, message, type)
      VALUES (${userId}, ${title}, ${message}, ${type})
      RETURNING *
    `
    return result[0] as UserNotification
  }

  static async getUserNotifications(userId: number, unreadOnly = false): Promise<UserNotification[]> {
    const whereClause = unreadOnly ? sql`WHERE user_id = ${userId} AND is_read = false` : sql`WHERE user_id = ${userId}`

    const result = await sql`
      SELECT * FROM user_notifications 
      ${whereClause}
      ORDER BY created_at DESC
    `
    return result as UserNotification[]
  }

  static async markNotificationAsRead(notificationId: number): Promise<void> {
    await sql`
      UPDATE user_notifications 
      SET is_read = true 
      WHERE id = ${notificationId}
    `
  }
}

export { sql }
