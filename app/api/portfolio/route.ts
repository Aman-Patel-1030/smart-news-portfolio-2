import { type NextRequest, NextResponse } from "next/server"
import { PortfolioService } from "@/lib/portfolio-service"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const portfolioId = searchParams.get("portfolioId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const portfolioService = PortfolioService.getInstance()

    if (portfolioId) {
      // Get specific portfolio holdings
      const holdings = await DatabaseService.getPortfolioHoldings(Number.parseInt(portfolioId))
      const symbols = holdings.map((h) => h.stock_symbol)
      const prices = await portfolioService.getMultipleStockPrices(symbols)

      const portfolio = holdings.map((holding) => ({
        symbol: holding.stock_symbol,
        quantity: holding.quantity,
        avgPrice: holding.avg_price,
      }))

      const summary = portfolioService.calculatePortfolioSummary(portfolio, prices)

      return NextResponse.json({
        success: true,
        data: {
          holdings: portfolio,
          prices: Object.fromEntries(prices),
          summary,
        },
      })
    } else {
      // Get all portfolios for user
      const portfolios = await DatabaseService.getPortfoliosByUserId(Number.parseInt(userId))
      return NextResponse.json({
        success: true,
        data: portfolios,
      })
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, portfolioId, stock } = body

    const portfolioService = PortfolioService.getInstance()

    switch (action) {
      case "add_stock":
        if (!portfolioId || !stock) {
          return NextResponse.json({ error: "Portfolio ID and stock data are required" }, { status: 400 })
        }

        // Validate stock symbol
        if (!portfolioService.validateStock(stock.symbol)) {
          return NextResponse.json({ error: "Invalid stock symbol" }, { status: 400 })
        }

        const holding = await DatabaseService.addPortfolioHolding(
          portfolioId,
          stock.symbol.toUpperCase(),
          stock.quantity,
          stock.avgPrice,
        )

        return NextResponse.json({
          success: true,
          data: holding,
          message: "Stock added to portfolio",
        })

      case "remove_stock":
        if (!body.holdingId) {
          return NextResponse.json({ error: "Holding ID is required" }, { status: 400 })
        }

        await DatabaseService.removePortfolioHolding(body.holdingId)

        return NextResponse.json({
          success: true,
          message: "Stock removed from portfolio",
        })

      case "create_portfolio":
        if (!body.userId || !body.name) {
          return NextResponse.json({ error: "User ID and portfolio name are required" }, { status: 400 })
        }

        const portfolio = await DatabaseService.createPortfolio(body.userId, body.name)

        return NextResponse.json({
          success: true,
          data: portfolio,
          message: "Portfolio created successfully",
        })

      case "sync_broker":
        // Future implementation for broker sync
        return NextResponse.json({
          success: false,
          message: "Broker sync not implemented yet",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in portfolio POST endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
