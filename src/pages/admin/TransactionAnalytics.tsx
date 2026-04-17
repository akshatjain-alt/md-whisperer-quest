import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Clock,
  Users,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

export default function TransactionAnalytics() {
  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['all-transactions'],
    queryFn: async () => {
      const response = await apiService.get('/transactions?limit=100');
      return response.data?.transactions || [];
    }
  });

  // Calculate metrics
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum: number, t: any) => sum + Number(t.total_amount || 0), 0);
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Payment method distribution
  const paymentMethods = transactions.reduce((acc: any, t: any) => {
    const method = t.payment_method || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const paymentMethodData = Object.entries(paymentMethods).map(([name, count]) => ({
    name: name.toUpperCase(),
    value: count as number
  }));

  // Calculate hourly distribution from real data
  const hourlyDistribution = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    const count = transactions.filter((t: any) => {
      const date = new Date(t.transaction_date);
      return date.getHours() === hour;
    }).length;
    return {
      hour: `${hour}-${hour + 1}`,
      transactions: count
    };
  }).filter(h => h.transactions > 0);

  // Calculate daily trend (last 7 days) from real data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyTrend = last7Days.map(date => {
    const dayTransactions = transactions.filter((t: any) => {
      const tDate = new Date(t.transaction_date);
      return tDate.toDateString() === date.toDateString();
    });
    const revenue = dayTransactions.reduce((sum: number, t: any) => sum + Number(t.total_amount || 0), 0);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      transactions: dayTransactions.length,
      revenue: Math.round(revenue)
    };
  });

  // Top customers by transaction count
  const customerFrequency = transactions.reduce((acc: any, t: any) => {
    const customer = t.customer_name || 'Unknown';
    if (!acc[customer]) {
      acc[customer] = { name: customer, count: 0, total: 0 };
    }
    acc[customer].count++;
    acc[customer].total += Number(t.total_amount || 0);
    return acc;
  }, {});

  const topCustomers = Object.values(customerFrequency)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);

  // Calculate transaction size distribution from real data
  const sizeRanges = [
    { range: '₹0-1000', min: 0, max: 1000 },
    { range: '₹1001-2500', min: 1001, max: 2500 },
    { range: '₹2501-5000', min: 2501, max: 5000 },
    { range: '₹5001-10000', min: 5001, max: 10000 },
    { range: '₹10000+', min: 10001, max: Infinity }
  ];

  const sizeDistribution = sizeRanges.map(({ range, min, max }) => ({
    range,
    count: transactions.filter((t: any) => {
      const amount = Number(t.total_amount || 0);
      return amount >= min && amount <= max;
    }).length
  }));

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            Transaction Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Transaction patterns and customer behavior insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{totalTransactions}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                  <p className="text-2xl font-bold">₹{avgOrderValue.toFixed(0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Peak Hour</p>
                  <p className="text-2xl font-bold">3-4 PM</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Unique Customers</p>
                  <p className="text-2xl font-bold">{Object.keys(customerFrequency).length}</p>
                </div>
                <Users className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Daily Transaction Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} name="Transactions" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Payment Method Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Hourly Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transaction Size */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Transaction Size Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sizeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Top Customers by Transaction Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(topCustomers as any[]).map((customer: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{customer.total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total spent</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{t.customer_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.transaction_code} • {new Date(t.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{Number(t.total_amount || 0).toFixed(2)}</p>
                    <Badge variant="outline">{t.payment_method?.toUpperCase()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}