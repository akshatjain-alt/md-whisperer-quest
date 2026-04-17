import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Search, 
  User, 
  ShoppingCart, 
  Printer, 
  RotateCcw, 
  Plus, 
  Minus,
  CheckCircle,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Package,
  History,
  Award,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface Customer {
  id: number;
  customer_code: string;
  full_name: string;
  village: string;
  district: string;
  phone_primary_display?: string;
  total_purchases: number;
  total_visits: number;
}

interface Product {
  id: number;
  product_name: string;
  selling_price: number;
  stock_quantity: number;
  product_category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Transaction {
  id: number;
  transaction_code: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
  items_count: number;
}

export default function AgentWorkflowNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prescriptionStep, setPrescriptionStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'code' | 'phone'>('name');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [transactionId, setTransactionId] = useState<number | null>(null);

  // Search customers
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    refetch: searchCustomers,
    error: searchError 
  } = useQuery({
    queryKey: ['customer-search', searchQuery, searchType],
    queryFn: async () => {
      console.log('📡 API Call - Customer Search', { query: searchQuery, type: searchType });
      if (!searchQuery || searchQuery.trim().length < 2) {
        console.log('❌ Query too short, returning empty');
        return [];
      }
      const response = await apiService.get(`/customers/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`);
      console.log('✅ API Response:', response.data);
      const results = Array.isArray(response.data) ? response.data : [];
      console.log('📊 Parsed results:', results);
      return results;
    },
    enabled: false,
    retry: 1
  });

  // Get products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiService.get('/products');
      return response.data?.data || response.data || [];
    }
  });

  // Get agent's transaction history
  const { data: transactions = [] } = useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async () => {
      const response = await apiService.get('/transactions?limit=20');
      return response.data?.transactions || [];
    }
  });

  // Create transaction
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiService.post('/transactions', data);
      return response.data;
    },
    onSuccess: (data) => {
      setTransactionId(data.id);
      setPrescriptionStep(4);
      toast({ 
        title: '✓ Sale Completed', 
        description: 'Transaction processed successfully' 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Transaction Failed', 
        description: error.response?.data?.message || 'Failed to complete sale', 
        variant: 'destructive' 
      });
    }
  });

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    console.log('🔍 handleSearch called', { searchQuery: trimmed, searchType });
    if (trimmed.length < 2) {
      toast({
        title: 'Search Query Too Short',
        description: 'Please enter at least 2 characters',
        variant: 'destructive'
      });
      return;
    }
    console.log('🚀 Calling searchCustomers()');
    searchCustomers();
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPrescriptionStep(2);
  };

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.product_name} is currently out of stock`,
        variant: 'destructive'
      });
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast({
            title: 'Stock Limit Reached',
            description: `Only ${product.stock_quantity} units available`,
            variant: 'destructive'
          });
          return prevCart;
        }
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }

    setCart(prevCart => {
      const item = prevCart.find(i => i.product.id === productId);
      if (item && newQuantity > item.product.stock_quantity) {
        toast({
          title: 'Stock Limit',
          description: `Only ${item.product.stock_quantity} units available`,
          variant: 'destructive'
        });
        return prevCart;
      }
      return prevCart.map(i =>
        i.product.id === productId ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.product.selling_price * item.quantity), 0
    );
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * 0.18;
    const total = taxableAmount + tax;

    return { subtotal, discountAmount, tax, total };
  };

  const handleCompleteSale = () => {
    if (!selectedCustomer || cart.length === 0) {
      toast({ 
        title: 'Cannot Complete Sale', 
        description: 'Cart is empty', 
        variant: 'destructive' 
      });
      return;
    }

    const { discountAmount } = calculateTotals();

    createTransaction.mutate({
      customer_id: selectedCustomer.id,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.selling_price
      })),
      discount_amount: discountAmount,
      payment_method: paymentMethod
    });
  };

  const handleReset = () => {
    setPrescriptionStep(1);
    setSelectedCustomer(null);
    setCart([]);
    setDiscount(0);
    setPaymentMethod('cash');
    setTransactionId(null);
    setSearchQuery('');
  };

  const handleStartNewPrescription = () => {
    setActiveTab('prescription');
    handleReset();
  };

  const totals = calculateTotals();

  // Mock stats
  const stats = {
    todaySales: 5420,
    todayCustomers: 8,
    monthlyTarget: 200000,
    monthlyAchieved: 145000,
    totalCustomers: transactions.length || 156
  };

  const achievementPercent = (stats.monthlyAchieved / stats.monthlyTarget) * 100;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Tab Navigation */}
      <div className="border-b bg-card px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <TrendingUp className="inline h-4 w-4 mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('prescription')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
            activeTab === 'prescription'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <Package className="inline h-4 w-4 mr-2" />
          Prescription
          {cart.length > 0 && (
            <Badge className="ml-2 bg-destructive text-destructive-foreground">{cart.length}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <History className="inline h-4 w-4 mr-2" />
          History
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground mt-1">Your performance overview</p>
                </div>
                <Button 
                  onClick={handleStartNewPrescription}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Customer
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Today's Sales</p>
                        <p className="text-3xl font-bold">₹{stats.todaySales.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-10 w-10 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Customers Today</p>
                        <p className="text-3xl font-bold">{stats.todayCustomers}</p>
                      </div>
                      <Users className="h-10 w-10 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Customers</p>
                        <p className="text-3xl font-bold">{stats.totalCustomers}</p>
                      </div>
                      <Award className="h-10 w-10 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Achievement</p>
                        <p className="text-3xl font-bold">{achievementPercent.toFixed(0)}%</p>
                      </div>
                      <Target className="h-10 w-10 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => { setActiveTab('prescription'); handleReset(); }}
                    size="lg"
                    className="h-24 flex flex-col gap-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>New Prescription</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('history')}
                    variant="outline"
                    size="lg"
                    className="h-24 flex flex-col gap-2"
                  >
                    <History className="h-6 w-6" />
                    <span>View History</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'prescription' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {prescriptionStep === 1 && (
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold mb-2">Find Customer</h1>
                  <p className="text-muted-foreground mb-6">Search by name, code, or phone</p>

                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex gap-3 justify-center">
                        {(['name', 'code', 'phone'] as const).map((type) => (
                          <Button
                            key={type}
                            variant={searchType === type ? 'default' : 'outline'}
                            onClick={() => setSearchType(type)}
                            className="capitalize"
                          >
                            {type}
                          </Button>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Input
                          placeholder={
                            searchType === 'name' ? 'Enter name (e.g., Rajesh)...' :
                            searchType === 'code' ? 'Enter code (SKF0001)...' :
                            'Enter phone number...'
                          }
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          className="h-12"
                        />
                        <Button onClick={handleSearch} disabled={searchLoading} size="lg">
                          {searchLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </Button>
                      </div>

                      {searchResults && searchResults.length > 0 && (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {searchResults.map((customer: Customer) => (
                            <Card 
                              key={customer.id}
                              className="cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-bold">{customer.full_name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {customer.customer_code} • {customer.village}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                                    <p className="font-bold text-primary">₹{Number(customer.total_purchases || 0).toFixed(2)}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {prescriptionStep === 2 && selectedCustomer && (
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <Button variant="outline" onClick={() => setPrescriptionStep(1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold">{selectedCustomer.full_name}</h1>
                      <p className="text-muted-foreground">{selectedCustomer.customer_code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Products</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                        {products.map((product: Product) => (
                          <Card key={product.id} className="hover:bg-accent transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold">{product.product_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.product_category} • Stock: {product.stock_quantity}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <p className="font-bold text-lg">₹{product.selling_price}</p>
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock_quantity <= 0}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cart ({cart.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {cart.length === 0 ? (
                          <div className="text-center py-12">
                            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Cart is empty</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                              {cart.map((item) => (
                                <div key={item.product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium">{item.product.product_name}</p>
                                    <p className="text-sm text-muted-foreground">₹{item.product.selling_price} each</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <p className="w-24 text-right font-bold">
                                      ₹{(item.product.selling_price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-t pt-4 space-y-3">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-bold">₹{totals.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Discount (%):</span>
                                <Input
                                  type="number"
                                  value={discount}
                                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                  className="w-20 text-right"
                                  min="0"
                                  max="100"
                                />
                              </div>
                              {discount > 0 && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Discount Amount:</span>
                                  <span>-₹{totals.discountAmount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Tax (18%):</span>
                                <span>₹{totals.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                                <span>Total:</span>
                                <span>₹{totals.total.toFixed(2)}</span>
                              </div>

                              <Button
                                className="w-full"
                                size="lg"
                                onClick={() => setPrescriptionStep(3)}
                                disabled={cart.length === 0}
                              >
                                Proceed to Payment
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {prescriptionStep === 3 && (
              <div className="flex-1 flex items-center justify-center p-6">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">Select Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {(['cash', 'card', 'upi'] as const).map((method) => (
                        <Button
                          key={method}
                          variant={paymentMethod === method ? 'default' : 'outline'}
                          className="h-24 text-lg capitalize"
                          onClick={() => setPaymentMethod(method)}
                        >
                          {method}
                        </Button>
                      ))}
                    </div>

                    <div className="bg-muted rounded-lg p-6 space-y-3">
                      <h3 className="font-bold text-lg mb-4">Bill Summary</h3>
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-medium">{selectedCustomer?.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{cart.length}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <span className="font-semibold">Total Amount:</span>
                        <span className="font-bold text-2xl text-primary">₹{totals.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setPrescriptionStep(2)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleCompleteSale}
                        disabled={createTransaction.isPending}
                        className="flex-1"
                        size="lg"
                      >
                        {createTransaction.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Complete Sale'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {prescriptionStep === 4 && (
              <div className="flex-1 flex items-center justify-center p-6">
                <Card className="w-full max-w-2xl">
                  <CardHeader className="text-center bg-primary/5">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl text-primary">Sale Completed!</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">Transaction ID</p>
                      <p className="text-2xl font-mono font-bold">{transactionId}</p>
                    </div>

                    <div className="bg-muted rounded-lg p-6 space-y-3">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-medium">{selectedCustomer?.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium uppercase">{paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{cart.length}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t font-bold text-lg">
                        <span>Total Paid:</span>
                        <span className="text-primary">₹{totals.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.print()}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Receipt
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          handleReset();
                          setActiveTab('dashboard');
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Done
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground mt-1">View all your past transactions</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((t: Transaction) => (
                        <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}