import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const notifications = await DatabaseService.getUserNotifications(Number.parseInt(userId), unreadOnly)

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, title, message, type, notificationId } = body

    switch (action) {
      case "create":
        if (!userId || !title || !message) {
          return NextResponse.json({ error: "User ID, title, and message are required" }, { status: 400 })
        }

        const notification = await DatabaseService.createNotification(userId, title, message, type || "info")

        return NextResponse.json({
          success: true,
          data: notification,
          message: "Notification created",
        })

      case "mark_read":
        if (!notificationId) {
          return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
        }

        await DatabaseService.markNotificationAsRead(notificationId)

        return NextResponse.json({
          success: true,
          message: "Notification marked as read",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in notifications POST endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
