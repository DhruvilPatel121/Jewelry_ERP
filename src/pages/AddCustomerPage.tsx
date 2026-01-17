import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { customersApi } from '@/db/api';
import type { CustomerFormData } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
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

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);

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
    if (editId) {
      loadCustomer();
    }
  }, [editId]);

  const loadCustomer = async () => {
    if (!editId) return;
    
    try {
      const customer = await customersApi.getById(editId);
      if (customer) {
        form.reset({
          name: customer.name,
          mobile_no: customer.mobile_no,
          city: customer.city || '',
          gst_no: customer.gst_no || '',
          address: customer.address || '',
          opening_amount: customer.opening_amount,
          opening_fine: customer.opening_fine,
        });
      }
    } catch (error) {
      console.error('Failed to load customer:', error);
      toast.error('Failed to load customer');
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setLoading(true);
      if (editId) {
        await customersApi.update(editId, data);
        toast.success('Customer updated successfully');
      } else {
        await customersApi.create(data);
        toast.success('Customer added successfully');
      }
      navigate('/customers');
    } catch (error) {
      console.error('Failed to save customer:', error);
      toast.error('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{editId ? 'Edit Customer' : 'Add New Customer'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  onClick={() => navigate('/customers')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editId ? 'Update' : 'Add'} Customer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
