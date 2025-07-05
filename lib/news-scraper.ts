import * as cheerio from "cheerio"

export interface ScrapedNews {
  headline: string
  summary: string
  source: string
  url: string
  publishedAt: Date
  sentiment: "positive" | "negative" | "neutral"
  relevantStocks: string[]
  impactScore: number
}

export class NewsScraperService {
  private stockMapping = {
    TCS: ["TCS", "Tata Consultancy", "Tata Consultancy Services"],
    RELIANCE: ["Reliance", "RIL", "Reliance Industries"],
    HDFCBANK: ["HDFC Bank", "HDFC", "Housing Development Finance Corporation"],
    INFY: ["Infosys", "INFY"],
    ICICIBANK: ["ICICI Bank", "ICICI"],
    SBIN: ["SBI", "State Bank", "State Bank of India"],
    WIPRO: ["Wipro"],
    MARUTI: ["Maruti", "Maruti Suzuki"],
    SUNPHARMA: ["Sun Pharma", "Sun Pharmaceutical"],
    TATAMOTORS: ["Tata Motors"],
    BHARTIARTL: ["Bharti Airtel", "Airtel"],
    HCLTECH: ["HCL Technologies", "HCL Tech"],
    ASIANPAINT: ["Asian Paints"],
    KOTAKBANK: ["Kotak Mahindra Bank", "Kotak Bank"],
    LT: ["Larsen & Toubro", "L&T"],
  }

  private headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  }

  async scrapeMoneycontrol(): Promise<ScrapedNews[]> {
    try {
      const response = await fetch("https://www.moneycontrol.com/news/business/", {
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      const news: ScrapedNews[] = []

      $(".news_common").each((index, element) => {
        if (index >= 10) return false // Limit to 10 articles

        const $element = $(element)
        const headline = $element.find("h2 a").text().trim()
        const url = $element.find("h2 a").attr("href") || ""
        const summary = $element.find("p").first().text().trim()
        const timeText = $element.find(".ago").text().trim()

        if (headline && url) {
          const relevantStocks = this.extractStockSymbols(headline + " " + summary)
          const sentiment = this.analyzeSentiment(headline + " " + summary)
          const impactScore = this.calculateImpactScore(sentiment, relevantStocks.length)

          news.push({
            headline,
            summary: summary || headline,
            source: "Moneycontrol",
            url: url.startsWith("http") ? url : `https://www.moneycontrol.com${url}`,
            publishedAt: this.parseTimeText(timeText),
            sentiment,
            relevantStocks,
            impactScore,
          })
        }
      })

      return news
    } catch (error) {
      console.error("Error scraping Moneycontrol:", error)
      return []
    }
  }

  async scrapeEconomicTimes(): Promise<ScrapedNews[]> {
    try {
      const response = await fetch("https://economictimes.indiatimes.com/markets", {
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      const news: ScrapedNews[] = []

      $(".eachStory").each((index, element) => {
        if (index >= 10) return false // Limit to 10 articles

        const $element = $(element)
        const headline = $element.find("h3 a").text().trim()
        const url = $element.find("h3 a").attr("href") || ""
        const summary = $element.find("p").first().text().trim()

        if (headline && url) {
          const relevantStocks = this.extractStockSymbols(headline + " " + summary)
          const sentiment = this.analyzeSentiment(headline + " " + summary)
          const impactScore = this.calculateImpactScore(sentiment, relevantStocks.length)

          news.push({
            headline,
            summary: summary || headline,
            source: "Economic Times",
            url: url.startsWith("http") ? url : `https://economictimes.indiatimes.com${url}`,
            publishedAt: new Date(), // ET doesn't always show timestamps
            sentiment,
            relevantStocks,
            impactScore,
          })
        }
      })

      return news
    } catch (error) {
      console.error("Error scraping Economic Times:", error)
      return []
    }
  }

  async scrapeBusinessStandard(): Promise<ScrapedNews[]> {
    try {
      const response = await fetch("https://www.business-standard.com/markets", {
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      const news: ScrapedNews[] = []

      $(".listingstyle").each((index, element) => {
        if (index >= 10) return false // Limit to 10 articles

        const $element = $(element)
        const headline = $element.find("h2 a").text().trim()
        const url = $element.find("h2 a").attr("href") || ""
        const summary = $element.find("p").first().text().trim()

        if (headline && url) {
          const relevantStocks = this.extractStockSymbols(headline + " " + summary)
          const sentiment = this.analyzeSentiment(headline + " " + summary)
          const impactScore = this.calculateImpactScore(sentiment, relevantStocks.length)

          news.push({
            headline,
            summary: summary || headline,
            source: "Business Standard",
            url: url.startsWith("http") ? url : `https://www.business-standard.com${url}`,
            publishedAt: new Date(),
            sentiment,
            relevantStocks,
            impactScore,
          })
        }
      })

      return news
    } catch (error) {
      console.error("Error scraping Business Standard:", error)
      return []
    }
  }

  async scrapeAllSources(): Promise<ScrapedNews[]> {
    const allNews: ScrapedNews[] = []

    try {
      // Scrape from all sources concurrently
      const [moneycontrolNews, etNews, bsNews] = await Promise.allSettled([
        this.scrapeMoneycontrol(),
        this.scrapeEconomicTimes(),
        this.scrapeBusinessStandard(),
      ])

      if (moneycontrolNews.status === "fulfilled") {
        allNews.push(...moneycontrolNews.value)
      }

      if (etNews.status === "fulfilled") {
        allNews.push(...etNews.value)
      }

      if (bsNews.status === "fulfilled") {
        allNews.push(...bsNews.value)
      }

      // Remove duplicates based on headline similarity
      const uniqueNews = this.removeDuplicates(allNews)

      // Sort by impact score and recency
      return uniqueNews.sort((a, b) => {
        const scoreA = a.impactScore + a.relevantStocks.length * 0.1
        const scoreB = b.impactScore + b.relevantStocks.length * 0.1
        return scoreB - scoreA
      })
    } catch (error) {
      console.error("Error scraping news from all sources:", error)
      return []
    }
  }

  private extractStockSymbols(text: string): string[] {
    const foundStocks: string[] = []
    const textUpper = text.toUpperCase()

    for (const [symbol, names] of Object.entries(this.stockMapping)) {
      for (const name of names) {
        if (textUpper.includes(name.toUpperCase())) {
          foundStocks.push(symbol)
          break
        }
      }
    }

    return [...new Set(foundStocks)] // Remove duplicates
  }

  private analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
    const positiveWords = [
      "surge",
      "rally",
      "gain",
      "rise",
      "up",
      "positive",
      "strong",
      "growth",
      "bullish",
      "optimistic",
      "boost",
      "soar",
      "jump",
      "climb",
      "advance",
      "outperform",
      "beat",
      "exceed",
      "record",
      "high",
      "profit",
      "revenue",
    ]

    const negativeWords = [
      "fall",
      "drop",
      "decline",
      "down",
      "negative",
      "weak",
      "loss",
      "crash",
      "bearish",
      "pessimistic",
      "plunge",
      "tumble",
      "slide",
      "slump",
      "retreat",
      "underperform",
      "miss",
      "disappoint",
      "low",
      "deficit",
      "concern",
      "worry",
    ]

    const textLower = text.toLowerCase()

    const positiveCount = positiveWords.filter((word) => textLower.includes(word)).length
    const negativeCount = negativeWords.filter((word) => textLower.includes(word)).length

    if (positiveCount > negativeCount) {
      return "positive"
    } else if (negativeCount > positiveCount) {
      return "negative"
    } else {
      return "neutral"
    }
  }

  private calculateImpactScore(sentiment: string, stockCount: number): number {
    let baseScore = 0.5

    switch (sentiment) {
      case "positive":
        baseScore = 0.7
        break
      case "negative":
        baseScore = 0.6
        break
      default:
        baseScore = 0.5
    }

    // Increase score based on number of relevant stocks
    const stockBonus = Math.min(stockCount * 0.1, 0.3)

    return Math.min(baseScore + stockBonus, 1.0)
  }

  private parseTimeText(timeText: string): Date {
    const now = new Date()

    if (timeText.includes("hour")) {
      const hours = Number.parseInt(timeText.match(/\d+/)?.[0] || "1")
      return new Date(now.getTime() - hours * 60 * 60 * 1000)
    } else if (timeText.includes("minute")) {
      const minutes = Number.parseInt(timeText.match(/\d+/)?.[0] || "1")
      return new Date(now.getTime() - minutes * 60 * 1000)
    } else if (timeText.includes("day")) {
      const days = Number.parseInt(timeText.match(/\d+/)?.[0] || "1")
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }

    return now
  }

  private removeDuplicates(news: ScrapedNews[]): ScrapedNews[] {
    const seen = new Set<string>()
    const unique: ScrapedNews[] = []

    for (const item of news) {
      // Create a simple hash of the headline
      const hash = item.headline
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 50)

      if (!seen.has(hash)) {
        seen.add(hash)
        unique.push(item)
      }
    }

    return unique
  }
}
