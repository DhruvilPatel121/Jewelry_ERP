import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { salesApi, purchasesApi, analyticsApi } from '@/db/api';
import type { SaleWithCustomer, PurchaseWithCustomer } from '@/types';
import { Plus, FileText, BookOpen, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dailySummary, setDailySummary] = useState({ todaySales: 0, todayPurchases: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Array<(SaleWithCustomer | PurchaseWithCustomer) & { type: 'sale' | 'purchase' }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [summary, sales, purchases] = await Promise.all([
        analyticsApi.getDashboardSummary(),
        salesApi.getAll(today, today),
        purchasesApi.getAll(today, today),
      ]);

      setDailySummary({
        todaySales: summary.todaySales,
        todayPurchases: summary.todayPurchases,
      });

      // Combine and sort recent transactions
      const combined = [
        ...sales.map(s => ({ ...s, type: 'sale' as const })),
        ...purchases.map(p => ({ ...p, type: 'purchase' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentTransactions(combined.slice(0, 10));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Daily Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Today's Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32 bg-muted" />
            ) : (
              <p className="text-2xl font-bold text-success">{formatCurrency(dailySummary.todaySales)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              Today's Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32 bg-muted" />
            ) : (
              <p className="text-2xl font-bold text-warning">{formatCurrency(dailySummary.todayPurchases)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button onClick={() => navigate('/new-sale')} className="h-auto py-4 flex-col gap-2">
            <Plus className="h-5 w-5" />
            <span>Add Sale</span>
          </Button>
          <Button onClick={() => navigate('/sale-report')} variant="outline" className="h-auto py-4 flex-col gap-2">
            <FileText className="h-5 w-5" />
            <span>Sale Report</span>
          </Button>
          <Button onClick={() => navigate('/day-book')} variant="outline" className="h-auto py-4 flex-col gap-2">
            <BookOpen className="h-5 w-5" />
            <span>Day Book</span>
          </Button>
          <Button onClick={() => navigate('/items')} variant="outline" className="h-auto py-4 flex-col gap-2">
            <Package className="h-5 w-5" />
            <span>Add Item</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-muted" />
                    <Skeleton className="h-3 w-24 bg-muted" />
                  </div>
                  <Skeleton className="h-5 w-20 bg-muted" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions today</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        transaction.type === 'sale' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {transaction.type === 'sale' ? 'SALE' : 'PURCHASE'}
                      </span>
                      <span className="font-medium">{transaction.customer?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{transaction.item_name}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'sale' ? 'text-success' : 'text-warning'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                    {transaction.fine && (
                      <p className="text-xs text-muted-foreground">
                        {transaction.fine.toFixed(3)}g
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Button
        onClick={() => navigate('/new-sale')}
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
