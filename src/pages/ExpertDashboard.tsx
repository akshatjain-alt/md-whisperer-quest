import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Dna, Search, Stethoscope, Pill, ClipboardList, Plus, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function ExpertDashboard() {
  const navigate = useNavigate();

  // Fetch real data
  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops() });
  const { data: symptoms = [] } = useQuery({ queryKey: ['symptoms'], queryFn: () => apiService.getSymptoms() });
  const { data: diagnosesData } = useQuery({ queryKey: ['diagnoses'], queryFn: async () => { const r = await apiService.get('/diagnoses'); return r.data.data || []; }});
  const { data: productsData } = useQuery({ queryKey: ['products'], queryFn: async () => { const r = await apiService.get('/products'); return r.data.data || []; }});

  const diagnoses = diagnosesData || [];
  const products = productsData || [];

  // Prepare chart data
  const cropDistribution = crops.slice(0, 5).map(crop => ({
    name: crop.name,
    value: symptoms.filter(s => s.crop_id === crop.id).length
  }));

  const symptomsByType = symptoms.reduce((acc, symptom) => {
    const type = symptom.symptom_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const symptomTypeData = Object.entries(symptomsByType).map(([name, value]) => ({ name, value }));

  const diagnosisTrend = diagnoses.slice(0, 6).map(d => ({
    name: d.diagnosis_name?.substring(0, 15) + '...' || 'Unknown',
    count: 1 // Just show diagnosis count
  }));

  const productCategories = products.reduce((acc, product) => {
    const category = product.product_category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const productCategoryData = Object.entries(productCategories).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sprout className="h-8 w-8 text-green-600" />
              Agricultural Analytics
            </h1>
            <p className="text-gray-600 mt-1">Expert Dashboard - Data Insights</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/crops')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Crops</p>
                  <p className="text-3xl font-bold text-gray-900">{crops.length}</p>
                </div>
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-600 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/symptoms')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Symptoms</p>
                  <p className="text-3xl font-bold text-gray-900">{symptoms.length}</p>
                </div>
                <Search className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-600 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/diagnoses')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Diagnoses</p>
                  <p className="text-3xl font-bold text-gray-900">{diagnoses.length}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <Pill className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Crop Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Crop Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Symptom Types Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
                Symptom Types Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symptomTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Diagnosis Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Top Diagnoses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={diagnosisTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Product Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/crops')}>
            <CardContent className="p-4">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Crop
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/symptoms')}>
            <CardContent className="p-4">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Symptom
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/diagnoses')}>
            <CardContent className="p-4">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Diagnosis
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
            <CardContent className="p-4">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}