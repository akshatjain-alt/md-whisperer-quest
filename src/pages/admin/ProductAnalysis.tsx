import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  BarChart3,
  PieChart as PieChartIcon
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface Product {
  id: number;
  product_name: string;
  product_category: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  mrp: number;
}

export default function ProductAnalysis() {
  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiService.get('/products');
      return response.data?.data || [];
    }
  });

  // Calculate metrics
  const calculateMetrics = () => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter((p: Product) => p.stock_quantity < 20).length;
    const outOfStockProducts = products.filter((p: Product) => p.stock_quantity === 0).length;
    
    const totalStockValue = products.reduce((sum: number, p: Product) => 
      sum + (p.selling_price || 0) * (p.stock_quantity || 0), 0
    );

    // Calculate average profit margin
    const productsWithCost = products.filter((p: Product) => p.cost_price && p.selling_price);
    const avgProfitMargin = productsWithCost.length > 0
      ? productsWithCost.reduce((sum: number, p: Product) => {
          const margin = ((p.selling_price - p.cost_price) / p.selling_price) * 100;
          return sum + margin;
        }, 0) / productsWithCost.length
      : 0;

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      avgProfitMargin
    };
  };

  const metrics = calculateMetrics();

  // Group by category
  const categoryDistribution = products.reduce((acc: any, product: Product) => {
    const category = product.product_category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0 };
    }
    acc[category].count++;
    acc[category].value += (product.selling_price || 0) * (product.stock_quantity || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryDistribution).map(([name, data]: [string, any]) => ({
    name,
    count: data.count,
    value: Math.round(data.value)
  }));

  // Top products by stock value
  const topProductsByValue = [...products]
    .sort((a: Product, b: Product) => {
      const aValue = (a.selling_price || 0) * (a.stock_quantity || 0);
      const bValue = (b.selling_price || 0) * (b.stock_quantity || 0);
      return bValue - aValue;
    })
    .slice(0, 10);

  // Products by profit margin
  const productsByMargin = products
    .filter((p: Product) => p.cost_price && p.selling_price)
    .map((p: Product) => ({
      ...p,
      margin: ((p.selling_price - p.cost_price) / p.selling_price) * 100,
      profit: (p.selling_price - p.cost_price) * p.stock_quantity
    }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);

  // Stock alerts
  const stockAlerts = products
    .filter((p: Product) => p.stock_quantity < 20)
    .sort((a: Product, b: Product) => a.stock_quantity - b.stock_quantity);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-purple-600" />
            Product Analysis
          </h1>
          <p className="text-muted-foreground mt-1">Inventory insights and profitability metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{metrics.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Stock Value</p>
                  <p className="text-2xl font-bold">₹{(metrics.totalStockValue / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Margin</p>
                  <p className="text-2xl font-bold">{metrics.avgProfitMargin.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">{metrics.lowStockProducts}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">{metrics.outOfStockProducts}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-purple-600" />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Category Stock Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" name="Stock Value (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products by Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Top Products by Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProductsByValue.map((product: Product, index: number) => {
                const stockValue = (product.selling_price || 0) * (product.stock_quantity || 0);
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.product_category} • Stock: {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{stockValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">₹{product.selling_price}/unit</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Profit Margins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Highest Profit Margins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {productsByMargin.map((product: any, index: number) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cost: ₹{product.cost_price} → Sell: ₹{product.selling_price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-600 text-white">{product.margin.toFixed(1)}%</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Profit: ₹{product.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Low Stock Alerts ({stockAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stockAlerts.slice(0, 10).map((product: Product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">{product.product_name}</p>
                      <p className="text-sm text-red-600">{product.product_category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-lg">
                        {product.stock_quantity} left
                      </Badge>
                      {product.stock_quantity === 0 && (
                        <p className="text-xs text-red-600 mt-1 font-bold">OUT OF STOCK</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}