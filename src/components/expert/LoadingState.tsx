import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-3 text-role-expert" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
