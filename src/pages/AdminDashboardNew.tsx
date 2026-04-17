import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Store,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboardNew() {
  // Fetch admin dashboard data from real API
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await apiService.get('/analytics/dashboard/admin');
      return response.data || {};
    }
  });

  // Extract stats from API response
  const stats = dashboardData?.stats || {
    sales_this_month: 0,
    transactions_this_month: 0,
    total_customers: 0,
    total_agents: 0,
    total_shops: 0,
    achievement_percentage: 0
  };

  const shops = dashboardData?.shops || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Analytics</h1>
          <p className="text-muted-foreground mt-1">Company-wide performance overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-6 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₹{(Number(stats.sales_this_month) / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{stats.transactions_this_month}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">{stats.total_customers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Agents</p>
                  <p className="text-2xl font-bold">{stats.total_agents}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Shops</p>
                  <p className="text-2xl font-bold">{stats.total_shops}</p>
                </div>
                <Store className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-2xl font-bold">{Number(stats.achievement_percentage).toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shop Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-green-600" />
              Shop Performance (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shops.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No shop data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shops}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shop_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="Sales Achieved (₹)" />
                  <Bar dataKey="monthly_target" fill="#94a3b8" name="Target (₹)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Shop Details Table */}
        {shops.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Shop</th>
                      <th className="text-left p-3">Code</th>
                      <th className="text-right p-3">Sales</th>
                      <th className="text-right p-3">Target</th>
                      <th className="text-right p-3">Achievement</th>
                      <th className="text-right p-3">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((shop: any) => (
                      <tr key={shop.id} className="border-b hover:bg-muted">
                        <td className="p-3 font-medium">{shop.shop_name}</td>
                        <td className="p-3 text-sm text-muted-foreground">{shop.shop_code}</td>
                        <td className="p-3 text-right font-bold">₹{Number(shop.sales || 0).toLocaleString()}</td>
                        <td className="p-3 text-right text-muted-foreground">₹{Number(shop.monthly_target || 0).toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className={`font-bold ${
                            Number(shop.achievement_percentage) >= 90 ? 'text-green-600' :
                            Number(shop.achievement_percentage) >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {Number(shop.achievement_percentage || 0).toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-right">{shop.transaction_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}