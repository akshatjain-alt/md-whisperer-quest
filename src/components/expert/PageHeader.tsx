import { type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  count?: number;
  countLabel?: string;
  actions?: React.ReactNode;
}

/**
 * Consistent header for every Expert workspace page.
 * Replaces the ad-hoc emoji+h1 patterns scattered across pages.
 */
export default function PageHeader({
  title,
  description,
  icon: Icon,
  count,
  countLabel = 'records',
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-role-expert-soft text-role-expert flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {typeof count === 'number' && (
              <Badge variant="secondary" className="text-xs font-semibold">
                {count.toLocaleString()} {countLabel}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
