import { Badge } from '@/components/ui/badge';

interface SeverityBadgeProps {
  level: string;
}

const colorMap: Record<string, string> = {
  Low: 'bg-success/10 text-success border-success/20',
  Mild: 'bg-success/10 text-success border-success/20',
  Green: 'bg-success/10 text-success border-success/20',
  Slow: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Moderate: 'bg-warning/10 text-warning border-warning/20',
  Yellow: 'bg-warning/10 text-warning border-warning/20',
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Severe: 'bg-destructive/10 text-destructive border-destructive/20',
  Red: 'bg-destructive/10 text-destructive border-destructive/20',
  Fast: 'bg-destructive/10 text-destructive border-destructive/20',
  Critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function SeverityBadge({ level }: SeverityBadgeProps) {
  return (
    <Badge variant="outline" className={`text-xs font-medium ${colorMap[level] || ''}`}>
      {level}
    </Badge>
  );
}
