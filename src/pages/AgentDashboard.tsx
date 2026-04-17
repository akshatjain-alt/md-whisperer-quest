import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Award,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: transactions = [] } = useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async () => {
      const response = await apiService.get('/transactions?limit=20');
      return response.data?.transactions || [];
    }
  });

  const stats = {
    todaySales: 5420,
    todayCustomers: 8,
    monthlyTarget: 200000,
    monthlyAchieved: 145000,
    totalCustomers: transactions.length || 156
  };

  const achievementPercent = (stats.monthlyAchieved / stats.monthlyTarget) * 100;

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your performance overview</p>
          </div>
          <Button 
            onClick={() => navigate('/prescription')}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            New Prescription
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Sales</p>
                  <p className="text-3xl font-bold">₹{stats.todaySales.toLocaleString()}</p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers Today</p>
                  <p className="text-3xl font-bold">{stats.todayCustomers}</p>
                </div>
                <Users className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-3xl font-bold">{stats.totalCustomers}</p>
                </div>
                <Award className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Achievement</p>
                  <p className="text-3xl font-bold">{achievementPercent.toFixed(0)}%</p>
                </div>
                <Target className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Target Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Monthly Target</h3>
                <span className="text-2xl font-bold text-primary">{achievementPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹{(stats.monthlyAchieved / 1000).toFixed(0)}K achieved</span>
                <span>₹{(stats.monthlyTarget / 1000).toFixed(0)}K target</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}