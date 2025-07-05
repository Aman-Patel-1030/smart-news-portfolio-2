import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewsCard } from "@/components/news-card"
import { Filter, AlertCircle } from "lucide-react"

interface NewsItem {
  id: number
  headline: string
  source: string
  timestamp: string
  summary: string
  impact: "positive" | "negative" | "neutral"
  relevantStocks: string[]
}

interface FilteredNewsProps {
  filteredNews: NewsItem[]
  portfolioStocks: string[]
}

export function FilteredNews({ filteredNews, portfolioStocks }: FilteredNewsProps) {
  const positiveNews = filteredNews.filter((news) => news.impact === "positive")
  const negativeNews = filteredNews.filter((news) => news.impact === "negative")
  const neutralNews = filteredNews.filter((news) => news.impact === "neutral")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Portfolio-Filtered News
        </CardTitle>
        <CardDescription>News specifically relevant to your holdings: {portfolioStocks.join(", ")}</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredNews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No portfolio-specific news found.</p>
            <p className="text-sm">Add more stocks to your portfolio to see relevant news.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Impact Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{positiveNews.length}</div>
                <div className="text-sm text-gray-600">Positive</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{negativeNews.length}</div>
                <div className="text-sm text-gray-600">Negative</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{neutralNews.length}</div>
                <div className="text-sm text-gray-600">Neutral</div>
              </div>
            </div>

            {/* Filtered News List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Relevant News Articles</h3>
              {filteredNews.map((news) => (
                <div key={news.id} className="relative">
                  <NewsCard news={news} />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      Portfolio Match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
