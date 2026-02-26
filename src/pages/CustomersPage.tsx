import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { customersApi } from '@/db/api';
import type { Customer, CustomerFormData } from '@/types';
import { Plus, Search, Users, ChevronRight, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile_no: z.string().min(10, 'Mobile number must be at least 10 digits'),
  city: z.string().optional(),
  gst_no: z.string().optional(),
  address: z.string().optional(),
  opening_amount: z.coerce.number().default(0),
  opening_fine: z.coerce.number().default(0),
});

export default function CustomersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      mobile_no: '',
      city: '',
      gst_no: '',
      address: '',
      opening_amount: 0,
      opening_fine: 0,
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      loadCustomers();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      loadCustomers();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

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
  
  const handleDelete = async (id: string) => {
    try {
      await customersApi.delete(id);
      toast.success('Customer deleted');
      setCustomers(prev => prev.filter(c => c.id !== id));
      setFilteredCustomers(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const handleAddCustomer = async (data: CustomerFormData) => {
    try {
      const newCustomer = await customersApi.create(data);
      toast.success('Customer added successfully');
      
      // Add to local state immediately
      setCustomers(prev => [...prev, newCustomer]);
      setFilteredCustomers(prev => [...prev, newCustomer]);
      
      // Close dialog and reset form
      setDialogOpen(false);
      form.reset();
      
      // Then refresh from server to ensure consistency
      loadCustomers();
    } catch (error) {
      console.error('Failed to add customer:', error);
      toast.error('Failed to add customer');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => setDialogOpen(true)}>
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
                <div
                  key={customer.id}
                  className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.mobile_no}</p>
                    {customer.city && (
                      <p className="text-xs text-muted-foreground mt-1">{customer.city}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="space-y-1">
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
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="ml-2"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{customer.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(customer.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddCustomer)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile No *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gst_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST No</FormLabel>
                    <FormControl>
                      <Input placeholder="GST number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Full address" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="opening_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Amount (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="opening_fine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Fine (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="0.000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Customer
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
