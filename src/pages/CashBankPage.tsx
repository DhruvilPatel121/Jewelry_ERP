import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/db/api';
import { Wallet, Building2, TrendingUp, TrendingDown } from 'lucide-react';

export default function CashBankPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalCash: 0,
    totalBank: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getDashboardSummary();
      setSummary({
        totalCash: data.totalCash,
        totalBank: data.totalBank,
      });
    } catch (error) {
      console.error('Failed to load cash/bank data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalBalance = summary.totalCash + summary.totalBank;

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Cash & Bank</h1>

      {/* Total Balance */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="text-lg">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-12 w-48 bg-muted" />
          ) : (
            <p className="text-4xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
          )}
        </CardContent>
      </Card>

      {/* Cash & Bank Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-success" />
              Cash in Hand
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-10 w-40 bg-muted" />
            ) : (
              <>
                <p className="text-3xl font-bold text-success">{formatCurrency(summary.totalCash)}</p>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${summary.totalCash >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {summary.totalCash >= 0 ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-secondary" />
              Bank Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-10 w-40 bg-muted" />
            ) : (
              <>
                <p className="text-3xl font-bold text-secondary">{formatCurrency(summary.totalBank)}</p>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${summary.totalBank >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {summary.totalBank >= 0 ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Cash & Bank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Cash and Bank balances are calculated based on your payment and receipt transactions.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cash payments decrease cash balance</li>
            <li>Cash receipts increase cash balance</li>
            <li>Bank payments decrease bank balance</li>
            <li>Bank receipts increase bank balance</li>
          </ul>
          <p className="pt-2">
            To update these balances, add payment or receipt transactions from the More menu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
