import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Store,
  Users,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Target,
  User
} from 'lucide-react';

interface Shop {
  id: number;
  shop_name: string;
  shop_code: string;
  location: string;
  district: string;
  state: string;
  phone: string;
  email: string;
  manager_id?: number;
  monthly_target: number;
  is_active: boolean;
}

interface Manager {
  id: number;
  full_name: string;
  email: string;
  employee_code: string;
  phone?: string;
  shop_id?: number;
  is_active: boolean;
}

export default function ShopManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('shops');
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);

  // Shop form state
  const [shopForm, setShopForm] = useState({
    shop_name: '',
    shop_code: '',
    location: '',
    district: '',
    state: 'Gujarat',
    phone: '',
    email: '',
    monthly_target: 100000
  });

  // Manager form state
  const [managerForm, setManagerForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_code: '',
    password: '',
    shop_id: 0
  });

  // Fetch shops (mock data for now)
  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      // Mock data - replace with real API
      return [
        {
          id: 1,
          shop_name: 'Rajkot Main',
          shop_code: 'SKB-RJK-001',
          location: 'Rajkot',
          district: 'Rajkot',
          state: 'Gujarat',
          phone: '+91 99999 11111',
          email: 'rajkot@smartkisan.com',
          monthly_target: 150000,
          is_active: true,
          manager_id: 1
        },
        {
          id: 2,
          shop_name: 'Ahmedabad Central',
          shop_code: 'SKB-AMD-001',
          location: 'Ahmedabad',
          district: 'Ahmedabad',
          state: 'Gujarat',
          phone: '+91 99999 22222',
          email: 'ahmedabad@smartkisan.com',
          monthly_target: 120000,
          is_active: true,
          manager_id: 2
        }
      ];
    }
  });

  // Fetch managers (mock data)
  const { data: managers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      // Mock data - replace with real API
      return [
        {
          id: 1,
          full_name: 'Ramesh Patel',
          email: 'ramesh.patel@smartkisan.com',
          employee_code: 'MGR001',
          phone: '+91 99999 11111',
          shop_id: 1,
          is_active: true
        },
        {
          id: 2,
          full_name: 'Suresh Kumar',
          email: 'suresh.kumar@smartkisan.com',
          employee_code: 'MGR002',
          phone: '+91 99999 22222',
          shop_id: 2,
          is_active: true
        }
      ];
    }
  });

  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShop) {
      toast({ title: 'Shop updated successfully' });
    } else {
      toast({ title: 'Shop created successfully' });
    }
    setShowShopForm(false);
    setEditingShop(null);
    setShopForm({
      shop_name: '',
      shop_code: '',
      location: '',
      district: '',
      state: 'Gujarat',
      phone: '',
      email: '',
      monthly_target: 100000
    });
  };

  const handleManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingManager) {
      toast({ title: 'Manager updated successfully' });
    } else {
      toast({ title: 'Manager created successfully' });
    }
    setShowManagerForm(false);
    setEditingManager(null);
    setManagerForm({
      full_name: '',
      email: '',
      phone: '',
      employee_code: '',
      password: '',
      shop_id: 0
    });
  };

  const openEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setShopForm({
      shop_name: shop.shop_name,
      shop_code: shop.shop_code,
      location: shop.location,
      district: shop.district,
      state: shop.state,
      phone: shop.phone,
      email: shop.email,
      monthly_target: shop.monthly_target
    });
    setShowShopForm(true);
  };

  const openEditManager = (manager: Manager) => {
    setEditingManager(manager);
    setManagerForm({
      full_name: manager.full_name,
      email: manager.email,
      phone: manager.phone || '',
      employee_code: manager.employee_code,
      password: '',
      shop_id: manager.shop_id || 0
    });
    setShowManagerForm(true);
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8 text-slate-600" />
            Shop & Manager Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage shops, assign managers, and set targets</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="shops" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Shops ({shops.length})
            </TabsTrigger>
            <TabsTrigger value="managers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Managers ({managers.length})
            </TabsTrigger>
          </TabsList>

          {/* Shops Tab */}
          <TabsContent value="shops">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowShopForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shop
                </Button>
              </div>

              {/* Shop Cards */}
              <div className="grid grid-cols-2 gap-4">
                {shops.map((shop: Shop) => (
                  <Card key={shop.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-5 w-5 text-blue-600" />
                          {shop.shop_name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditShop(shop)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{shop.shop_code}</Badge>
                          {shop.is_active ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {shop.location}, {shop.district}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {shop.phone}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {shop.email}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            Monthly Target: ₹{shop.monthly_target.toLocaleString()}
                          </div>
                          {shop.manager_id && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              Manager: {managers.find((m: Manager) => m.id === shop.manager_id)?.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Shop Form */}
              {showShopForm && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>{editingShop ? 'Edit Shop' : 'Add New Shop'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShopSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Shop Name *</Label>
                          <Input
                            value={shopForm.shop_name}
                            onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Shop Code *</Label>
                          <Input
                            value={shopForm.shop_code}
                            onChange={(e) => setShopForm({ ...shopForm, shop_code: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Location *</Label>
                          <Input
                            value={shopForm.location}
                            onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>District *</Label>
                          <Input
                            value={shopForm.district}
                            onChange={(e) => setShopForm({ ...shopForm, district: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={shopForm.phone}
                            onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={shopForm.email}
                            onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Monthly Target (₹) *</Label>
                          <Input
                            type="number"
                            value={shopForm.monthly_target}
                            onChange={(e) => setShopForm({ ...shopForm, monthly_target: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowShopForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">{editingShop ? 'Update' : 'Create'} Shop</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Managers Tab */}
          <TabsContent value="managers">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowManagerForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manager
                </Button>
              </div>

              {/* Manager Cards */}
              <div className="grid grid-cols-2 gap-4">
                {managers.map((manager: Manager) => (
                  <Card key={manager.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-purple-600" />
                          {manager.full_name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditManager(manager)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{manager.employee_code}</Badge>
                          {manager.is_active ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {manager.email}
                          </div>
                          {manager.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              {manager.phone}
                            </div>
                          )}
                          {manager.shop_id && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Store className="h-4 w-4" />
                              Shop: {shops.find((s: Shop) => s.id === manager.shop_id)?.shop_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Manager Form */}
              {showManagerForm && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>{editingManager ? 'Edit Manager' : 'Add New Manager'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleManagerSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={managerForm.full_name}
                            onChange={(e) => setManagerForm({ ...managerForm, full_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Employee Code *</Label>
                          <Input
                            value={managerForm.employee_code}
                            onChange={(e) => setManagerForm({ ...managerForm, employee_code: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={managerForm.email}
                            onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={managerForm.phone}
                            onChange={(e) => setManagerForm({ ...managerForm, phone: e.target.value })}
                          />
                        </div>
                        {!editingManager && (
                          <div>
                            <Label>Password *</Label>
                            <Input
                              type="password"
                              value={managerForm.password}
                              onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                              required
                            />
                          </div>
                        )}
                        <div>
                          <Label>Assign to Shop</Label>
                          <select
                            className="w-full h-10 px-3 border rounded-md"
                            value={managerForm.shop_id}
                            onChange={(e) => setManagerForm({ ...managerForm, shop_id: Number(e.target.value) })}
                          >
                            <option value={0}>No shop assigned</option>
                            {shops.map((shop: Shop) => (
                              <option key={shop.id} value={shop.id}>{shop.shop_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowManagerForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">{editingManager ? 'Update' : 'Create'} Manager</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}