import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancialReports() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Mock P&L data (replace with real API)
  const plData = {
    revenue: {
      productSales: 385000,
      consultations: 25000,
      other: 5000,
      total: 415000
    },
    costs: {
      productCosts: 245000,
      salaries: 85000,
      rent: 15000,
      utilities: 8000,
      marketing: 12000,
      other: 5000,
      total: 370000
    },
    profit: {
      gross: 170000,
      net: 45000,
      margin: 10.8
    }
  };

  // Revenue breakdown
  const revenueBreakdown = [
    { name: 'Product Sales', value: plData.revenue.productSales, percent: 92.8 },
    { name: 'Consultations', value: plData.revenue.consultations, percent: 6.0 },
    { name: 'Other', value: plData.revenue.other, percent: 1.2 }
  ];

  // Cost breakdown
  const costBreakdown = [
    { name: 'Product Costs', value: plData.costs.productCosts },
    { name: 'Salaries', value: plData.costs.salaries },
    { name: 'Rent', value: plData.costs.rent },
    { name: 'Utilities', value: plData.costs.utilities },
    { name: 'Marketing', value: plData.costs.marketing },
    { name: 'Other', value: plData.costs.other }
  ];

  // Monthly trend (6 months)
  const monthlyTrend = [
    { month: 'Nov', revenue: 358000, costs: 325000, profit: 33000 },
    { month: 'Dec', revenue: 392000, costs: 348000, profit: 44000 },
    { month: 'Jan', revenue: 375000, costs: 342000, profit: 33000 },
    { month: 'Feb', revenue: 398000, costs: 356000, profit: 42000 },
    { month: 'Mar', revenue: 412000, costs: 365000, profit: 47000 },
    { month: 'Apr', revenue: 415000, costs: 370000, profit: 45000 }
  ];

  // Profit margins by category
  const categoryMargins = [
    { category: 'Fungicides', revenue: 135000, cost: 85000, margin: 37.0 },
    { category: 'Insecticides', revenue: 108000, cost: 72000, margin: 33.3 },
    { category: 'Fertilizers', revenue: 85000, cost: 58000, margin: 31.8 },
    { category: 'Seeds', value: 38000, cost: 22000, margin: 42.1 },
    { category: 'Others', value: 19000, cost: 8000, margin: 57.9 }
  ];

  const handleExportPDF = () => {
    alert('Export to PDF functionality will be implemented');
  };

  const handleExportExcel = () => {
    alert('Export to Excel functionality will be implemented');
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-blue-600" />
              Financial Reports (P&L)
            </h1>
            <p className="text-muted-foreground mt-1">Profit & Loss statement and financial analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-04">April 2026</SelectItem>
                <SelectItem value="2026-03">March 2026</SelectItem>
                <SelectItem value="2026-02">February 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{(plData.revenue.total / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +8.5% from last month
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Costs</p>
                  <p className="text-2xl font-bold">₹{(plData.costs.total / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +5.2% from last month
                  </p>
                </div>
                <TrendingDown className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold">₹{(plData.profit.net / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12.3% from last month
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold">{plData.profit.margin.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +1.2% from last month
                  </p>
                </div>
                <BarChart3 className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* P&L Statement */}
        <div className="grid grid-cols-2 gap-6">
          {/* Income Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Income Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Revenue Section */}
                <div>
                  <p className="font-bold text-sm text-muted-foreground mb-2">REVENUE</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between">
                      <span>Product Sales</span>
                      <span className="font-medium">₹{plData.revenue.productSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultations</span>
                      <span className="font-medium">₹{plData.revenue.consultations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Income</span>
                      <span className="font-medium">₹{plData.revenue.other.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-green-600">
                      <span>Total Revenue</span>
                      <span>₹{plData.revenue.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Section */}
                <div className="pt-4">
                  <p className="font-bold text-sm text-muted-foreground mb-2">COSTS</p>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between">
                      <span>Product Costs</span>
                      <span className="font-medium">₹{plData.costs.productCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salaries</span>
                      <span className="font-medium">₹{plData.costs.salaries.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rent</span>
                      <span className="font-medium">₹{plData.costs.rent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilities</span>
                      <span className="font-medium">₹{plData.costs.utilities.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marketing</span>
                      <span className="font-medium">₹{plData.costs.marketing.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other</span>
                      <span className="font-medium">₹{plData.costs.other.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-red-600">
                      <span>Total Costs</span>
                      <span>₹{plData.costs.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Profit Section */}
                <div className="pt-4 border-t-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Gross Profit</span>
                      <span className="font-bold text-blue-600">₹{plData.profit.gross.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Net Profit</span>
                      <span className="font-bold text-green-600">₹{plData.profit.net.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Margin</span>
                      <span className="font-bold text-green-600">{plData.profit.margin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="space-y-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={costBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 6-Month Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              6-Month Profit Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}