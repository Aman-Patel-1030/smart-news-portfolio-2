import { type NextRequest, NextResponse } from "next/server"
import { ZerodhaService } from "@/lib/zerodha-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    const zerodhaConfig = {
      apiKey: process.env.ZERODHA_API_KEY!,
      apiSecret: process.env.ZERODHA_API_SECRET!,
    }

    const zerodhaService = new ZerodhaService(zerodhaConfig)

    if (action === "login_url") {
      const loginUrl = zerodhaService.getLoginUrl()

      return NextResponse.json({
        success: true,
        loginUrl,
        message: "Redirect to this URL to authenticate with Zerodha",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in Zerodha auth:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestToken, action } = body

    const zerodhaConfig = {
      apiKey: process.env.ZERODHA_API_KEY!,
      apiSecret: process.env.ZERODHA_API_SECRET!,
    }

    const zerodhaService = new ZerodhaService(zerodhaConfig)

    if (action === "generate_token") {
      if (!requestToken) {
        return NextResponse.json({ error: "Request token is required" }, { status: 400 })
      }

      const accessToken = await zerodhaService.generateAccessToken(requestToken)

      // In production, you'd store this securely (database, encrypted cookies, etc.)
      return NextResponse.json({
        success: true,
        accessToken,
        message: "Access token generated successfully",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error generating access token:", error)
    return NextResponse.json({ error: "Failed to generate access token" }, { status: 500 })
  }
}