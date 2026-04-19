import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Package, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: number;
  transaction_code: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
}

export default function AgentHistory() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async () => {
      const response = await apiService.get('/transactions?limit=50');
      return response.data?.transactions || [];
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">View all your past prescriptions and sales</p>
        </div>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((t: Transaction) => (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{t.customer_name || 'Unknown Customer'}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.transaction_code} • {new Date(t.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">₹{Number(t.total_amount || 0).toFixed(2)}</p>
                      <Badge variant="outline" className="mt-1">{t.payment_method?.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}