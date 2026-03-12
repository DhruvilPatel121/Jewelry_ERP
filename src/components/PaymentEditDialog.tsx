import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { paymentsApi } from '@/db/api';
import type { Payment, PaymentFormData } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

interface PaymentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  onSuccess?: () => void;
}

export default function PaymentEditDialog({ open, onOpenChange, payment, onSuccess }: PaymentEditDialogProps) {
  const [loading, setLoading] = useState(false);

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
    if (payment && open) {
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
    }
  }, [payment, open, form]);

  const onSubmit = async (data: PaymentFormData) => {
    if (!payment) return;

    try {
      setLoading(true);
      
      // Only pass the fields that can be updated
      const updateData: Partial<PaymentFormData> = {
        date: data.date,
        transaction_type: data.transaction_type,
        payment_type: data.payment_type,
        gross: data.gross,
        purity: data.purity,
        wast_badi_kg: data.wast_badi_kg,
        rate: data.rate,
        amount: data.amount,
        remarks: data.remarks,
      };

      await paymentsApi.update(payment.id, updateData);
      toast.success('Payment updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update payment:', error);
      toast.error('Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="payment" id="payment" />
                          <Label htmlFor="payment">Payment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="receipt" id="receipt" />
                          <Label htmlFor="receipt">Receipt</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gross"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
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
                    <FormLabel>Purity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wast_badi_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wast Badi (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter remarks" {...field} />
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
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Payment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
