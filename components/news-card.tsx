import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Clock, ExternalLink } from "lucide-react"

interface NewsItem {
  id: number
  headline: string
  source: string
  timestamp: string
  summary: string
  impact: "positive" | "negative" | "neutral"
  relevantStocks: string[]
}

interface NewsCardProps {
  news: NewsItem
  isCompact?: boolean
}

export function NewsCard({ news, isCompact = false }: NewsCardProps) {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={isCompact ? "pb-2" : ""}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className={`${isCompact ? "text-base" : "text-lg"} leading-tight`}>{news.headline}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{news.source}</span>
              <Clock className="h-3 w-3" />
              <span>{news.timestamp}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getImpactIcon(news.impact)}
            <Badge className={getImpactColor(news.impact)}>{news.impact}</Badge>
          </div>
        </div>
      </CardHeader>
      {!isCompact && (
        <CardContent>
          <p className="text-gray-600 mb-3">{news.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {news.relevantStocks.map((stock) => (
                <Badge key={stock} variant="outline" className="text-xs">
                  {stock}
                </Badge>
              ))}
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
