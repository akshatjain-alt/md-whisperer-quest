import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Shield, CheckCircle, XCircle } from 'lucide-react';

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-700';
    case 'expert': return 'bg-blue-100 text-blue-700';
    case 'agent': return 'bg-green-100 text-green-700';
    case 'viewer': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getRoleDescription = (role: string) => {
  switch (role) {
    case 'admin': return 'Full system access + analytics';
    case 'expert': return 'Database management (CRUD)';
    case 'agent': return 'Generate prescriptions only';
    case 'viewer': return 'Read-only access';
    default: return '';
  }
};

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<{userId: number, newRole: string} | null>(null);

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await apiService.api.get('/auth/users');
      return response.data.data;
    },
  });

  // Fetch pending users
  const { data: pendingUsers = [] } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const response = await apiService.api.get('/auth/pending-users');
      return response.data.data;
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiService.api.put(`/auth/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast({ title: 'User role updated successfully' });
      setEditingRole(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update role',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiService.api.post(`/auth/approve-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast({ title: 'User approved successfully' });
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiService.api.delete(`/auth/reject-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      toast({ title: 'User registration rejected' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeUsers = users.filter((u: any) => u.is_active);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage users and assign roles</p>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Shield className="h-5 w-5" />
              Pending Approvals
              <Badge className="bg-amber-200 text-amber-900">{pendingUsers.length}</Badge>
            </CardTitle>
            <CardDescription className="text-amber-800">Review new user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pendingUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-amber-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username} • {user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role.toUpperCase()}</Badge>
                      <span className="text-xs text-muted-foreground">• {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(user.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Users
            <Badge>{activeUsers.length}</Badge>
          </CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {activeUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username} • {user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {editingRole?.userId === user.id ? (
                    <>
                      <Select
                        value={editingRole.newRole}
                        onValueChange={(value) => setEditingRole({ userId: user.id, newRole: value })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin - Full Access</SelectItem>
                          <SelectItem value="expert">Expert - Database Manager</SelectItem>
                          <SelectItem value="agent">Agent - Prescription Only</SelectItem>
                          <SelectItem value="viewer">Viewer - Read Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => updateRoleMutation.mutate({ userId: user.id, role: editingRole.newRole })}
                        disabled={updateRoleMutation.isPending}
                      >
                        {updateRoleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRole(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <Badge className={`${getRoleBadgeColor(user.role)} mb-1`}>
                          {user.role.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{getRoleDescription(user.role)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRole({ userId: user.id, newRole: user.role })}
                      >
                        Change Role
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
          <CardDescription>Understanding user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-red-100 text-red-700 mb-2">ADMIN</Badge>
              <p className="text-sm font-medium mb-2">Business Owner / Manager</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✅ View all transactions & analytics</li>
                <li>✅ Manage users & assign roles</li>
                <li>✅ Access financial reports</li>
                <li>✅ Full system access</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-blue-100 text-blue-700 mb-2">EXPERT</Badge>
              <p className="text-sm font-medium mb-2">Agricultural Knowledge Manager</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✅ Full database CRUD access</li>
                <li>✅ Manage crops, symptoms, diagnoses</li>
                <li>✅ Update products & prescriptions</li>
                <li>❌ No transaction/sales data</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-green-100 text-green-700 mb-2">AGENT</Badge>
              <p className="text-sm font-medium mb-2">Shop Employee / Field Agent</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✅ Simple diagnosis interface</li>
                <li>✅ Generate PDF prescriptions</li>
                <li>✅ Help farmers at shop</li>
                <li>❌ No database editing</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-gray-100 text-gray-700 mb-2">VIEWER</Badge>
              <p className="text-sm font-medium mb-2">Educational / Public Access</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✅ Read-only Wikipedia-like access</li>
                <li>✅ Browse crops & treatments</li>
                <li>✅ Educational purposes</li>
                <li>❌ Cannot create or edit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}