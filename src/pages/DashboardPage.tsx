import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/db/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Building2, Plus, Users, Package, FileText, TrendingUpIcon, TrendingDownIcon, Calendar, Download } from 'lucide-react';
import CalendarFilter from '@/components/CalendarFilter';
import { format, addDays, subDays } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [currentPreset, setCurrentPreset] = useState('month');
  const [summary, setSummary] = useState({
    todaySales: 0,
    todayPurchases: 0,
    totalCash: 0,
    totalBank: 0,
  });
  const [rangeData, setRangeData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get today's summary
      const summaryData = await analyticsApi.getDashboardSummary();
      setSummary(summaryData);

      // Get range data based on selected dates
      const startDateStr = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.endDate, 'yyyy-MM-dd');
      const rangeAnalytics = await analyticsApi.getDateRangeData(startDateStr, endDateStr);
      setRangeData(rangeAnalytics);

      // Get monthly trends for charts
      const months = currentPreset === 'year' ? 12 : 
                    currentPreset === '6months' ? 6 : 
                    currentPreset === '3months' ? 3 : 6;
      const trendsData = await analyticsApi.getMonthlyTrends(months);
      
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

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handlePresetChange = (preset: string) => {
    setCurrentPreset(preset);
  };

  const handleClearAll = () => {
    // Reset to default state
    setDateRange({
      startDate: subDays(new Date(), 30),
      endDate: new Date()
    });
    setCurrentPreset('month');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const exportData = () => {
    if (!rangeData) return;
    
    const csvContent = [
      ['Date', 'Sales', 'Purchases', 'Profit'],
      ...rangeData.dailyData.map((item: any) => [
        item.date,
        item.sales,
        item.purchases,
        item.profit
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${format(dateRange.startDate, 'yyyy-MM-dd')}-to-${format(dateRange.endDate, 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={exportData} disabled={loading || !rangeData} className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Calendar Filter */}
      <CalendarFilter
        onDateRangeChange={handleDateRangeChange}
        onPresetChange={handlePresetChange}
        onClearAll={handleClearAll}
        loading={loading}
      />

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

      {/* Range Summary */}
      {rangeData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Period Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-success">{formatCurrency(rangeData.summary.totalSales)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {rangeData.summary.salesCount} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Period Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-warning">{formatCurrency(rangeData.summary.totalPurchases)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {rangeData.summary.purchasesCount} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Period Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${rangeData.summary.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(rangeData.summary.totalProfit)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {rangeData.summary.totalProfit >= 0 ? 'Profit' : 'Loss'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Period Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {format(dateRange.startDate, 'MMM dd, yyyy')}
              </p>
              <p className="text-sm font-medium">
                to {format(dateRange.endDate, 'MMM dd, yyyy')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales vs Purchases Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sales vs Purchases Analysis</span>
            <span className="text-sm font-normal text-muted-foreground">
              {currentPreset === 'today' ? 'Today' :
               currentPreset === 'week' ? 'This Week' :
               currentPreset === 'month' ? 'This Month' :
               currentPreset === '3months' ? 'Last 3 Months' :
               currentPreset === '6months' ? 'Last 6 Months' :
               currentPreset === 'year' ? 'This Year' : 'Custom Range'}
            </span>
          </CardTitle>
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
          <CardTitle>Profit Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80 w-full bg-muted" />
          ) : monthlyData.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Daily Breakdown (for shorter ranges) */}
      {rangeData && rangeData.dailyData && rangeData.dailyData.length <= 31 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {rangeData.dailyData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{format(new Date(item.date), 'MMM dd, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.date), 'EEEE')}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm">
                        <span className="text-success">Sales: {formatCurrency(item.sales)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-warning">Purchases: {formatCurrency(item.purchases)}</span>
                      </p>
                      <p className={`text-sm font-medium ${item.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        Profit: {formatCurrency(item.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
