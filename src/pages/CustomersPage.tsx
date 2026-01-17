import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { customersApi } from '@/db/api';
import type { Customer } from '@/types';
import { Plus, Search, Users, ChevronRight } from 'lucide-react';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.mobile_no.includes(searchQuery)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersApi.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatFine = (fine: number) => {
    return `${fine.toFixed(3)}g`;
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => navigate('/add-customer')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40 bg-muted" />
                    <Skeleton className="h-4 w-32 bg-muted" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-24 bg-muted ml-auto" />
                    <Skeleton className="h-4 w-20 bg-muted ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">Add your first customer to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.mobile_no}</p>
                    {customer.city && (
                      <p className="text-xs text-muted-foreground mt-1">{customer.city}</p>
                    )}
                  </div>
                  <div className="text-right mr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Amount:</span>
                      <span
                        className={`font-semibold ${
                          customer.closing_amount >= 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {formatAmount(Math.abs(customer.closing_amount))}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {customer.closing_amount >= 0 ? 'DR' : 'CR'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Fine:</span>
                      <span
                        className={`text-sm font-medium ${
                          customer.closing_fine >= 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {formatFine(Math.abs(customer.closing_fine))}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {customer.closing_fine >= 0 ? 'DR' : 'CR'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
