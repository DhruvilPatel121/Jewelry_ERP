import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { customersApi, salesApi, purchasesApi, paymentsApi } from '@/db/api';
import type { Customer, Sale, Purchase, Payment } from '@/types';
import { ArrowLeft, Edit, Phone, MapPin, FileText, RefreshCcw, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ActionButtons from '@/components/ActionButtons';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [customerData, salesData, purchasesData, paymentsData] = await Promise.all([
        customersApi.getById(id),
        salesApi.getByCustomer(id),
        purchasesApi.getByCustomer(id),
        paymentsApi.getByCustomer(id),
      ]);

      setCustomer(customerData);
      setSales(salesData);
      setPurchases(purchasesData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number | null) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatFine = (fine: number | null) => {
    return `${(fine || 0).toFixed(3)}g`;
  };
  
  const handleRecalculate = async () => {
    if (!customer) return;
    try {
      await customersApi.recalculateBalances(customer.id);
      toast.success('Balances recalculated');
      await loadData();
    } catch (error) {
      console.error('Failed to recalculate balances:', error);
      toast.error('Failed to recalculate');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;
    try {
      await customersApi.delete(customer.id);
      toast.success('Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      await salesApi.delete(saleId);
      toast.success('Sale deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to delete sale:', error);
      toast.error('Failed to delete sale');
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    try {
      await purchasesApi.delete(purchaseId);
      toast.success('Purchase deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to delete purchase:', error);
      toast.error('Failed to delete purchase');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await paymentsApi.delete(paymentId);
      toast.success('Payment deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to delete payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-full bg-muted" />
        <Skeleton className="h-40 w-full bg-muted" />
        <Skeleton className="h-96 w-full bg-muted" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <p className="text-center text-muted-foreground">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold flex-1">{customer.name}</h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(`/add-customer?edit=${customer.id}`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRecalculate}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {customer.name}? This action cannot be undone and will also delete all associated transactions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCustomer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{customer.mobile_no}</p>
              </div>
            </div>
            {customer.city && (
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.city}</p>
                </div>
              </div>
            )}
          </div>
          {customer.gst_no && (
            <div>
              <p className="text-sm text-muted-foreground">GST No</p>
              <p className="font-medium mt-1">{customer.gst_no}</p>
            </div>
          )}
          {customer.address && (
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium mt-1">{customer.address}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Closing Amount</p>
              <p className={`text-lg font-bold mt-1 ${customer.closing_amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatAmount(Math.abs(customer.closing_amount))} {customer.closing_amount >= 0 ? 'DR' : 'CR'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Closing Fine</p>
              <p className={`text-lg font-bold mt-1 ${customer.closing_fine >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatFine(Math.abs(customer.closing_fine))} {customer.closing_fine >= 0 ? 'DR' : 'CR'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 mt-4">
              {[...sales, ...purchases, ...payments].length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    ...sales.map(s => ({ ...s, type: 'sale' as const })),
                    ...purchases.map(p => ({ ...p, type: 'purchase' as const })),
                    ...payments.map(p => ({ ...p, type: 'payment' as const })),
                  ]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <div key={transaction.id} className="p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                transaction.type === 'sale' ? 'bg-success/10 text-success' :
                                transaction.type === 'purchase' ? 'bg-warning/10 text-warning' :
                                'bg-primary/10 text-primary'
                              }`}>
                                {transaction.type.toUpperCase()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(transaction.date), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            {'item_name' in transaction && (
                              <p className="font-medium mt-2 truncate">{transaction.item_name}</p>
                            )}
                            {'payment_type' in transaction && (
                              <p className="font-medium mt-2 capitalize">{transaction.payment_type.replace('_', ' ')}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                              <p className="font-semibold text-sm">{formatAmount(transaction.amount)}</p>
                              {transaction.fine && (
                                <p className="text-xs text-muted-foreground">{formatFine(transaction.fine)}</p>
                              )}
                            </div>
                            <ActionButtons
                              type={transaction.type}
                              id={transaction.id}
                              onEdit={() => {
                                const editRoute = transaction.type === 'sale' ? '/new-sale' : 
                                                 transaction.type === 'purchase' ? '/new-purchase' : 
                                                 '/new-payment';
                                navigate(`${editRoute}?edit=${transaction.id}`);
                              }}
                              onDelete={() => {
                                if (transaction.type === 'sale') handleDeleteSale(transaction.id);
                                else if (transaction.type === 'purchase') handleDeletePurchase(transaction.id);
                                else handleDeletePayment(transaction.id);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sales" className="space-y-2 mt-4">
              {sales.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sales transactions</p>
              ) : (
                <div className="space-y-2">
                  {sales.map((sale) => (
                    <div key={sale.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">{format(new Date(sale.date), 'MMM dd, yyyy')}</p>
                          <p className="font-medium mt-1 truncate">{sale.item_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Invoice: {sale.invoice_no}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-semibold text-success text-sm">{formatAmount(sale.amount)}</p>
                            {sale.fine && <p className="text-xs text-muted-foreground">{formatFine(sale.fine)}</p>}
                          </div>
                          <ActionButtons
                            type="sale"
                            id={sale.id}
                            onEdit={() => navigate(`/new-sale?edit=${sale.id}`)}
                            onDelete={() => handleDeleteSale(sale.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="purchases" className="space-y-2 mt-4">
              {purchases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No purchase transactions</p>
              ) : (
                <div className="space-y-2">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">{format(new Date(purchase.date), 'MMM dd, yyyy')}</p>
                          <p className="font-medium mt-1 truncate">{purchase.item_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Invoice: {purchase.invoice_no}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-semibold text-warning text-sm">{formatAmount(purchase.amount)}</p>
                            {purchase.fine && <p className="text-xs text-muted-foreground">{formatFine(purchase.fine)}</p>}
                          </div>
                          <ActionButtons
                            type="purchase"
                            id={purchase.id}
                            onEdit={() => navigate(`/new-purchase?edit=${purchase.id}`)}
                            onDelete={() => handleDeletePurchase(purchase.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-2 mt-4">
              {payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payment transactions</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">{format(new Date(payment.date), 'MMM dd, yyyy')}</p>
                          <p className="font-medium mt-1 capitalize">{payment.payment_type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {payment.transaction_type === 'payment' ? 'Payment' : 'Receipt'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className={`font-semibold text-sm ${payment.transaction_type === 'receipt' ? 'text-success' : 'text-destructive'}`}>
                              {formatAmount(payment.amount)}
                            </p>
                            {payment.fine && <p className="text-xs text-muted-foreground">{formatFine(payment.fine)}</p>}
                          </div>
                          <ActionButtons
                            type="payment"
                            id={payment.id}
                            onEdit={() => navigate(`/new-payment?edit=${payment.id}`)}
                            onDelete={() => handleDeletePayment(payment.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
