import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import SeverityBadge from '@/components/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  name: z.string().min(2),
  local_name: z.string().optional(),
  manufacturer: z.string().optional(),
  active_ingredient: z.string().optional(),
  product_type: z.enum(['Fungicide', 'Insecticide', 'Fertilizer', 'Herbicide', 'Bio-agent']),
  formulation: z.string().optional(),
  pack_sizes: z.string().optional(),
  price_range: z.string().optional(),
  registration_number: z.string().optional(),
  safety_rating: z.enum(['Green', 'Yellow', 'Red']),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Product>[] = [
  { key: 'name', label: 'Product', render: (p) => <span className="font-medium">{p.name}</span> },
  { key: 'product_type', label: 'Type', render: (p) => <Badge variant="outline" className="text-xs">{p.product_type}</Badge> },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'active_ingredient', label: 'Active Ingredient' },
  { key: 'safety_rating', label: 'Safety', render: (p) => <SeverityBadge level={p.safety_rating} /> },
];

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({ name: '', product_type: 'Fungicide', safety_rating: 'Yellow' }); setShowForm(true); };
  const openEdit = (p: Product) => { setEditing(p); reset(p); setShowForm(true); };

  const onSubmit = (data: FormData) => {
    if (editing) { updateProduct(editing.id, data); toast({ title: 'Updated' }); }
    else { addProduct(data as Omit<Product, 'id' | 'created_at'>); toast({ title: 'Product added' }); }
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">💊 Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage agricultural products</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light"><Plus size={16} className="mr-2" /> Add Product</Button>
      </div>

      <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_420px]' : ''}`}>
        <DataTable data={products} columns={columns} searchKeys={['name', 'manufacturer', 'product_type']} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Product</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label>Product Name *</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
              <div><Label>Local Name</Label><Input {...register('local_name')} /></div>
              <div><Label>Manufacturer</Label><Input {...register('manufacturer')} /></div>
              <div><Label>Active Ingredient</Label><Input {...register('active_ingredient')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Product Type</Label>
                  <Select defaultValue={editing?.product_type || 'Fungicide'} onValueChange={(v) => setValue('product_type', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Fungicide','Insecticide','Fertilizer','Herbicide','Bio-agent'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Safety Rating</Label>
                  <Select defaultValue={editing?.safety_rating || 'Yellow'} onValueChange={(v) => setValue('safety_rating', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Green','Yellow','Red'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Formulation</Label><Input {...register('formulation')} placeholder="EC, WP, SC, Granules" /></div>
              <div><Label>Pack Sizes</Label><Input {...register('pack_sizes')} placeholder="100ml, 250ml, 500ml, 1L" /></div>
              <div><Label>Price Range</Label><Input {...register('price_range')} placeholder="₹200 - ₹500" /></div>
              <div><Label>Registration Number</Label><Input {...register('registration_number')} placeholder="CIB number" /></div>
              <div><Label>Description</Label><Textarea {...register('description')} rows={2} /></div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light">{editing ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Product" description="Are you sure?" onConfirm={() => { deleteProduct(deleteId!); setDeleteId(null); toast({ title: 'Deleted' }); }} />
    </div>
  );
}
