import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pill, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Product } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/expert/PageHeader';
import ResourceFormSheet from '@/components/expert/ResourceFormSheet';
import LoadingState from '@/components/expert/LoadingState';
import EmptyState from '@/components/expert/EmptyState';
import { useResourceMutations } from '@/hooks/useResourceMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const LOW_STOCK_THRESHOLD = 10;

const schema = z.object({
  product_name: z.string().min(2, 'Name must be at least 2 characters'),
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

const formatPrice = (n?: number) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—');

const columns: Column<Product>[] = [
  { key: 'product_name', label: 'Product', render: (p) => <span className="font-medium">{p.product_name}</span> },
  { key: 'product_category', label: 'Category', render: (p) => p.product_category ? <Badge variant="outline" className="text-xs">{p.product_category}</Badge> : '—' },
  { key: 'manufacturer', label: 'Manufacturer', render: (p) => p.manufacturer || '—' },
  { key: 'active_ingredient', label: 'Active', render: (p) => p.active_ingredient ? <span className="italic text-xs text-muted-foreground">{p.active_ingredient}</span> : '—' },
  { key: 'selling_price', label: 'Price', render: (p) => formatPrice(p.selling_price), csvAccessor: (p) => p.selling_price ?? '' },
  { key: 'stock_quantity', label: 'Stock', render: (p) => {
      const q = p.stock_quantity ?? 0;
      const tone = q === 0 ? 'bg-destructive/10 text-destructive' : q <= LOW_STOCK_THRESHOLD ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success';
      return <Badge variant="outline" className={`text-xs ${tone}`}>{q}</Badge>;
    } },
];

export default function ProductsPage() {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const r = await apiService.get('/products');
      return r.data?.data || [];
    },
  });

  const lowStock = useMemo(
    () => products.filter((p) => typeof p.stock_quantity === 'number' && p.stock_quantity <= LOW_STOCK_THRESHOLD),
    [products]
  );

  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };
  const { createMutation, updateMutation, deleteMutation, isSubmitting } = useResourceMutations<Product, FormData>({
    queryKey: ['products'],
    label: 'Product',
    create: async (data) => (await apiService.post('/products', data)).data,
    update: async ({ id, data }) => (await apiService.put(`/products/${id}`, data)).data,
    remove: (id) => apiService.delete('products', id),
    onCreated: closeForm,
    onUpdated: closeForm,
    onRemoved: () => setDeleteId(null),
  });

  const openNew = () => { setEditing(null); reset({}); setShowForm(true); };
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
  const onSubmit = handleSubmit((data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Pill}
        title="Products"
        description="Catalog of inputs prescribed by agents and reported in analytics."
        count={products.length}
        countLabel="products"
        actions={
          <Button onClick={openNew}>
            <Plus size={16} className="mr-1.5" /> Add product
          </Button>
        }
      />

      {lowStock.length > 0 && (
        <Card className="mb-4 border-warning/40 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">
                {lowStock.length} product{lowStock.length === 1 ? '' : 's'} at or below {LOW_STOCK_THRESHOLD} units in stock
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {lowStock.slice(0, 4).map((p) => p.product_name).join(', ')}
                {lowStock.length > 4 ? ` and ${lowStock.length - 4} more` : ''}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingState label="Loading products…" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No products yet"
          description="Add the first product to your catalog to start prescribing it."
          actionLabel="Add product"
          onAction={openNew}
        />
      ) : (
        <DataTable
          data={products}
          columns={columns as any}
          searchKeys={['product_name', 'product_category', 'manufacturer', 'active_ingredient']}
          onEdit={openEdit as any}
          onDelete={(id) => setDeleteId(Number(id))}
          exportFilename="products"
        />
      )}

      <ResourceFormSheet
        open={showForm}
        onOpenChange={(o) => (o ? setShowForm(true) : closeForm())}
        title="product"
        isEditing={!!editing}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <div>
          <Label htmlFor="product_name">Product name *</Label>
          <Input id="product_name" {...register('product_name')} disabled={isSubmitting} />
          {errors.product_name && <p className="text-xs text-destructive mt-1">{errors.product_name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="product_category">Category</Label>
            <Input id="product_category" {...register('product_category')} placeholder="fungicide, fertilizer…" disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input id="manufacturer" {...register('manufacturer')} disabled={isSubmitting} />
          </div>
        </div>
        <div>
          <Label htmlFor="active_ingredient">Active ingredient</Label>
          <Input id="active_ingredient" {...register('active_ingredient')} disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="formulation">Formulation</Label>
          <Input id="formulation" {...register('formulation')} placeholder="EC, WP, SL…" disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="cost_price">Cost (₹)</Label>
            <Input id="cost_price" type="number" step="0.01" {...register('cost_price', { valueAsNumber: true })} disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="selling_price">Selling (₹)</Label>
            <Input id="selling_price" type="number" step="0.01" {...register('selling_price', { valueAsNumber: true })} disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="mrp">MRP (₹)</Label>
            <Input id="mrp" type="number" step="0.01" {...register('mrp', { valueAsNumber: true })} disabled={isSubmitting} />
          </div>
        </div>
        <div>
          <Label htmlFor="stock_quantity">Stock quantity</Label>
          <Input id="stock_quantity" type="number" {...register('stock_quantity', { valueAsNumber: true })} disabled={isSubmitting} />
          <p className="text-[11px] text-muted-foreground mt-1">Alerts trigger at or below {LOW_STOCK_THRESHOLD} units.</p>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={3} disabled={isSubmitting} />
        </div>
      </ResourceFormSheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete product"
        description="Removing this product will detach it from any prescriptions. Continue?"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
