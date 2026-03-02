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
import { salesApi, customersApi } from "@/db/api";
import type { SaleWithCustomer, Customer } from "@/types";
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
import type { SaleFormData } from "@/types";

export default function SaleReportPage() {
  const [sales, setSales] = useState<SaleWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [editing, setEditing] = useState<SaleWithCustomer | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, customersData] = await Promise.all([
        salesApi.getAll(),
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
      const data = await salesApi.getAll(
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

  // Edit form
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

  const handleUpdate = async (values: SaleFormData) => {
    if (!editing) return;
    try {
      const updatedItem = await salesApi.update(editing.id, values);
      toast.success("Sale updated");
      setEditing(null);
      
      // Update local state immediately with updated item
      setSales(prev => prev.map(sale => 
        sale.id === editing.id 
          ? { ...sale, ...updatedItem }
          : sale
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
      await salesApi.delete(id);
      toast.success("Sale deleted");
      await handleFilter();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Sale Report</h1>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
          <Button onClick={handleFilter} className="w-full sm:w-auto">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
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
            <p className="text-2xl font-bold text-success">
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
          <CardTitle>Sales Transactions</CardTitle>
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
              <p className="text-muted-foreground">No sales found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="border rounded-lg overflow-hidden">
                  {/* Mobile View */}
                  <div className="sm:hidden">
                    {/* Header with customer and amount */}
                    <div className="bg-muted/30 p-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {sale.customer?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-success">
                            {formatCurrency(sale.amount)}
                          </p>
                          {sale.fine && (
                            <p className="text-xs text-muted-foreground">
                              {formatFine(sale.fine)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Date:</span>
                        <span className="text-sm">
                          {format(new Date(sale.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Item:</span>
                        <span className="text-sm font-medium">{sale.item_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Invoice:</span>
                        <span className="text-sm font-mono">{sale.invoice_no}</span>
                      </div>
                    </div>

                    {/* Action buttons - icon only on mobile */}
                    <div className="p-3 pt-0">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(sale)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(sale.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            window.open(`/invoice/sale/${sale.id}`, "_blank")
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:block">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold truncate">
                              {sale.customer?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(sale.date), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-1">{sale.item_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Invoice: {sale.invoice_no}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="mb-2">
                            <p className="font-semibold text-success">
                              {formatCurrency(sale.amount)}
                            </p>
                            {sale.fine && (
                              <p className="text-sm text-muted-foreground">
                                {formatFine(sale.fine)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditing(sale)}
                              className="h-8 px-3 text-xs"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(sale.id)}
                              className="h-8 px-3 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                window.open(`/invoice/sale/${sale.id}`, "_blank")
                              }
                              className="h-8 px-3 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
