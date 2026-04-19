import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp, Users, Target, DollarSign, ShoppingCart, Calendar,
  Award, Activity, Loader2,
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

const progressTone = (p: number) =>
  p >= 100 ? 'bg-success'
  : p >= 75 ? 'bg-role-manager'
  : p >= 50 ? 'bg-warning'
  : 'bg-destructive';

const textTone = (p: number) =>
  p >= 100 ? 'text-success'
  : p >= 75 ? 'text-role-manager'
  : p >= 50 ? 'text-warning'
  : 'text-destructive';

const badgeFor = (p: number) => {
  if (p >= 100) return { label: 'Target Met', variant: 'default' as const };
  if (p >= 75) return { label: 'On Track', variant: 'secondary' as const };
  if (p >= 50) return { label: 'Needs Attention', variant: 'outline' as const };
  return { label: 'Critical', variant: 'destructive' as const };
};

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['manager-dashboard', user?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await apiService.get(
        `/analytics/dashboard/manager/${user?.id}?month=${selectedMonth}&year=${selectedYear}`
      );
      return response.data;
    },
    enabled: !!user?.id,
  });

  const shopPerformance: ShopPerformance | undefined = dashboardData?.shop_performance;
  const agents: AgentPerformance[] = dashboardData?.agents || [];
  const achievementPercent = shopPerformance?.achievement_percentage || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      {/* Shop info header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {shopPerformance?.shop_name || 'Your shop'} •{' '}
            {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant={badgeFor(achievementPercent).variant} className="px-3 py-1.5 w-fit">
          <Target className="h-4 w-4 mr-1.5" />
          {badgeFor(achievementPercent).label}
        </Badge>
      </header>

      {/* Key metrics */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-role-agent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Sales Achieved</p>
                <p className="text-2xl font-bold mt-1">
                  ₹{((shopPerformance?.sales_achieved || 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  of ₹{((shopPerformance?.monthly_target || 0) / 1000).toFixed(0)}K target
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-role-agent/70" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${progressTone(achievementPercent)}`}
                  style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${textTone(achievementPercent)}`}>
                {achievementPercent.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-role-manager">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold mt-1">{shopPerformance?.transaction_count || 0}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-role-manager/70" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-role-admin">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Customers</p>
              <p className="text-2xl font-bold mt-1">{shopPerformance?.unique_customers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-role-admin/70" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Team Size</p>
              <p className="text-2xl font-bold mt-1">{shopPerformance?.agent_count || 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active agents</p>
            </div>
            <Award className="h-8 w-8 text-warning/70" />
          </CardContent>
        </Card>
      </section>

      {/* Agent performance table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-role-manager" /> Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No agent data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 px-3 font-medium">Agent</th>
                    <th className="text-left py-3 px-3 font-medium">Code</th>
                    <th className="text-right py-3 px-3 font-medium">Sales</th>
                    <th className="text-right py-3 px-3 font-medium">Target</th>
                    <th className="text-right py-3 px-3 font-medium">Progress</th>
                    <th className="text-center py-3 px-3 font-medium">Tx</th>
                    <th className="text-center py-3 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agents
                    .sort((a, b) => (b.achievement_percentage || 0) - (a.achievement_percentage || 0))
                    .map((agent) => {
                      const percent = agent.achievement_percentage || 0;
                      return (
                        <tr key={agent.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3 font-medium">{agent.full_name}</td>
                          <td className="py-3 px-3 text-muted-foreground">{agent.employee_code}</td>
                          <td className="py-3 px-3 text-right font-semibold">
                            ₹{(agent.sales || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-muted-foreground">
                            ₹{(agent.sales_target || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${progressTone(percent)}`}
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold w-10 text-right ${textTone(percent)}`}>
                                {percent.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-role-manager/10 text-role-manager text-xs font-medium">
                              {agent.transaction_count || 0}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant={badgeFor(percent).variant}>{badgeFor(percent).label}</Badge>
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

      {/* Charts */}
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

      {/* Quick actions */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: 'My Agents', desc: 'View team performance', icon: Users, accent: 'text-role-manager', to: '/manager/agents' },
          { label: 'Inventory', desc: 'Stock & low alerts', icon: ShoppingCart, accent: 'text-warning', to: '/manager/inventory' },
          { label: 'Targets', desc: 'Monthly goals', icon: Calendar, accent: 'text-role-admin', to: '/manager/targets' },
        ].map((a) => (
          <Card
            key={a.label}
            onClick={() => navigate(a.to)}
            className="cursor-pointer hover:shadow-md hover:border-role-manager/40 transition-all"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center">
                <a.icon className={`h-5 w-5 ${a.accent}`} />
              </div>
              <div>
                <p className="font-semibold">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
