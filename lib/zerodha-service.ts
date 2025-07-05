import { KiteConnect } from "kiteconnect"

export interface ZerodhaConfig {
  apiKey: string
  apiSecret: string
  accessToken?: string
  requestToken?: string
}

export interface ZerodhaHolding {
  tradingsymbol: string
  exchange: string
  instrument_token: number
  isin: string
  product: string
  price: number
  quantity: number
  t1_quantity: number
  realised_quantity: number
  authorised_quantity: number
  authorised_date: string
  opening_quantity: number
  collateral_quantity: number
  collateral_type: string
  discrepancy: boolean
  average_price: number
  last_price: number
  close_price: number
  pnl: number
  day_change: number
  day_change_percentage: number
}

export interface ZerodhaPosition {
  tradingsymbol: string
  exchange: string
  instrument_token: number
  product: string
  quantity: number
  overnight_quantity: number
  multiplier: number
  average_price: number
  close_price: number
  last_price: number
  value: number
  pnl: number
  m2m: number
  unrealised: number
  realised: number
  buy_quantity: number
  buy_price: number
  buy_value: number
  sell_quantity: number
  sell_price: number
  sell_value: number
  day_buy_quantity: number
  day_buy_price: number
  day_buy_value: number
  day_sell_quantity: number
  day_sell_price: number
  day_sell_value: number
}

export class ZerodhaService {
  private kite: KiteConnect
  private config: ZerodhaConfig
  private isConnected = false

  constructor(config: ZerodhaConfig) {
    this.config = config
    this.kite = new KiteConnect({
      api_key: config.apiKey,
      debug: process.env.NODE_ENV === "development",
    })

    if (config.accessToken) {
      this.kite.setAccessToken(config.accessToken)
      this.isConnected = true
    }
  }

  getLoginUrl(): string {
    return this.kite.getLoginURL()
  }

  async generateAccessToken(requestToken: string): Promise<string> {
    try {
      const response = await this.kite.generateSession(requestToken, this.config.apiSecret)
      this.kite.setAccessToken(response.access_token)
      this.isConnected = true
      return response.access_token
    } catch (error: any) {
      console.error("Error generating access token:", error)
      throw new Error(error.message || "Failed to generate access token")
    }
  }

  async getProfile(): Promise<any> {
    this.ensureConnected("fetch user profile")
    try {
      return await this.kite.getProfile()
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      throw new Error(error.message || "Failed to fetch user profile")
    }
  }

  async getHoldings(): Promise<ZerodhaHolding[]> {
    this.ensureConnected("fetch holdings")
    try {
      return await this.kite.getHoldings()
    } catch (error: any) {
      console.error("Error fetching holdings:", error)
      throw new Error(error.message || "Failed to fetch holdings")
    }
  }

  async getPositions(): Promise<{ net: ZerodhaPosition[]; day: ZerodhaPosition[] }> {
    this.ensureConnected("fetch positions")
    try {
      return await this.kite.getPositions()
    } catch (error: any) {
      console.error("Error fetching positions:", error)
      throw new Error(error.message || "Failed to fetch positions")
    }
  }

  async getMargins(): Promise<any> {
    this.ensureConnected("fetch margins")
    try {
      return await this.kite.getMargins()
    } catch (error: any) {
      console.error("Error fetching margins:", error)
      throw new Error(error.message || "Failed to fetch margins")
    }
  }

  async getOrders(): Promise<any[]> {
    this.ensureConnected("fetch orders")
    try {
      return await this.kite.getOrders()
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      throw new Error(error.message || "Failed to fetch orders")
    }
  }

  async getTrades(): Promise<any[]> {
    this.ensureConnected("fetch trades")
    try {
      return await this.kite.getTrades()
    } catch (error: any) {
      console.error("Error fetching trades:", error)
      throw new Error(error.message || "Failed to fetch trades")
    }
  }

  async getQuote(instruments: string[]): Promise<any> {
    this.ensureConnected("fetch quotes")
    try {
      return await this.kite.getQuote(instruments)
    } catch (error: any) {
      console.error("Error fetching quotes:", error)
      throw new Error(error.message || "Failed to fetch quotes")
    }
  }

  async getLTP(instruments: string[]): Promise<any> {
    this.ensureConnected("fetch LTP")
    try {
      return await this.kite.getLTP(instruments)
    } catch (error: any) {
      console.error("Error fetching LTP:", error)
      throw new Error(error.message || "Failed to fetch LTP")
    }
  }

  convertHoldingsToPortfolio(holdings: ZerodhaHolding[]): any[] {
    return holdings.map((holding) => ({
      symbol: holding.tradingsymbol,
      quantity: holding.quantity,
      avgPrice: holding.average_price,
      currentPrice: holding.last_price,
      pnl: holding.pnl,
      dayChange: holding.day_change,
      dayChangePercent: holding.day_change_percentage,
      exchange: holding.exchange,
      isin: holding.isin,
    }))
  }

  isAuthenticated(): boolean {
    return this.isConnected
  }

  disconnect(): void {
    this.isConnected = false
    this.kite.setAccessToken("")
  }

  private ensureConnected(action: string): void {
    if (!this.isConnected) {
      throw new Error(`Not connected to Zerodha. Please authenticate first to ${action}.`)
    }
  }
}
