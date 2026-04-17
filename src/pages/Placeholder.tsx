import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description?: string;
  emoji?: string;
}

export default function Placeholder({ title, description, emoji = '🛠️' }: PlaceholderProps) {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>{emoji}</span> {title}
        </h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Construction className="h-5 w-5 text-warning" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This area is wired into the role-based routing structure. The full UI
          will be populated in a follow-up iteration.
        </CardContent>
      </Card>
    </div>
  );
}
