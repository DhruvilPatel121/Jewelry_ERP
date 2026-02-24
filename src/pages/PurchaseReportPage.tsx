import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { purchasesApi, customersApi } from "@/db/api";
import type { PurchaseWithCustomer, Customer } from "@/types";
import { FileText, Download, Filter, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { PurchaseFormData } from "@/types";

export default function PurchaseReportPage() {
  const [sales, setSales] = useState<PurchaseWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [editing, setEditing] = useState<PurchaseWithCustomer | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, customersData] = await Promise.all([
        purchasesApi.getAll(),
        customersApi.getAll(),
      ]);
      setSales(salesData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const data = await purchasesApi.getAll(
        startDate || undefined,
        endDate || undefined,
      );
      setSales(data);
    } catch (error) {
      console.error("Failed to filter sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales =
    selectedCustomer === "all"
      ? sales
      : sales.filter((s) => s.customer_id === selectedCustomer);

  const totalAmount = filteredSales.reduce(
    (sum, sale) => sum + (sale.amount || 0),
    0,
  );
  const totalFine = filteredSales.reduce(
    (sum, sale) => sum + (sale.fine || 0),
    0,
  );

  const formatCurrency = (amount: number | null) => {
    return `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatFine = (fine: number | null) => {
    return `${(fine || 0).toFixed(3)}g`;
  };

  const editSchema = z.object({
    weight: z.coerce.number().optional(),
    bag: z.coerce.number().optional(),
    ghat_per_kg: z.coerce.number().optional(),
    touch: z.coerce.number().optional(),
    wastage: z.coerce.number().optional(),
    rate: z.coerce.number().optional(),
    remarks: z.string().optional(),
  });
  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      weight: 0,
      bag: 0,
      ghat_per_kg: 0,
      touch: 0,
      wastage: 0,
      rate: 0,
      remarks: "",
    },
  });
  useEffect(() => {
    if (editing) {
      editForm.reset({
        weight: editing.weight || 0,
        bag: editing.bag || 0,
        ghat_per_kg: editing.ghat_per_kg || 0,
        touch: editing.touch || 0,
        wastage: editing.wastage || 0,
        rate: editing.rate || 0,
        remarks: editing.remarks || "",
      });
    }
  }, [editing]);

  const handleUpdate = async (values: PurchaseFormData) => {
    if (!editing) return;
    try {
      const updatedItem = await purchasesApi.update(editing.id, values);
      toast.success("Purchase updated");
      setEditing(null);
      
      // Update local state immediately with updated item
      setPurchases(prev => prev.map(purchase => 
        purchase.id === editing.id 
          ? { ...purchase, ...updatedItem }
          : purchase
      ));
      
      // Then refresh data from server to ensure consistency
      await handleFilter();
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await purchasesApi.delete(id);
      toast.success("Purchase deleted");
      await handleFilter();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Report</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleFilter} className="w-full xl:w-auto">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filteredSales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">
              {formatCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Fine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">
              {formatFine(totalFine)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full bg-muted" />
              ))}
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No purchases found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {sale.customer?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(sale.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{sale.item_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Invoice: {sale.invoice_no}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-warning">
                        {formatCurrency(sale.amount)}
                      </p>
                      {sale.fine && (
                        <p className="text-sm text-muted-foreground">
                          {formatFine(sale.fine)}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(sale)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(sale.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `/invoice/purchase/${sale.id}`,
                              "_blank",
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-1" /> PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Purchase</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  name="weight"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="bag"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bag (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ghat_per_kg"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghat per KG</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="touch"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Touch (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="wastage"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wastage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="rate"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
