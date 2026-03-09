import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { customersApi, paymentsApi } from '@/db/api';
import type { Customer, PaymentFormData, PaymentType, TransactionType, Payment } from '@/types';
import { ArrowLeft, Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const paymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  customer_id: z.string().min(1, 'Customer is required'),
  transaction_type: z.enum(['payment', 'receipt']),
  payment_type: z.enum(['fine', 'cash', 'bank', 'rate_cut_fine', 'rate_cut_amount', 'roopu']),
  gross: z.coerce.number().optional(),
  purity: z.coerce.number().optional(),
  wast_badi_kg: z.coerce.number().optional(),
  rate: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [calculatedFine, setCalculatedFine] = useState(0);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      customer_id: '',
      transaction_type: 'payment',
      payment_type: 'cash',
      gross: 0,
      purity: 0,
      wast_badi_kg: 0,
      rate: 0,
      amount: 0,
      remarks: '',
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (isEdit && editId && customers.length > 0) {
      loadPaymentData();
    }
  }, [isEdit, editId, customers.length]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      calculateFine(value as PaymentFormData);
    });
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [form]);

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadPaymentData = async () => {
    if (!editId) return;
    
    try {
      const payment = await paymentsApi.getById(editId);
      if (payment) {
        // Pre-fill form with existing data
        form.reset({
          date: payment.date,
          customer_id: payment.customer_id,
          transaction_type: payment.transaction_type,
          payment_type: payment.payment_type,
          gross: payment.gross || 0,
          purity: payment.purity || 0,
          wast_badi_kg: payment.wast_badi_kg || 0,
          rate: payment.rate || 0,
          amount: payment.amount || 0,
          remarks: payment.remarks || '',
        });
        
        // Calculate initial fine
        calculateFine({
          date: payment.date,
          customer_id: payment.customer_id,
          transaction_type: payment.transaction_type,
          payment_type: payment.payment_type,
          gross: payment.gross || 0,
          purity: payment.purity || 0,
          wast_badi_kg: payment.wast_badi_kg || 0,
          rate: payment.rate || 0,
          amount: payment.amount || 0,
          remarks: payment.remarks || '',
        });
      }
    } catch (error) {
      console.error('Failed to load payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setInitialLoading(false);
    }
  };

  const calculateFine = (data: PaymentFormData) => {
    const gross = data.gross || 0;
    const purity = data.purity || 0;
    // Fine = Gross × Purity / 100
    const fine = gross * purity / 100;
    setCalculatedFine(fine);
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      
      if (isEdit && editId) {
        // Update existing payment
        await paymentsApi.update(editId, data);
        toast.success('Payment updated successfully');
      } else {
        // Create new payment
        await paymentsApi.create(data);
        toast.success('Payment added successfully');
      }
      
      navigate('/');
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} payment:`, error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} payment`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Payment' : 'New Payment'}</h1>
      </div>

      {initialLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading payment data...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="payment" id="payment" />
                          <Label htmlFor="payment" className="cursor-pointer">Payment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="receipt" id="receipt" />
                          <Label htmlFor="receipt" className="cursor-pointer">Receipt</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fine">Fine</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="rate_cut_fine">Rate Cut Fine</SelectItem>
                        <SelectItem value="rate_cut_amount">Rate Cut Amount</SelectItem>
                        <SelectItem value="roopu">Roopu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gross"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="0.000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purity (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="0.000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="wast_badi_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wast Badi / KG</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" placeholder="0.000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Calculated Fine:</span>
                  <span className="font-semibold">{calculatedFine.toFixed(3)}g</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? 'Update Payment' : 'Save Transaction'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
