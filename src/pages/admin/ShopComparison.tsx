import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Package,
  DollarSign,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ShopData {
  id: number;
  name: string;
  location: string;
  manager: string;
  revenue: number;
  target: number;
  customers: number;
  transactions: number;
  agents: number;
  avgOrderValue: number;
  growth: number;
}

export default function ShopComparison() {
  // Mock shop data (replace with real API)
  const shops: ShopData[] = [
    {
      id: 1,
      name: 'Rajkot Main',
      location: 'Rajkot',
      manager: 'Ramesh Patel',
      revenue: 125000,
      target: 150000,
      customers: 285,
      transactions: 420,
      agents: 8,
      avgOrderValue: 2976,
      growth: 15.3
    },
    {
      id: 2,
      name: 'Ahmedabad Central',
      location: 'Ahmedabad',
      manager: 'Suresh Kumar',
      revenue: 98000,
      target: 120000,
      customers: 210,
      transactions: 345,
      agents: 6,
      avgOrderValue: 2841,
      growth: 12.8
    },
    {
      id: 3,
      name: 'Surat Branch',
      location: 'Surat',
      manager: 'Mahesh Shah',
      revenue: 87000,
      target: 100000,
      customers: 185,
      transactions: 298,
      agents: 5,
      avgOrderValue: 2919,
      growth: 8.5
    },
    {
      id: 4,
      name: 'Vadodara Office',
      location: 'Vadodara',
      manager: 'Dinesh Joshi',
      revenue: 76000,
      target: 90000,
      customers: 156,
      transactions: 265,
      agents: 4,
      avgOrderValue: 2868,
      growth: 6.2
    }
  ];

  // Sort by revenue for ranking
  const rankedShops = [...shops].sort((a, b) => b.revenue - a.revenue);

  // Performance comparison data
  const comparisonData = shops.map(shop => ({
    name: shop.name.split(' ')[0],
    revenue: shop.revenue / 1000,
    target: shop.target / 1000,
    achievement: (shop.revenue / shop.target) * 100
  }));

  // Multi-metric radar chart
  const radarData = [
    {
      metric: 'Revenue',
      Rajkot: 125,
      Ahmedabad: 98,
      Surat: 87,
      Vadodara: 76
    },
    {
      metric: 'Customers',
      Rajkot: 285,
      Ahmedabad: 210,
      Surat: 185,
      Vadodara: 156
    },
    {
      metric: 'Transactions',
      Rajkot: 420,
      Ahmedabad: 345,
      Surat: 298,
      Vadodara: 265
    },
    {
      metric: 'Growth %',
      Rajkot: 15.3,
      Ahmedabad: 12.8,
      Surat: 8.5,
      Vadodara: 6.2
    }
  ];

  const calculateAchievement = (revenue: number, target: number) => {
    return ((revenue / target) * 100).toFixed(1);
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8 text-orange-600" />
            Shop Performance Comparison
          </h1>
          <p className="text-muted-foreground mt-1">Compare performance across all locations</p>
        </div>

        {/* Rankings */}
        <Card className="border-l-4 border-l-gold-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Shop Rankings (by Revenue)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {rankedShops.map((shop, index) => (
                <Card key={shop.id} className={`${
                  index === 0 ? 'border-2 border-yellow-400 bg-yellow-50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Award className="h-5 w-5 text-yellow-600" />}
                        <span className="text-2xl font-bold">#{index + 1}</span>
                      </div>
                      {shop.growth > 10 && (
                        <Badge className="bg-green-600">Hot! 🔥</Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    <p className="text-sm text-muted-foreground">{shop.location}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Revenue:</span>
                        <span className="font-bold">₹{(shop.revenue / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Achievement:</span>
                        <span className="font-bold text-green-600">
                          {calculateAchievement(shop.revenue, shop.target)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Growth:</span>
                        <span className={`font-bold ${
                          shop.growth > 10 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          +{shop.growth}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-bold">Shop</th>
                    <th className="text-left p-3 font-bold">Manager</th>
                    <th className="text-right p-3 font-bold">Revenue</th>
                    <th className="text-right p-3 font-bold">Target</th>
                    <th className="text-right p-3 font-bold">Achievement</th>
                    <th className="text-right p-3 font-bold">Customers</th>
                    <th className="text-right p-3 font-bold">Transactions</th>
                    <th className="text-right p-3 font-bold">Avg. Order</th>
                    <th className="text-right p-3 font-bold">Agents</th>
                    <th className="text-right p-3 font-bold">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedShops.map((shop, index) => (
                    <tr key={shop.id} className={`border-b hover:bg-muted ${
                      index === 0 ? 'bg-yellow-50' : ''
                    }`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="h-4 w-4 text-yellow-600" />}
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-xs text-muted-foreground">{shop.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{shop.manager}</td>
                      <td className="p-3 text-right font-bold">₹{shop.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right text-muted-foreground">₹{shop.target.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <Badge className={`${
                          Number(calculateAchievement(shop.revenue, shop.target)) >= 90
                            ? 'bg-green-600'
                            : Number(calculateAchievement(shop.revenue, shop.target)) >= 70
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}>
                          {calculateAchievement(shop.revenue, shop.target)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-right">{shop.customers}</td>
                      <td className="p-3 text-right">{shop.transactions}</td>
                      <td className="p-3 text-right">₹{shop.avgOrderValue}</td>
                      <td className="p-3 text-right">{shop.agents}</td>
                      <td className="p-3 text-right">
                        <span className={`font-bold flex items-center justify-end gap-1 ${
                          shop.growth > 10 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {shop.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          +{shop.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Revenue vs Target */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Revenue vs Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹K)" />
                  <Bar dataKey="target" fill="#94a3b8" name="Target (₹K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Multi-metric Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Performance Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar name="Rajkot" dataKey="Rajkot" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Radar name="Ahmedabad" dataKey="Ahmedabad" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Surat" dataKey="Surat" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Radar name="Vadodara" dataKey="Vadodara" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-bold text-green-900">Best Performer</h4>
                </div>
                <p className="text-2xl font-bold text-green-600">{rankedShops[0].name}</p>
                <p className="text-sm text-green-700">₹{(rankedShops[0].revenue / 1000).toFixed(0)}K revenue • +{rankedShops[0].growth}% growth</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <h4 className="font-bold text-orange-900">Needs Attention</h4>
                </div>
                <p className="text-2xl font-bold text-orange-600">{rankedShops[rankedShops.length - 1].name}</p>
                <p className="text-sm text-orange-700">
                  {calculateAchievement(rankedShops[rankedShops.length - 1].revenue, rankedShops[rankedShops.length - 1].target)}% achievement
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <h4 className="font-bold text-blue-900">Highest AOV</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {[...shops].sort((a, b) => b.avgOrderValue - a.avgOrderValue)[0].name}
                </p>
                <p className="text-sm text-blue-700">
                  ₹{[...shops].sort((a, b) => b.avgOrderValue - a.avgOrderValue)[0].avgOrderValue} avg order value
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}