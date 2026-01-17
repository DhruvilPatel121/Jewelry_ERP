import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { salesApi, purchasesApi, paymentsApi } from '@/db/api';
import type { SaleWithCustomer, PurchaseWithCustomer, PaymentWithCustomer } from '@/types';
import { BookOpen, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function DayBookPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sales, purchases, payments] = await Promise.all([
        salesApi.getAll(selectedDate, selectedDate),
        purchasesApi.getAll(selectedDate, selectedDate),
        paymentsApi.getAll(selectedDate, selectedDate),
      ]);

      const combined = [
        ...sales.map(s => ({ ...s, type: 'sale' as const })),
        ...purchases.map(p => ({ ...p, type: 'purchase' as const })),
        ...payments.map(p => ({ ...p, type: 'payment' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(combined);
    } catch (error) {
      console.error('Failed to load day book:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPurchases = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPayments = transactions
    .filter(t => t.type === 'payment' && t.transaction_type === 'payment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalReceipts = transactions
    .filter(t => t.type === 'payment' && t.transaction_type === 'receipt')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Day Book</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button onClick={loadData}>Load</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-success">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-warning">{formatCurrency(totalPurchases)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-destructive">{formatCurrency(totalPayments)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">{formatCurrency(totalReceipts)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions - {format(new Date(selectedDate), 'MMMM dd, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full bg-muted" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions on this date</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          transaction.type === 'sale' ? 'bg-success/10 text-success' :
                          transaction.type === 'purchase' ? 'bg-warning/10 text-warning' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {transaction.type.toUpperCase()}
                        </span>
                        <span className="font-semibold">{transaction.customer?.name || 'Unknown'}</span>
                      </div>
                      {'item_name' in transaction && (
                        <p className="text-sm mt-1">{transaction.item_name}</p>
                      )}
                      {'payment_type' in transaction && (
                        <p className="text-sm mt-1 capitalize">
                          {transaction.payment_type.replace('_', ' ')} - {transaction.transaction_type}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Invoice: {transaction.invoice_no}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'sale' ? 'text-success' :
                        transaction.type === 'purchase' ? 'text-warning' :
                        transaction.transaction_type === 'receipt' ? 'text-primary' : 'text-destructive'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.fine && (
                        <p className="text-sm text-muted-foreground">{transaction.fine.toFixed(3)}g</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
