import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sprout, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['agent', 'expert', 'viewer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register-public`, {
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name,
        role: data.role,
      });

      toast({
        title: 'Registration successful!',
        description: 'Your account is pending admin approval. You will be notified once approved.',
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">
              Create Account
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-500 mt-2">
              Smart Kisan Bharat - Crop Clinic
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-bold text-slate-700">
                Full Name *
              </Label>
              <Input
                id="full_name"
                placeholder="Enter your full name"
                {...register('full_name')}
                disabled={isLoading}
                className="h-12 text-base border-slate-200 focus:border-green-500"
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold text-slate-700">
                Username *
              </Label>
              <Input
                id="username"
                placeholder="Choose a username"
                {...register('username')}
                disabled={isLoading}
                className="h-12 text-base border-slate-200 focus:border-green-500"
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                disabled={isLoading}
                className="h-12 text-base border-slate-200 focus:border-green-500"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-bold text-slate-700">
                I am a *
              </Label>
              <Select onValueChange={(value) => setValue('role', value as any)} disabled={isLoading}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Field Agent - Help farmers diagnose crops</SelectItem>
                  <SelectItem value="expert">Agricultural Expert - Manage diagnoses</SelectItem>
                  <SelectItem value="viewer">Viewer - View data only</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-slate-700">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="h-12 text-base border-slate-200 focus:border-green-500"
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              <p className="text-xs text-slate-500">Must be 8+ chars with uppercase, lowercase, number & special char</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="h-12 text-base border-slate-200 focus:border-green-500"
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-800 font-medium">⚠️ Account Approval Required</p>
            <p className="text-xs text-amber-700 mt-1">Your account will be reviewed by an admin before you can login.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}