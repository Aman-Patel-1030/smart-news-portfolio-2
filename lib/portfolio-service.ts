export interface Stock {
  symbol: string
  quantity: number
  avgPrice: number
}

export interface StockPrice {
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  lastUpdated: Date
}

export interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalPnL: number
  totalPnLPercent: number
  dayChange: number
  dayChangePercent: number
}

export class PortfolioService {
  private static instance: PortfolioService
  private mockPrices: Map<string, StockPrice> = new Map()

  private constructor() {
    this.initializeMockPrices()
  }

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService()
    }
    return PortfolioService.instance
  }

  private initializeMockPrices() {
    // Initialize with realistic Indian stock prices
    const mockData = [
      { symbol: "TCS", currentPrice: 3650, change: 45, changePercent: 1.25 },
      { symbol: "RELIANCE", currentPrice: 2950, change: -25, changePercent: -0.84 },
      { symbol: "HDFCBANK", currentPrice: 1720, change: 15, changePercent: 0.88 },
      { symbol: "INFY", currentPrice: 1520, change: 35, changePercent: 2.36 },
      { symbol: "WIPRO", currentPrice: 420, change: -8, changePercent: -1.87 },
      { symbol: "SBIN", currentPrice: 580, change: 12, changePercent: 2.11 },
      { symbol: "ICICIBANK", currentPrice: 950, change: 8, changePercent: 0.85 },
      { symbol: "MARUTI", currentPrice: 10500, change: -150, changePercent: -1.41 },
      { symbol: "SUNPHARMA", currentPrice: 1180, change: 25, changePercent: 2.16 },
      { symbol: "TATAMOTORS", currentPrice: 720, change: -15, changePercent: -2.04 },
      { symbol: "BHARTIARTL", currentPrice: 850, change: 10, changePercent: 1.19 },
      { symbol: "HCLTECH", currentPrice: 1350, change: 20, changePercent: 1.5 },
      { symbol: "ASIANPAINT", currentPrice: 3200, change: -40, changePercent: -1.23 },
      { symbol: "KOTAKBANK", currentPrice: 1800, change: 18, changePercent: 1.01 },
      { symbol: "LT", currentPrice: 2400, change: 30, changePercent: 1.27 },
    ]

    mockData.forEach((data) => {
      this.mockPrices.set(data.symbol, {
        ...data,
        lastUpdated: new Date(),
      })
    })

    // Update prices periodically
    setInterval(() => {
      this.updateMockPrices()
    }, 30000) // Update every 30 seconds
  }

  private updateMockPrices() {
    this.mockPrices.forEach((price, symbol) => {
      // Simulate price changes (-2% to +2%)
      const changePercent = (Math.random() - 0.5) * 4
      const newPrice = price.currentPrice * (1 + changePercent / 100)
      const change = newPrice - price.currentPrice

      this.mockPrices.set(symbol, {
        symbol,
        currentPrice: Math.round(newPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        lastUpdated: new Date(),
      })
    })
  }

  async getStockPrice(symbol: string): Promise<StockPrice | null> {
    // In a real implementation, this would call a stock price API
    // For now, return mock data
    return this.mockPrices.get(symbol) || null
  }

  async getMultipleStockPrices(symbols: string[]): Promise<Map<string, StockPrice>> {
    const prices = new Map<string, StockPrice>()

    for (const symbol of symbols) {
      const price = await this.getStockPrice(symbol)
      if (price) {
        prices.set(symbol, price)
      }
    }

    return prices
  }

  calculatePortfolioSummary(portfolio: Stock[], prices: Map<string, StockPrice>): PortfolioSummary {
    let totalValue = 0
    let totalInvested = 0
    let dayChange = 0

    portfolio.forEach((stock) => {
      const price = prices.get(stock.symbol)
      if (price) {
        const invested = stock.quantity * stock.avgPrice
        const currentValue = stock.quantity * price.currentPrice
        const stockDayChange = stock.quantity * price.change

        totalInvested += invested
        totalValue += currentValue
        dayChange += stockDayChange
      }
    })

    const totalPnL = totalValue - totalInvested
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
    const dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      totalPnLPercent: Math.round(totalPnLPercent * 100) / 100,
      dayChange: Math.round(dayChange * 100) / 100,
      dayChangePercent: Math.round(dayChangePercent * 100) / 100,
    }
  }

  validateStock(symbol: string): boolean {
    // Basic validation for Indian stock symbols
    const validSymbols = Array.from(this.mockPrices.keys())
    return validSymbols.includes(symbol.toUpperCase())
  }

  searchStocks(query: string): string[] {
    const symbols = Array.from(this.mockPrices.keys())
    return symbols.filter((symbol) => symbol.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
  }

  // Broker API integration methods (for future implementation)
  async connectZerodhaKite(apiKey: string, accessToken: string): Promise<boolean> {
    // Implementation for Zerodha Kite Connect
    // This would use the actual Zerodha API
    console.log("Connecting to Zerodha Kite API...")
    return false // Not implemented yet
  }

  async connectGrowwAPI(credentials: any): Promise<boolean> {
    // Implementation for Groww API
    console.log("Connecting to Groww API...")
    return false // Not implemented yet
  }

  async syncPortfolioFromBroker(brokerId: string): Promise<Stock[]> {
    // This would sync portfolio from connected broker
    console.log(`Syncing portfolio from broker: ${brokerId}`)
    return [] // Not implemented yet
  }
}
