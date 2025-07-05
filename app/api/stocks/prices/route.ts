import { type NextRequest, NextResponse } from "next/server"
import { PortfolioService } from "@/lib/portfolio-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get("symbols")?.split(",") || []

    if (symbols.length === 0) {
      return NextResponse.json({ error: "Stock symbols are required" }, { status: 400 })
    }

    const portfolioService = PortfolioService.getInstance()
    const prices = await portfolioService.getMultipleStockPrices(symbols)

    return NextResponse.json({
      success: true,
      data: Object.fromEntries(prices),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching stock prices:", error)
    return NextResponse.json({ error: "Failed to fetch stock prices" }, { status: 500 })
  }
}
