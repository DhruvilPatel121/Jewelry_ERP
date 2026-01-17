import { supabase } from './supabase';
import type {
  Customer,
  CustomerFormData,
  Item,
  ItemFormData,
  Sale,
  SaleFormData,
  Purchase,
  PurchaseFormData,
  Payment,
  PaymentFormData,
  Expense,
  ExpenseFormData,
  CompanySettings,
  SaleWithCustomer,
  PurchaseWithCustomer,
  PaymentWithCustomer,
} from '@/types';

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

// Generate invoice number
const generateInvoiceNo = async (type: 'sale' | 'purchase' | 'payment'): Promise<string> => {
  const prefix = type === 'sale' ? 'S' : type === 'purchase' ? 'P' : 'PAY';
  const timestamp = Date.now().toString().slice(-8);
  return `${prefix}-${timestamp}`;
};

// Customers API
export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(formData: CustomerFormData): Promise<Customer> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        ...formData,
        closing_amount: formData.opening_amount || 0,
        closing_fine: formData.opening_fine || 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<CustomerFormData>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateBalances(customerId: string, amountDelta: number, fineDelta: number): Promise<void> {
    const customer = await this.getById(customerId);
    if (!customer) throw new Error('Customer not found');

    const { error } = await supabase
      .from('customers')
      .update({
        closing_amount: (customer.closing_amount || 0) + amountDelta,
        closing_fine: (customer.closing_fine || 0) + fineDelta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);
    
    if (error) throw error;
  },
};

// Items API
export const itemsApi = {
  async getAll(): Promise<Item[]> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(formData: ItemFormData): Promise<Item> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('items')
      .insert({ user_id: userId, ...formData })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ItemFormData>): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Sales API
export const salesApi = {
  async getAll(startDate?: string, endDate?: string): Promise<SaleWithCustomer[]> {
    const userId = await getCurrentUserId();
    let query = supabase
      .from('sales')
      .select('*, customer:customers(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByCustomer(customerId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(formData: SaleFormData): Promise<Sale> {
    const userId = await getCurrentUserId();
    const invoiceNo = await generateInvoiceNo('sale');
    
    // Calculate values
    const netWeight = formData.net_weight || 0;
    const ghatPerKg = formData.ghat_per_kg || 0;
    const totalGhat = (netWeight * ghatPerKg) / 1000;
    const touch = formData.touch || 0;
    const wastage = formData.wastage || 0;
    const fine = (netWeight + totalGhat) * (touch + wastage) / 100;
    const rate = formData.rate || 0;
    const pics = formData.pics || 0;
    const amount = pics > 0 ? pics * rate : (netWeight * rate) / 1000;

    const { data, error } = await supabase
      .from('sales')
      .insert({
        user_id: userId,
        invoice_no: invoiceNo,
        ...formData,
        total_ghat: totalGhat,
        fine,
        amount,
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update customer balances
    await customersApi.updateBalances(formData.customer_id, amount, fine);

    return data;
  },

  async delete(id: string): Promise<void> {
    // Get sale details first to reverse customer balance
    const { data: sale } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (sale) {
      await customersApi.updateBalances(
        sale.customer_id,
        -(sale.amount || 0),
        -(sale.fine || 0)
      );
    }

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getDailySummary(date: string): Promise<{ total: number; count: number }> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('sales')
      .select('amount')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (error) throw error;
    
    const sales = Array.isArray(data) ? data : [];
    const total = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    return { total, count: sales.length };
  },
};

// Purchases API
export const purchasesApi = {
  async getAll(startDate?: string, endDate?: string): Promise<PurchaseWithCustomer[]> {
    const userId = await getCurrentUserId();
    let query = supabase
      .from('purchases')
      .select('*, customer:customers(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByCustomer(customerId: string): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(formData: PurchaseFormData): Promise<Purchase> {
    const userId = await getCurrentUserId();
    const invoiceNo = await generateInvoiceNo('purchase');
    
    // Calculate values
    const netWeight = formData.net_weight || 0;
    const ghatPerKg = formData.ghat_per_kg || 0;
    const totalGhat = (netWeight * ghatPerKg) / 1000;
    const touch = formData.touch || 0;
    const wastage = formData.wastage || 0;
    const fine = (netWeight + totalGhat) * (touch + wastage) / 100;
    const rate = formData.rate || 0;
    const pics = formData.pics || 0;
    const amount = pics > 0 ? pics * rate : (netWeight * rate) / 1000;

    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        invoice_no: invoiceNo,
        ...formData,
        total_ghat: totalGhat,
        fine,
        amount,
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update customer balances (negative for purchases)
    await customersApi.updateBalances(formData.customer_id, -amount, -fine);

    return data;
  },

  async delete(id: string): Promise<void> {
    // Get purchase details first to reverse customer balance
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (purchase) {
      await customersApi.updateBalances(
        purchase.customer_id,
        purchase.amount || 0,
        purchase.fine || 0
      );
    }

    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getDailySummary(date: string): Promise<{ total: number; count: number }> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('purchases')
      .select('amount')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (error) throw error;
    
    const purchases = Array.isArray(data) ? data : [];
    const total = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
    return { total, count: purchases.length };
  },
};

// Payments API
export const paymentsApi = {
  async getAll(startDate?: string, endDate?: string): Promise<PaymentWithCustomer[]> {
    const userId = await getCurrentUserId();
    let query = supabase
      .from('payments')
      .select('*, customer:customers(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByCustomer(customerId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(formData: PaymentFormData): Promise<Payment> {
    const userId = await getCurrentUserId();
    const invoiceNo = await generateInvoiceNo('payment');
    
    // Calculate fine if gross and purity provided
    const gross = formData.gross || 0;
    const purity = formData.purity || 0;
    const fine = gross * purity / 100;
    const rate = formData.rate || 0;
    const rateCutFine = (fine * rate) / 1000;

    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        invoice_no: invoiceNo,
        ...formData,
        fine,
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update customer balances based on transaction type
    const amount = formData.amount || 0;
    const amountDelta = formData.transaction_type === 'payment' ? -amount : amount;
    const fineDelta = formData.transaction_type === 'payment' ? -fine : fine;
    
    await customersApi.updateBalances(formData.customer_id, amountDelta, fineDelta);

    return data;
  },

  async delete(id: string): Promise<void> {
    // Get payment details first to reverse customer balance
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (payment) {
      const amountDelta = payment.transaction_type === 'payment' 
        ? (payment.amount || 0) 
        : -(payment.amount || 0);
      const fineDelta = payment.transaction_type === 'payment' 
        ? (payment.fine || 0) 
        : -(payment.fine || 0);
      
      await customersApi.updateBalances(payment.customer_id, amountDelta, fineDelta);
    }

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Expenses API
export const expensesApi = {
  async getAll(startDate?: string, endDate?: string): Promise<Expense[]> {
    const userId = await getCurrentUserId();
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(formData: ExpenseFormData): Promise<Expense> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('expenses')
      .insert({ user_id: userId, ...formData })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Company Settings API
export const companyApi = {
  async get(): Promise<CompanySettings | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async upsert(formData: Partial<CompanySettings>): Promise<CompanySettings> {
    const userId = await getCurrentUserId();
    const existing = await this.get();

    if (existing) {
      const { data, error } = await supabase
        .from('company_settings')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('company_settings')
        .insert({ user_id: userId, ...formData })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
};

// Dashboard Analytics API
export const analyticsApi = {
  async getDashboardSummary() {
    const userId = await getCurrentUserId();
    const today = new Date().toISOString().split('T')[0];

    // Get today's sales and purchases
    const [salesSummary, purchasesSummary] = await Promise.all([
      salesApi.getDailySummary(today),
      purchasesApi.getDailySummary(today),
    ]);

    // Get total cash and bank from payments
    const { data: payments } = await supabase
      .from('payments')
      .select('payment_type, amount, transaction_type')
      .eq('user_id', userId);

    const cashPayments = Array.isArray(payments) ? payments : [];
    let totalCash = 0;
    let totalBank = 0;

    cashPayments.forEach(payment => {
      const amount = payment.amount || 0;
      const multiplier = payment.transaction_type === 'receipt' ? 1 : -1;
      
      if (payment.payment_type === 'cash') {
        totalCash += amount * multiplier;
      } else if (payment.payment_type === 'bank') {
        totalBank += amount * multiplier;
      }
    });

    return {
      todaySales: salesSummary.total,
      todayPurchases: purchasesSummary.total,
      totalCash,
      totalBank,
      salesCount: salesSummary.count,
      purchasesCount: purchasesSummary.count,
    };
  },

  async getMonthlyTrends(months: number = 6) {
    const userId = await getCurrentUserId();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split('T')[0];

    const [sales, purchases] = await Promise.all([
      salesApi.getAll(startDateStr),
      purchasesApi.getAll(startDateStr),
    ]);

    // Group by month
    const monthlyData: Record<string, { sales: number; purchases: number }> = {};

    sales.forEach(sale => {
      const month = sale.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { sales: 0, purchases: 0 };
      monthlyData[month].sales += sale.amount || 0;
    });

    purchases.forEach(purchase => {
      const month = purchase.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { sales: 0, purchases: 0 };
      monthlyData[month].purchases += purchase.amount || 0;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        sales: data.sales,
        purchases: data.purchases,
        profit: data.sales - data.purchases,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  },
};
