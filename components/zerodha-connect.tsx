"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface ZerodhaConnectProps {
  onPortfolioSync?: (portfolio: any[]) => void
}

export function ZerodhaConnect({ onPortfolioSync }: ZerodhaConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [requestToken, setRequestToken] = useState("")
  const [error, setError] = useState("")
  const [profile, setProfile] = useState<any>(null)

  const handleGetLoginUrl = async () => {
    try {
      setIsConnecting(true)
      setError("")

      const response = await fetch("/api/zerodha/auth?action=login_url")
      const data = await response.json()

      if (data.success) {
        // Open Zerodha login in new window
        window.open(data.loginUrl, "_blank", "width=800,height=600")

        // Show instructions
        setError("Please complete authentication in the new window and paste the request token below.")
      } else {
        setError(data.error || "Failed to get login URL")
      }
    } catch (err) {
      setError("Failed to connect to Zerodha")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleGenerateAccessToken = async () => {
    if (!requestToken.trim()) {
      setError("Please enter the request token")
      return
    }

    try {
      setIsConnecting(true)
      setError("")

      const response = await fetch("/api/zerodha/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_token",
          requestToken: requestToken.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAccessToken(data.accessToken)
        setIsConnected(true)

        // Fetch user profile
        await fetchProfile(data.accessToken)

        // Sync portfolio
        await syncPortfolio(data.accessToken)
      } else {
        setError(data.error || "Failed to generate access token")
      }
    } catch (err) {
      setError("Failed to generate access token")
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`/api/zerodha/portfolio?access_token=${token}&type=profile`)
      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err)
    }
  }

  const syncPortfolio = async (token: string) => {
    try {
      const response = await fetch(`/api/zerodha/portfolio?access_token=${token}&type=holdings`)
      const data = await response.json()

      if (data.success && onPortfolioSync) {
        onPortfolioSync(data.data.holdings)
      }
    } catch (err) {
      console.error("Failed to sync portfolio:", err)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAccessToken("")
    setRequestToken("")
    setProfile(null)
    setError("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/placeholder.svg?height=24&width=24" alt="Zerodha" className="w-6 h-6" />
          Zerodha Kite Connect
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Connect your Zerodha account to automatically sync your portfolio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <div className="space-y-4">
              <div>
                <Button onClick={handleGetLoginUrl} disabled={isConnecting} className="w-full flex items-center gap-2">
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Connect to Zerodha
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Request Token</label>
                <Input
                  placeholder="Paste request token from Zerodha redirect URL"
                  value={requestToken}
                  onChange={(e) => setRequestToken(e.target.value)}
                />
                <Button
                  onClick={handleGenerateAccessToken}
                  disabled={isConnecting || !requestToken.trim()}
                  className="w-full"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Generate Access Token
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Instructions:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Click "Connect to Zerodha" to open login page</li>
                  <li>Login with your Zerodha credentials</li>
                  <li>Copy the request token from the redirect URL</li>
                  <li>Paste it above and click "Generate Access Token"</li>
                </ol>
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Successfully Connected</div>
                {profile && (
                  <div className="text-sm text-green-600">
                    {profile.user_name} ({profile.user_id})
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => syncPortfolio(accessToken)} className="flex items-center gap-2">
                <Loader2 className="h-4 w-4" />
                Sync Portfolio
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}