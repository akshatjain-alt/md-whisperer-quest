import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// Lightweight Manager pages — wired into routing, ready for real data.
export function ManagerAgents() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-4">
      <header><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-role-manager" /> My Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">Track agent performance in your shop.</p></header>
      <Card><CardHeader><CardTitle className="text-base">Agent roster</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Performance metrics will load from <code className="bg-muted px-1 rounded">/analytics/dashboard/manager/:id</code>.
          Pair with the dashboard for the full team view.
          <div className="mt-3"><Button asChild variant="outline" size="sm"><Link to="/manager/dashboard">Open dashboard</Link></Button></div>
        </CardContent></Card>
    </div>
  );
}

export function ManagerInventory() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-4">
      <header><h1 className="text-2xl font-bold flex items-center gap-2">📦 Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">Stock levels for your shop location.</p></header>
      <Card><CardContent className="p-6 text-sm text-muted-foreground">Inventory feed will populate once a shop-scoped products endpoint is wired up.</CardContent></Card>
    </div>
  );
}

export function ManagerTargets() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-4">
      <header><h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-role-manager" /> Targets</h1>
        <p className="text-sm text-muted-foreground mt-1">Monthly goals and progress for your team.</p></header>
      <Card><CardContent className="p-6 text-sm text-muted-foreground flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-success" />
        Connect to <code className="bg-muted px-1 rounded">/analytics</code> targets to render live progress bars.
      </CardContent></Card>
    </div>
  );
}
