import { type NextRequest, NextResponse } from "next/server"
import { ZerodhaService } from "@/lib/zerodha-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get("access_token")
    const dataType = searchParams.get("type") || "holdings"

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 })
    }

    const zerodhaConfig = {
      apiKey: process.env.ZERODHA_API_KEY!,
      apiSecret: process.env.ZERODHA_API_SECRET!,
      accessToken,
    }

    const zerodhaService = new ZerodhaService(zerodhaConfig)

    switch (dataType) {
      case "holdings":
        const holdings = await zerodhaService.getHoldings()
        const portfolio = zerodhaService.convertHoldingsToPortfolio(holdings)

        return NextResponse.json({
          success: true,
          data: {
            holdings: portfolio,
            rawData: holdings,
          },
        })

      case "positions":
        const positions = await zerodhaService.getPositions()

        return NextResponse.json({
          success: true,
          data: positions,
        })

      case "margins":
        const margins = await zerodhaService.getMargins()

        return NextResponse.json({
          success: true,
          data: margins,
        })

      case "profile":
        const profile = await zerodhaService.getProfile()

        return NextResponse.json({
          success: true,
          data: profile,
        })

      case "orders":
        const orders = await zerodhaService.getOrders()

        return NextResponse.json({
          success: true,
          data: orders,
        })

      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching Zerodha data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch data from Zerodha",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}