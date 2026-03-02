import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { salesApi, purchasesApi, paymentsApi } from "@/db/api";
import type {
  SaleWithCustomer,
  PurchaseWithCustomer,
  PaymentWithCustomer,
} from "@/types";
import { BookOpen, Download, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

export default function DayBookPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sales, purchases, payments] = await Promise.all([
        salesApi.getAll(selectedDate, selectedDate),
        purchasesApi.getAll(selectedDate, selectedDate),
        paymentsApi.getAll(selectedDate, selectedDate),
      ]);

      const combined = [
        ...sales.map((s) => ({ ...s, type: "sale" as const })),
        ...purchases.map((p) => ({ ...p, type: "purchase" as const })),
        ...payments.map((p) => ({ ...p, type: "payment" as const })),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setTransactions(combined);
    } catch (error) {
      console.error("Failed to load day book:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    return `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalSales = transactions
    .filter((t) => t.type === "sale")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPurchases = transactions
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPayments = transactions
    .filter((t) => t.type === "payment" && t.transaction_type === "payment")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalReceipts = transactions
    .filter((t) => t.type === "payment" && t.transaction_type === "receipt")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Dynamic edit forms per type
  const salePurchaseSchema = z.object({
    weight: z.coerce.number().optional(),
    bag: z.coerce.number().optional(),
    ghat_per_kg: z.coerce.number().optional(),
    touch: z.coerce.number().optional(),
    wastage: z.coerce.number().optional(),
    rate: z.coerce.number().optional(),
    remarks: z.string().optional(),
  });
  const paymentSchema = z.object({
    amount: z.coerce.number().optional(),
    gross: z.coerce.number().optional(),
    purity: z.coerce.number().optional(),
    transaction_type: z.enum(["payment", "receipt"]).optional(),
    payment_type: z.string().optional(),
    remarks: z.string().optional(),
  });
  const editForm = useForm<any>({
    resolver: zodResolver(
      editing?.type === "payment" ? paymentSchema : salePurchaseSchema,
    ),
    defaultValues: {},
  });
  const openEdit = (t: any) => {
    setEditing(t);
    if (t.type === "payment") {
      editForm.reset({
        amount: t.amount || 0,
        gross: t.gross || 0,
        purity: t.purity || 0,
        transaction_type: t.transaction_type,
        payment_type: t.payment_type,
        remarks: t.remarks || "",
      });
    } else {
      editForm.reset({
        weight: t.weight || 0,
        bag: t.bag || 0,
        ghat_per_kg: t.ghat_per_kg || 0,
        touch: t.touch || 0,
        wastage: t.wastage || 0,
        rate: t.rate || 0,
        remarks: t.remarks || "",
      });
    }
  };
  const handleUpdate = async (values: any) => {
    if (!editing) return;
    try {
      let updatedItem;
      if (editing.type === "sale") {
        updatedItem = await salesApi.update(editing.id, values);
      } else if (editing.type === "purchase") {
        updatedItem = await purchasesApi.update(editing.id, values);
      } else {
        updatedItem = await paymentsApi.update(editing.id, values);
      }
      
      toast.success("Updated");
      setEditing(null);
      
      // Update local state immediately with the updated item
      setTransactions(prev => prev.map(transaction => 
        transaction.id === editing.id 
          ? { ...transaction, ...updatedItem }
          : transaction
      ));
      
      // Then refresh data from server to ensure consistency
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };
  const handleDelete = async (t: any) => {
    try {
      if (t.type === "sale") {
        await salesApi.delete(t.id);
      } else if (t.type === "purchase") {
        await purchasesApi.delete(t.id);
      } else {
        await paymentsApi.delete(t.id);
      }
      toast.success("Deleted");
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Day Book</h1>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button onClick={loadData} className="w-full sm:w-auto">Load</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-success">
              {formatCurrency(totalSales)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-warning">
              {formatCurrency(totalPurchases)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-destructive">
              {formatCurrency(totalPayments)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(totalReceipts)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions - {format(new Date(selectedDate), "MMMM dd, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full bg-muted" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No transactions on this date
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg overflow-hidden">
                  {/* Mobile View */}
                  <div className="sm:hidden">
                    {/* Header with type and amount */}
                    <div className="bg-muted/30 p-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              transaction.type === "sale"
                                ? "bg-success/10 text-success"
                                : transaction.type === "purchase"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-primary/10 text-primary"
                            }`}
                          >
                            {transaction.type.toUpperCase()}
                          </span>
                          <span className="font-semibold text-sm truncate">
                            {transaction.customer?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-sm ${
                              transaction.type === "sale"
                                ? "text-success"
                                : transaction.type === "purchase"
                                  ? "text-warning"
                                  : transaction.transaction_type === "receipt"
                                    ? "text-primary"
                                    : "text-destructive"
                            }`}
                          >
                            {formatCurrency(transaction.amount)}
                          </p>
                          {transaction.fine && (
                            <p className="text-xs text-muted-foreground">
                              {transaction.fine.toFixed(3)}g
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-3 space-y-2">
                      {"item_name" in transaction && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Item:</span>
                          <span className="text-sm font-medium">{transaction.item_name}</span>
                        </div>
                      )}
                      {"payment_type" in transaction && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Type:</span>
                          <span className="text-sm capitalize">
                            {transaction.payment_type.replace("_", " ")} - {transaction.transaction_type}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Invoice:</span>
                        <span className="text-sm font-mono">{transaction.invoice_no}</span>
                      </div>
                    </div>

                    {/* Action buttons - icon only on mobile */}
                    <div className="p-3 pt-0">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const path =
                              transaction.type === "sale"
                                ? `/invoice/sale/${transaction.id}`
                                : transaction.type === "purchase"
                                  ? `/invoice/purchase/${transaction.id}`
                                  : "payment_type" in transaction
                                    ? `/invoice/payment/${transaction.id}`
                                    : `/invoice/expense/${transaction.id}`;
                            window.open(path, "_blank");
                          }}
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
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                transaction.type === "sale"
                                  ? "bg-success/10 text-success"
                                  : transaction.type === "purchase"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-primary/10 text-primary"
                              }`}
                            >
                              {transaction.type.toUpperCase()}
                            </span>
                            <span className="font-semibold truncate">
                              {transaction.customer?.name || "Unknown"}
                            </span>
                          </div>
                          {"item_name" in transaction && (
                            <p className="text-sm text-muted-foreground truncate mb-1">{transaction.item_name}</p>
                          )}
                          {"payment_type" in transaction && (
                            <p className="text-sm text-muted-foreground capitalize mb-1">
                              {transaction.payment_type.replace("_", " ")} - {transaction.transaction_type}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Invoice: {transaction.invoice_no}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="mb-2">
                            <p
                              className={`font-semibold ${
                                transaction.type === "sale"
                                  ? "text-success"
                                  : transaction.type === "purchase"
                                    ? "text-warning"
                                    : transaction.transaction_type === "receipt"
                                      ? "text-primary"
                                      : "text-destructive"
                              }`}
                            >
                              {formatCurrency(transaction.amount)}
                            </p>
                            {transaction.fine && (
                              <p className="text-sm text-muted-foreground">
                                {transaction.fine.toFixed(3)}g
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(transaction)}
                              className="h-8 px-3 text-xs"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(transaction)}
                              className="h-8 px-3 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const path =
                                  transaction.type === "sale"
                                    ? `/invoice/sale/${transaction.id}`
                                    : transaction.type === "purchase"
                                      ? `/invoice/purchase/${transaction.id}`
                                      : "payment_type" in transaction
                                        ? `/invoice/payment/${transaction.id}`
                                        : `/invoice/expense/${transaction.id}`;
                                window.open(path, "_blank");
                              }}
                              className="h-8 px-3 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
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
            <DialogTitle>Edit {editing?.type?.toUpperCase()}</DialogTitle>
            <DialogDescription>
              Make changes to the {editing?.type} entry here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdate)}
              className="space-y-3"
            >
              {editing?.type === "payment" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    name="amount"
                    control={editForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="gross"
                    control={editForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross (g)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="purity"
                    control={editForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purity (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
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
              )}
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
