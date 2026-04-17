import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Sprout, FileText, TrendingUp, AlertCircle, Shield, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Fetch all data for statistics
  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops() });
  const { data: symptoms = [] } = useQuery({ queryKey: ['symptoms'], queryFn: () => apiService.getSymptoms() });
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: () => apiService.getAll('diagnoses') });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiService.getAll('products') });
  const { data: varieties = [] } = useQuery({ queryKey: ['varieties'], queryFn: () => apiService.getAll('varieties') });
  const { data: prescriptions = [] } = useQuery({ queryKey: ['prescriptions'], queryFn: () => apiService.getAll('prescriptions') });
  
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await apiService.api.get('/auth/users');
      return response.data.data;
    },
  });

  const { data: pendingUsers = [] } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const response = await apiService.api.get('/auth/pending-users');
      return response.data.data;
    },
  });

  const activeUsers = allUsers.filter((u: any) => u.is_active);
  const usersByRole = {
    admin: activeUsers.filter((u: any) => u.role === 'admin').length,
    expert: activeUsers.filter((u: any) => u.role === 'expert').length,
    agent: activeUsers.filter((u: any) => u.role === 'agent').length,
    viewer: activeUsers.filter((u: any) => u.role === 'viewer').length,
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
          <Activity className="h-8 w-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and analytics</p>
      </div>

      {/* Pending Approvals Alert */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">{pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval</p>
                <p className="text-sm text-amber-700">Review pending registrations</p>
              </div>
            </div>
            <Button onClick={() => navigate('/users')} className="bg-amber-600 hover:bg-amber-700">
              Review Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/users')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black">{activeUsers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
              </div>
              <Users className="h-12 w-12 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black">{usersByRole.admin}</p>
                <Badge className="mt-2 bg-red-100 text-red-700">Full Access</Badge>
              </div>
              <Shield className="h-12 w-12 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Experts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black">{usersByRole.expert}</p>
                <Badge className="mt-2 bg-blue-100 text-blue-700">DB Managers</Badge>
              </div>
              <Users className="h-12 w-12 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black">{usersByRole.agent}</p>
                <Badge className="mt-2 bg-green-100 text-green-700">Field Staff</Badge>
              </div>
              <Users className="h-12 w-12 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            Database Overview
          </CardTitle>
          <CardDescription>Current knowledge base statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/crops')}>
              <p className="text-3xl font-bold text-green-600">{crops.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Crops</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/varieties')}>
              <p className="text-3xl font-bold text-blue-600">{varieties.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Varieties</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/symptoms')}>
              <p className="text-3xl font-bold text-yellow-600">{symptoms.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Symptoms</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/diagnoses')}>
              <p className="text-3xl font-bold text-red-600">{diagnoses.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Diagnoses</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/products')}>
              <p className="text-3xl font-bold text-purple-600">{products.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Products</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/prescriptions')}>
              <p className="text-3xl font-bold text-orange-600">{prescriptions.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Prescriptions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Management</CardTitle>
            <CardDescription>Manage users and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate('/users')} className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              View All Users
            </Button>
            {pendingUsers.length > 0 && (
              <Button onClick={() => navigate('/users')} className="w-full justify-start bg-amber-600 hover:bg-amber-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                Review {pendingUsers.length} Pending Request{pendingUsers.length !== 1 ? 's' : ''}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Management</CardTitle>
            <CardDescription>Configure system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate('/settings')} className="w-full justify-start" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              System Settings
            </Button>
            <Button onClick={() => navigate('/profile')} className="w-full justify-start" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Your Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Placeholder */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">Analytics Coming Soon</h3>
          <p className="text-muted-foreground max-w-md">
            Transaction history, prescription analytics, product sales tracking, and financial reports will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}