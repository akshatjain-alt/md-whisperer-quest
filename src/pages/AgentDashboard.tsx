import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, DollarSign, Award, ClipboardPlus, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AgentDashboard() {
  const navigate = useNavigate();

  const { data: transactions = [] } = useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async () => {
      const response = await apiService.get('/transactions?limit=20');
      return response.data?.transactions || [];
    },
  });

  const stats = {
    todaySales: 5420,
    todayCustomers: 8,
    monthlyTarget: 200000,
    monthlyAchieved: 145000,
    totalCustomers: transactions.length || 156,
  };

  const achievementPercent = (stats.monthlyAchieved / stats.monthlyTarget) * 100;

  const cards = [
    { label: "Today's Sales", value: `₹${stats.todaySales.toLocaleString()}`, icon: DollarSign, accent: 'border-l-role-agent' },
    { label: 'Customers Today', value: stats.todayCustomers, icon: Users, accent: 'border-l-role-manager' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Award, accent: 'border-l-role-admin' },
    { label: 'Achievement', value: `${achievementPercent.toFixed(0)}%`, icon: Target, accent: 'border-l-warning' },
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your performance at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/agent/history')}>
            <HistoryIcon className="h-4 w-4" /> History
          </Button>
          <Button onClick={() => navigate('/agent/prescription')} size="lg">
            <ClipboardPlus className="h-4 w-4" /> New Prescription
          </Button>
        </div>
      </header>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className={`border-l-4 ${c.accent}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold mt-1">{c.value}</p>
                </div>
                <c.icon className="h-8 w-8 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Monthly Target</h3>
            <span className="text-2xl font-bold text-role-agent">{achievementPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${Math.min(achievementPercent, 100)}%`, background: 'hsl(var(--role-agent))' }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{(stats.monthlyAchieved / 1000).toFixed(0)}K achieved</span>
            <span>₹{(stats.monthlyTarget / 1000).toFixed(0)}K target</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
