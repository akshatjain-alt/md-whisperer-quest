import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileText, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: number;
  prescription_id?: number;
  transaction_code: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
}

export default function AgentHistory() {
  const navigate = useNavigate();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async () => {
      const response = await apiService.get('/transactions?limit=50');
      return response.data?.transactions || [];
    },
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
            {transactions.map((t: Transaction) => {
              const printId = t.prescription_id ?? t.id;
              return (
                <Card key={t.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-role-agent/10 rounded-full flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-role-agent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{t.customer_name || 'Unknown Customer'}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {t.transaction_code} • {new Date(t.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-xl">₹{Number(t.total_amount || 0).toFixed(2)}</p>
                          <Badge variant="outline" className="mt-1">{t.payment_method?.toUpperCase()}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/agent/prescription/${printId}/print`)}
                          aria-label="Print prescription"
                        >
                          <Printer className="h-4 w-4 mr-1.5" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
