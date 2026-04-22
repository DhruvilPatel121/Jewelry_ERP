import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customersApi, salesApi, itemsApi } from "@/db/api";
import type { Customer, Item, SaleFormData } from "@/types";
import { ArrowLeft, Loader2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const saleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  customer_id: z.string().min(1, "Customer is required"),
  item_name: z.string().min(1, "Item name is required"),
  weight: z.coerce.number().optional(),
  bag: z.coerce.number().optional(),
  net_weight: z.coerce.number().optional(),
  ghat_per_kg: z.coerce.number().optional(),
  touch: z.coerce.number().optional(),
  wastage: z.coerce.number().optional(),
  pics: z.coerce.number().optional(),
  rate: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

export default function NewSalePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [calculatedValues, setCalculatedValues] = useState({
    totalGhat: 0,
    fine: 0,
    amount: 0,
    netWeight: 0,
    openingAmount: 0,
    closingAmount: 0,
    openingFine: 0,
    closingFine: 0,
  });

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      customer_id: "",
      item_name: "",
      weight: 0,
      bag: 0,
      net_weight: 0,
      ghat_per_kg: 0,
      touch: 0,
      wastage: 0,
      pics: 0,
      rate: 0,
      remarks: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "customer_id") {
        const customer = customers.find((c) => c.id === value.customer_id);
        setSelectedCustomer(customer || null);
        
        // Recalculate opening balance when customer changes
        setTimeout(() => {
          (async () => {
            await calculateValues(form.getValues() as SaleFormData);
          })();
        }, 0);
      }
      // Calculate fine when relevant fields change
      if (name === 'weight' || name === 'bag' || name === 'ghat_per_kg' || name === 'touch' || name === 'wastage' || name === 'rate') {
        setTimeout(() => {
          (async () => {
            await calculateValues(form.getValues() as SaleFormData);
          })();
        }, 0);
      }
    });
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [form, customers]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isEdit && editId && customers.length > 0) {
      loadSaleData();
    }
  }, [isEdit, editId, customers.length]);

  useEffect(() => {
    // CRITICAL: Recalculate opening balance IMMEDIATELY when selectedCustomer changes
    if (selectedCustomer) {
      console.log('CRITICAL: Customer changed, recalculating opening balance for:', selectedCustomer.name);
      setTimeout(() => {
        (async () => {
          await calculateValues(form.getValues() as SaleFormData);
        })();
      }, 0);
    }
  }, [selectedCustomer]);

  const loadData = async () => {
    try {
      const [customersData, itemsData] = await Promise.all([
        customersApi.getAll(),
        itemsApi.getAll(),
      ]);
      setCustomers(customersData);
      setItems(itemsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const loadSaleData = async () => {
    if (!editId) return;
    
    try {
      const sale = await salesApi.getById(editId);
      if (sale) {
        // Pre-fill form with existing data
        form.reset({
          date: sale.date,
          customer_id: sale.customer_id,
          item_name: sale.item_name,
          weight: sale.weight || 0,
          bag: sale.bag || 0,
          net_weight: sale.net_weight || 0,
          ghat_per_kg: sale.ghat_per_kg || 0,
          touch: sale.touch || 0,
          wastage: sale.wastage || 0,
          pics: sale.pics || 0,
          rate: sale.rate || 0,
          remarks: sale.remarks || "",
        });
        
        // Set selected customer
        const customer = customers.find((c) => c.id === sale.customer_id);
        setSelectedCustomer(customer || null);
        
        // Calculate initial values
        (async () => {
          await calculateValues({
            date: sale.date,
            customer_id: sale.customer_id,
            item_name: sale.item_name,
            weight: sale.weight || 0,
            bag: sale.bag || 0,
            net_weight: sale.net_weight || 0,
            ghat_per_kg: sale.ghat_per_kg || 0,
            touch: sale.touch || 0,
            wastage: sale.wastage || 0,
            pics: sale.pics || 0,
            rate: sale.rate || 0,
            remarks: sale.remarks || "",
          });
        })();
      }
    } catch (error) {
      console.error("Failed to load sale data:", error);
      toast.error("Failed to load sale data");
    } finally {
      setInitialLoading(false);
    }
  };

  const calculateValues = async (data: SaleFormData) => {
    const weight = parseFloat(String(data.weight || 0));
    const bag = parseFloat(String(data.bag || 0));
    const ghatPerKg = parseFloat(String(data.ghat_per_kg || 0));
    const touch = parseFloat(String(data.touch || 0));
    const wastage = parseFloat(String(data.wastage || 0));
    const rate = parseFloat(String(data.rate || 0));

    const netWeight = weight - bag;
    const totalGhat = (netWeight * ghatPerKg) / 1000;
    const fine = (touch + wastage) * (netWeight + totalGhat) / 100;
    const amount = (netWeight * rate) / 1000;

    // UI preview of opening/closing balance.
    // NOTE: The authoritative opening balance is always computed in the API
    // from the customer's live closing balance at save time. This preview
    // uses the customer's current closing_amount which is a good approximation.
    const openingAmount = selectedCustomer?.closing_amount || 0;
    const openingFine = selectedCustomer?.closing_fine || 0;
    const closingAmount = openingAmount + amount;
    const closingFine = openingFine + fine;

    setCalculatedValues({
      totalGhat,
      fine,
      amount,
      netWeight,
      openingAmount,
      closingAmount,
      openingFine,
      closingFine,
    });
  };

  const onSubmit = async (data: SaleFormData) => {
    try {
      setLoading(true);
      // Do NOT pass opening_amount/opening_fine here.
      // The API computes them from the customer's live closing balance at save time.
      const payload = {
        ...data,
        net_weight: (data.weight || 0) - (data.bag || 0),
      };
      if (isEdit && editId) {
        await salesApi.update(editId, payload);
        toast.success("Sale updated successfully");
      } else {
        await salesApi.create(payload);
        toast.success("Sale added successfully");
      }
      navigate("/");
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} sale:`, error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} sale`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Sale' : 'New Sale'}</h1>
      </div>

      {initialLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading sale data...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sale Details</CardTitle>
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
                    {selectedCustomer && (
                      <div className="mt-2 p-3 bg-muted rounded-md grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-primary/70 block">
                            Opening Balance:
                          </span>
                          <span className="font-semibold text-primary">
                            {calculatedValues.openingAmount?.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-primary/70 block">
                            Opening Fine:
                          </span>
                          <span className="font-semibold text-primary">
                            {calculatedValues.openingFine?.toFixed(3)}g
                          </span>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="item_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bag (g)</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseFloat(value))
                        }
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bag weight" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0g (None)</SelectItem>
                          <SelectItem value="2">2g</SelectItem>
                          <SelectItem value="3">3g</SelectItem>
                          <SelectItem value="6">6g</SelectItem>
                          <SelectItem value="12">12g</SelectItem>
                          <SelectItem value="18">18g</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="net_weight"
                render={({ field: _field }) => (
                  <FormItem>
                    <FormLabel>Net Weight (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={calculatedValues.netWeight || 0}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ghat_per_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghat per KG</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Total Ghat:</span>
                  <span className="font-semibold">
                    {calculatedValues.totalGhat.toFixed(3)}g
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="touch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Touch (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wastage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wastage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fine:</span>
                  <span className="font-semibold">
                    {calculatedValues.fine.toFixed(3)}g
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pics</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
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
                      <FormLabel>Rate (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ₹
                    {calculatedValues.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {form.watch("customer_id") && (
                  <div className="border-t border-primary/20 pt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-primary/70 block">
                        Closing Balance:
                      </span>
                      <span className="font-bold text-primary">
                        ₹
                        {calculatedValues.closingAmount?.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-primary/70 block">
                        Closing Fine:
                      </span>
                      <span className="font-bold text-primary">
                        {calculatedValues.closingFine?.toFixed(3)}g
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes..."
                        rows={3}
                        {...field}
                      />
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
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? 'Update Sale' : 'Save Sale'}
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
