import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string; // omit for current page
}

/**
 * Compact, role-themed breadcrumbs for article and section pages.
 * Render at the top of a page; the last crumb is treated as current.
 */
export default function Breadcrumbs({ items, accentClass }: { items: Crumb[]; accentClass?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted-foreground mb-2">
      <Link to="/" className="hover:text-foreground inline-flex items-center" aria-label="Home">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="inline-flex items-center">
            <ChevronRight className="h-3 w-3 mx-1 opacity-60" />
            {isLast || !c.to ? (
              <span className={`font-medium ${accentClass ?? 'text-foreground'}`}>{c.label}</span>
            ) : (
              <Link to={c.to} className="hover:text-foreground">{c.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
