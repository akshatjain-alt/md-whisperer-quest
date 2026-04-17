import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Product } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  product_name: z.string().min(2),
  product_category: z.string().optional(),
  manufacturer: z.string().optional(),
  active_ingredient: z.string().optional(),
  formulation: z.string().optional(),
  description: z.string().optional(),
  selling_price: z.number().optional(),
  cost_price: z.number().optional(),
  mrp: z.number().optional(),
  stock_quantity: z.number().optional(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Product>[] = [
  { key: 'product_name', label: 'Product', render: (p) => <span className="font-medium">{p.product_name}</span> },
  { key: 'product_category', label: 'Category', render: (p) => p.product_category ? <Badge variant="outline">{p.product_category}</Badge> : '-' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'selling_price', label: 'Price', render: (p) => p.selling_price ? `₹${p.selling_price}` : '-' },
  { key: 'stock_quantity', label: 'Stock', render: (p) => p.stock_quantity || 0 },
];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Fetch products from backend
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiService.get('/products');
      return response.data?.data || [];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiService.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product added successfully' });
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to add product', variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiService.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product updated successfully' });
      setShowForm(false);
      setEditing(null);
      reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update product', variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.delete('products', id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete product', variant: 'destructive' });
    }
  });

  const openNew = () => { 
    setEditing(null); 
    reset({}); 
    setShowForm(true); 
  };
  
  const openEdit = (p: Product) => { 
    setEditing(p); 
    reset({
      product_name: p.product_name,
      product_category: p.product_category || '',
      manufacturer: p.manufacturer || '',
      active_ingredient: p.active_ingredient || '',
      formulation: p.formulation || '',
      description: p.description || '',
      selling_price: p.selling_price || undefined,
      cost_price: p.cost_price || undefined,
      mrp: p.mrp || undefined,
      stock_quantity: p.stock_quantity || undefined,
    }); 
    setShowForm(true); 
  };

  const onSubmit = (data: FormData) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">💊 Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product catalog</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light"><Plus size={16} className="mr-2" /> Add Product</Button>
      </div>

      <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_420px]' : ''}`}>
        <DataTable 
          data={products} 
          columns={columns as any} 
          searchKeys={['product_name', 'product_category', 'manufacturer']} 
          onEdit={openEdit as any} 
          onDelete={(id) => setDeleteId(Number(id))} 
        />

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Product</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Product Name *</Label>
                <Input {...register('product_name')} />
                {errors.product_name && <p className="text-xs text-destructive mt-1">{errors.product_name.message}</p>}
              </div>
              <div>
                <Label>Category</Label>
                <Input {...register('product_category')} placeholder="fungicide, insecticide, etc." />
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input {...register('manufacturer')} />
              </div>
              <div>
                <Label>Active Ingredient</Label>
                <Input {...register('active_ingredient')} />
              </div>
              <div>
                <Label>Formulation</Label>
                <Input {...register('formulation')} placeholder="EC, WP, SL, etc." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Cost Price</Label>
                  <Input type="number" step="0.01" {...register('cost_price', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label>Selling Price</Label>
                  <Input type="number" step="0.01" {...register('selling_price', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label>MRP</Label>
                  <Input type="number" step="0.01" {...register('mrp', { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input type="number" {...register('stock_quantity', { valueAsNumber: true })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register('description')} rows={2} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1">Cancel</Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={() => setDeleteId(null)} 
        title="Delete Product" 
        description="Are you sure? This action cannot be undone." 
        onConfirm={handleDelete} 
      />
    </div>
  );
}