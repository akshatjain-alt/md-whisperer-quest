import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  ShoppingCart,
  Calendar,
  Award,
  Activity,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';

interface ShopPerformance {
  shop_name: string;
  monthly_target: number;
  sales_achieved: number;
  transaction_count: number;
  unique_customers: number;
  agent_count: number;
  achievement_percentage: number;
}

interface AgentPerformance {
  id: number;
  full_name: string;
  employee_code: string;
  sales: number;
  transaction_count: number;
  sales_target: number;
  achievement_percentage: number;
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

  // Fetch manager dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['manager-dashboard', user?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await apiService.get(
        `/analytics/dashboard/manager/${user?.id}?month=${selectedMonth}&year=${selectedYear}`
      );
      return response.data;
    },
    enabled: !!user?.id
  });

  const shopPerformance: ShopPerformance | undefined = dashboardData?.shop_performance;
  const agents: AgentPerformance[] = dashboardData?.agents || [];

  const achievementPercent = shopPerformance?.achievement_percentage || 0;
  const getAchievementColor = (percent: number) => {
    if (percent >= 100) return 'text-green-600';
    if (percent >= 75) return 'text-blue-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAchievementBadge = (percent: number) => {
    if (percent >= 100) return { label: 'Target Met', variant: 'default' as const };
    if (percent >= 75) return { label: 'On Track', variant: 'secondary' as const };
    if (percent >= 50) return { label: 'Needs Attention', variant: 'outline' as const };
    return { label: 'Critical', variant: 'destructive' as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {shopPerformance?.shop_name} • {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Badge
              variant={getAchievementBadge(achievementPercent).variant}
              className="px-4 py-2 text-sm"
            >
              <Target className="h-4 w-4 mr-2" />
              {getAchievementBadge(achievementPercent).label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sales Achieved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{((shopPerformance?.sales_achieved || 0) / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of ₹{((shopPerformance?.monthly_target || 0) / 1000).toFixed(0)}K target
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${getAchievementColor(achievementPercent)}`}>
                    {achievementPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transactions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {shopPerformance?.transaction_count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {shopPerformance?.unique_customers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Team Size</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {shopPerformance?.agent_count || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active agents</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No agent data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Agent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Sales</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Target</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Progress</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Transactions</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents
                      .sort((a, b) => (b.achievement_percentage || 0) - (a.achievement_percentage || 0))
                      .map((agent) => {
                        const percent = agent.achievement_percentage || 0;
                        return (
                          <tr key={agent.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{agent.full_name}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">{agent.employee_code}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="font-semibold text-gray-900">
                                ₹{(agent.sales || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-gray-600">
                                ₹{(agent.sales_target || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      percent >= 100
                                        ? 'bg-green-600'
                                        : percent >= 75
                                        ? 'bg-blue-600'
                                        : percent >= 50
                                        ? 'bg-yellow-600'
                                        : 'bg-red-600'
                                    }`}
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-sm font-bold w-12 text-right ${
                                    percent >= 100
                                      ? 'text-green-600'
                                      : percent >= 75
                                      ? 'text-blue-600'
                                      : percent >= 50
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {percent.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium">
                                {agent.transaction_count || 0}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant={getAchievementBadge(percent).variant}>
                                {getAchievementBadge(percent).label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts: top agents + sales trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-role-manager" /> Top agents by sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...agents]
                      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
                      .slice(0, 5)
                      .map((a) => ({ name: a.full_name?.split(' ')[0] ?? a.employee_code, sales: a.sales || 0 }))}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      formatter={(v: number) => `₹${v.toLocaleString()}`}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--role-manager))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {agents.length === 0 && (
                <p className="text-xs text-center text-muted-foreground -mt-8">No agent data yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-role-manager" /> Sales trend (mock)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: 'Mon', sales: 18000, target: 20000 },
                      { day: 'Tue', sales: 22000, target: 20000 },
                      { day: 'Wed', sales: 19500, target: 20000 },
                      { day: 'Thu', sales: 24500, target: 20000 },
                      { day: 'Fri', sales: 28000, target: 20000 },
                      { day: 'Sat', sales: 31000, target: 20000 },
                      { day: 'Sun', sales: 26500, target: 20000 },
                    ]}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      formatter={(v: number) => `₹${v.toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--role-manager))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">View Sales Report</p>
                  <p className="text-sm text-gray-500">Detailed analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Set Monthly Targets</p>
                  <p className="text-sm text-gray-500">Update goals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Manage Team</p>
                  <p className="text-sm text-gray-500">Agent assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}