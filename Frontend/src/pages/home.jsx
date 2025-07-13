"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts"
import { FileText, IndianRupee, AlertTriangle, TrendingUp } from "lucide-react"

// Mock data for the dashboard
const recentInvoices = [
  {
    id: "INV-001",
    customer: "Rajesh Kumar",
    amount: 15420,
    status: "Paid",
    date: "2024-01-15",
  },
  {
    id: "INV-002",
    customer: "Priya Sharma",
    amount: 8750,
    status: "Pending",
    date: "2024-01-14",
  },
  {
    id: "INV-003",
    customer: "Amit Patel",
    amount: 22100,
    status: "Paid",
    date: "2024-01-13",
  },
  {
    id: "INV-004",
    customer: "Sunita Gupta",
    amount: 12300,
    status: "Overdue",
    date: "2024-01-12",
  },
  {
    id: "INV-005",
    customer: "Vikram Singh",
    amount: 18900,
    status: "Paid",
    date: "2024-01-11",
  },
]


const mostSoldItems = [
  { name: "Paracetamol 500mg", sold: 150, revenue: 7500 },
  { name: "Cough Syrup 100ml", sold: 85, revenue: 12750 },
  { name: "Vitamin C Tablets", sold: 200, revenue: 18000 },
  { name: "Ibuprofen 400mg", sold: 120, revenue: 9600 },
  { name: "Antacid Gel", sold: 90, revenue: 8100 },
  { name: "Hand Sanitizer 100ml", sold: 110, revenue: 6600 },
  { name: "Thermometer Digital", sold: 30, revenue: 6000 },
  { name: "Face Mask (Pack of 10)", sold: 75, revenue: 3750 },
  { name: "Glucose Powder 200g", sold: 60, revenue: 5400 },
  { name: "ORS Sachet", sold: 100, revenue: 3000 }
];

const last7DaysRevenue = [
  { day: "Mon", revenue: 125000, date: "Jan 8" },
  { day: "Tue", revenue: 98000, date: "Jan 9" },
  { day: "Wed", revenue: 142000, date: "Jan 10" },
  { day: "Thu", revenue: 156000, date: "Jan 11" },
  { day: "Fri", revenue: 189000, date: "Jan 12" },
  { day: "Sat", revenue: 167000, date: "Jan 13" },
  { day: "Sun", revenue: 134000, date: "Jan 14" },
]

const chartConfig = {
  sold: {
    label: "Units Sold",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
}

export default function Dashboard() {
  const totalInvoices = 1247
  const totalSales = 8750000
  const outOfStockItems = 23

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "Overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your business metrics</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalInvoices.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Out of Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{outOfStockItems}</div>
              <p className="text-xs text-red-600 mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Additional Items Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Selling Items Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mostSoldItems.slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.sold} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
