import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ResourceMutationOptions<TData, TForm> {
  /** React-query key invalidated after each mutation. */
  queryKey: unknown[];
  /** Human label for toasts ("Crop", "Symptom", …). */
  label: string;
  create: (data: TForm) => Promise<TData>;
  update: (args: { id: number; data: TForm }) => Promise<TData>;
  remove: (id: number) => Promise<unknown>;
  /** Optional callbacks for additional cleanup (close form, clear editing, etc.). */
  onCreated?: () => void;
  onUpdated?: () => void;
  onRemoved?: () => void;
}

/**
 * Bundles the create/update/delete react-query mutations every Expert
 * resource page repeats. Standardizes error toasts and invalidation.
 */
export function useResourceMutations<TData, TForm>({
  queryKey,
  label,
  create,
  update,
  remove,
  onCreated,
  onUpdated,
  onRemoved,
}: ResourceMutationOptions<TData, TForm>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const errorToast = (verb: string) => (error: any) => {
    toast({
      title: `Failed to ${verb} ${label.toLowerCase()}`,
      description: error?.response?.data?.message || error?.message || 'An unexpected error occurred',
      variant: 'destructive',
    });
  };

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: `${label} created` });
      onCreated?.();
    },
    onError: errorToast('create'),
  });

  const updateMutation = useMutation({
    mutationFn: update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: `${label} updated` });
      onUpdated?.();
    },
    onError: errorToast('update'),
  });

  const deleteMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: `${label} deleted` });
      onRemoved?.();
    },
    onError: errorToast('delete'),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}
