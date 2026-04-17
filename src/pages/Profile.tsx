import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Shield, Calendar, Loader2 } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

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
    case 'admin': return 'Full system access with user management';
    case 'expert': return 'Can manage advanced agricultural data';
    case 'agent': return 'Can add and view crop data';
    case 'viewer': return 'Read-only access to all data';
    default: return 'User role';
  }
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      // TODO: Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({ title: 'Password changed successfully' });
      reset();
    } catch (error) {
      toast({ 
        title: 'Failed to change password', 
        description: 'Please check your current password',
        variant: 'destructive' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">👤 Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Placeholder */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || user.username[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getRoleBadgeColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{getRoleDescription(user.role)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
              </div>

              {user.last_login && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.last_login).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {user.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword"
                  type="password" 
                  {...register('currentPassword')} 
                  placeholder="Enter current password"
                  disabled={isChangingPassword}
                />
                {errors.currentPassword && <p className="text-xs text-destructive mt-1">{errors.currentPassword.message}</p>}
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword"
                  type="password" 
                  {...register('newPassword')} 
                  placeholder="Enter new password (min 8 characters)"
                  disabled={isChangingPassword}
                />
                {errors.newPassword && <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  {...register('confirmPassword')} 
                  placeholder="Confirm new password"
                  disabled={isChangingPassword}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => reset()}
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isChangingPassword}
                  className="flex-1 bg-primary hover:bg-primary-light"
                >
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Role Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>What you can do in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.role === 'admin' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Full system access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">User management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">All CRUD operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Delete capabilities</span>
                  </div>
                </>
              )}
              {user.role === 'agent' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Read all data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Create crops and symptoms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Update symptoms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-muted-foreground">Cannot delete items</span>
                  </div>
                </>
              )}
              {user.role === 'expert' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Read all data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Create and update advanced data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Manage diagnoses and prescriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-muted-foreground">Limited delete access</span>
                  </div>
                </>
              )}
              {user.role === 'viewer' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Read all data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-muted-foreground">Cannot create, update, or delete</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending User Approvals (Admin Only) */}
        {user.role === 'admin' && <PendingUsersCard />}
      </div>
    </div>
  );
}

// Pending Users Component
function PendingUsersCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending users
  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const response = await apiService.api.get('/auth/pending-users');
      return response.data.data;
    },
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiService.api.post(`/auth/approve-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      toast({ title: 'User approved successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to approve user',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
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
    onError: (error: any) => {
      toast({
        title: 'Failed to reject user',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Pending User Approvals
          {pendingUsers.length > 0 && (
            <Badge className="bg-red-100 text-red-700">
              {pendingUsers.length} pending
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Review and approve new user registrations</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending user registrations
          </p>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username} • {user.email}</p>
                  <Badge className="mt-2 text-xs">{user.role.toUpperCase()}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(user.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}