import { type NextRequest, NextResponse } from "next/server"
import { PortfolioService } from "@/lib/portfolio-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const portfolioService = PortfolioService.getInstance()
    const results = portfolioService.searchStocks(query)

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error("Error searching stocks:", error)
    return NextResponse.json({ error: "Failed to search stocks" }, { status: 500 })
  }
}
