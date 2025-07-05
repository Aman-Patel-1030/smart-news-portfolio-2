"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZerodhaConnect } from "@/components/zerodha-connect"
import {
  Trash2,
  Plus,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Link,
} from "lucide-react"

interface Stock {
  symbol: string
  quantity: number
  avgPrice: number
}

interface PortfolioManagerProps {
  portfolio: Stock[]
  setPortfolio: (portfolio: Stock[]) => void
}

export function PortfolioManager({
  portfolio,
  setPortfolio,
}: PortfolioManagerProps) {
  const [newStock, setNewStock] = useState<{
    symbol: string
    quantity: string
    avgPrice: string
  }>({ symbol: "", quantity: "", avgPrice: "" })
  const [isAdding, setIsAdding] = useState(false)

  const getCurrentPrice = (symbol: string) => {
    const mockPrices: { [key: string]: number } = {
      TCS: 3650,
      RELIANCE: 2950,
      HDFCBANK: 1720,
      INFY: 1520,
      WIPRO: 420,
      SBIN: 580,
      ICICIBANK: 950,
      MARUTI: 10500,
      SUNPHARMA: 1180,
    }
    return mockPrices[symbol] || 1000
  }

  const addStock = () => {
    if (newStock.symbol && newStock.quantity && newStock.avgPrice) {
      const stock = {
        symbol: newStock.symbol.toUpperCase(),
        quantity: Number.parseInt(newStock.quantity),
        avgPrice: Number.parseFloat(newStock.avgPrice),
      }
      setPortfolio([...portfolio, stock])
      setNewStock({ symbol: "", quantity: "", avgPrice: "" })
      setIsAdding(false)
    }
  }

  const removeStock = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index))
  }

  const handleZerodhaSync = (zerodhaPortfolio: any[]) => {
    const syncedPortfolio = zerodhaPortfolio.map((stock) => ({
      symbol: stock.symbol,
      quantity: stock.quantity,
      avgPrice: stock.avgPrice,
    }))
    setPortfolio(syncedPortfolio)
  }

  const calculatePnL = (stock: Stock) => {
    const currentPrice = getCurrentPrice(stock.symbol)
    const totalInvested = stock.quantity * stock.avgPrice
    const currentValue = stock.quantity * currentPrice
    const pnl = currentValue - totalInvested
    const pnlPercentage = (pnl / totalInvested) * 100
    return { pnl, pnlPercentage, currentPrice, currentValue }
  }

  const totalPortfolioValue = portfolio.reduce((total, stock) => {
    const { currentValue } = calculatePnL(stock)
    return total + currentValue
  }, 0)

  const totalInvested = portfolio.reduce((total, stock) => {
    return total + stock.quantity * stock.avgPrice
  }, 0)

  const totalPnL = totalPortfolioValue - totalInvested
  const totalPnLPercentage =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="broker" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Broker Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Portfolio Overview
              </CardTitle>
              <CardDescription>
                Manage your stock holdings and track performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{(totalPortfolioValue / 100000).toFixed(1)}L
                  </div>
                  <div className="text-sm text-gray-600">Current Value</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    ₹{(totalInvested / 100000).toFixed(1)}L
                  </div>
                  <div className="text-sm text-gray-600">Invested</div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${
                    totalPnL >= 0 ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                      totalPnL >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {totalPnL >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {totalPnLPercentage >= 0 ? "+" : ""}
                    {totalPnLPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">P&L</div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Holdings</h3>
                <Button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Stock
                </Button>
              </div>

              {isAdding && (
                <Alert className="mb-4">
                  <AlertDescription>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input
                        placeholder="Stock Symbol (e.g., TCS)"
                        value={newStock.symbol}
                        onChange={(e) =>
                          setNewStock({ ...newStock, symbol: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={newStock.quantity}
                        onChange={(e) =>
                          setNewStock({ ...newStock, quantity: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Avg Price"
                        type="number"
                        value={newStock.avgPrice}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            avgPrice: e.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <Button onClick={addStock} size="sm">
                          Add
                        </Button>
                        <Button
                          onClick={() => setIsAdding(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                {portfolio.map((stock, index) => {
                  const { pnl, pnlPercentage, currentPrice, currentValue } =
                    calculatePnL(stock)
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">
                          {stock.quantity} shares @ ₹{stock.avgPrice}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₹{currentPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          ₹{currentValue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            pnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}
                        </div>
                        <div
                          className={`text-sm ${
                            pnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {pnlPercentage >= 0 ? "+" : ""}
                          {pnlPercentage.toFixed(1)}%
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStock(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>

              {portfolio.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No stocks in portfolio. Add some stocks to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broker" className="space-y-6">
          <ZerodhaConnect onPortfolioSync={handleZerodhaSync} />

          <Alert>
            <AlertDescription>
              <strong>Zerodha Kite Connect Integration:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Automatically sync your real portfolio from Zerodha</li>
                <li>Get live prices and P&L calculations</li>
                <li>View positions, orders, and account margins</li>
                <li>Secure authentication with access tokens</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
