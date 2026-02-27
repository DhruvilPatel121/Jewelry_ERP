import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/db/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Building2, Plus, Users, Package, FileText, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    todaySales: 0,
    todayPurchases: 0,
    totalCash: 0,
    totalBank: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, trendsData] = await Promise.all([
        analyticsApi.getDashboardSummary(),
        analyticsApi.getMonthlyTrends(6),
      ]);

      setSummary(summaryData);
      
      // Format monthly data for charts
      const formattedData = trendsData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        sales: item.sales,
        purchases: item.purchases,
        profit: item.profit,
      }));
      
      setMonthlyData(formattedData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Action Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/new-sale')}>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <span className="text-sm font-medium">Add Sale</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/sales-report')}>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Sales Report</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/day-book')}>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-secondary/10 rounded-full">
                <TrendingUpIcon className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-sm font-medium">Day Book</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/purchase-report')}>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-warning/10 rounded-full">
                <TrendingDownIcon className="h-6 w-6 text-warning" />
              </div>
              <span className="text-sm font-medium">Purchase Report</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/items')}>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-info/10 rounded-full">
                <Package className="h-6 w-6 text-info" />
              </div>
              <span className="text-sm font-medium">Add Item</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/customers')}>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-accent/10 rounded-full">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">Add Customer</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Today's Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-28 bg-muted" />
            ) : (
              <p className="text-xl font-bold text-success">{formatCurrency(summary.todaySales)}</p>
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
              <Skeleton className="h-7 w-28 bg-muted" />
            ) : (
              <p className="text-xl font-bold text-warning">{formatCurrency(summary.todayPurchases)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Cash in Hand
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-28 bg-muted" />
            ) : (
              <p className="text-xl font-bold text-primary">{formatCurrency(summary.totalCash)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-secondary" />
              Bank Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-28 bg-muted" />
            ) : (
              <p className="text-xl font-bold text-secondary">{formatCurrency(summary.totalBank)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales vs Purchases Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales vs Purchases (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80 w-full bg-muted" />
          ) : monthlyData.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="sales" fill="hsl(var(--success))" name="Sales" />
                <Bar dataKey="purchases" fill="hsl(var(--warning))" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Profit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80 w-full bg-muted" />
          ) : monthlyData.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
