import { Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface ResourceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  /** Optional override for the primary button label. */
  submitLabel?: string;
}

/**
 * Right-side overlay for create/edit forms across expert pages.
 * Replaces the cramped inline column layouts and scrolls cleanly on mobile.
 */
export default function ResourceFormSheet({
  open,
  onOpenChange,
  title,
  description,
  isEditing,
  isSubmitting,
  onSubmit,
  children,
  submitLabel,
}: ResourceFormSheetProps) {
  const label = submitLabel ?? (isEditing ? 'Update' : 'Save');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>{isEditing ? `Edit ${title}` : `New ${title}`}</SheetTitle>
          {description && (
            <SheetDescription className="text-xs">{description}</SheetDescription>
          )}
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
            {children}
          </div>
          <SheetFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {label}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
