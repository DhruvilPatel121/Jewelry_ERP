// Database types matching Supabase schema

export type UserRole = 'user' | 'admin';

export type PaymentType = 'fine' | 'cash' | 'bank' | 'rate_cut_fine' | 'rate_cut_amount' | 'roopu';

export type TransactionType = 'payment' | 'receipt';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  mobile_no: string;
  city: string | null;
  gst_no: string | null;
  address: string | null;
  opening_amount: number;
  opening_fine: number;
  closing_amount: number;
  closing_fine: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  invoice_no: string;
  date: string;
  customer_id: string;
  item_name: string;
  weight: number | null;
  bag: number | null;
  net_weight: number | null;
  ghat_per_kg: number | null;
  total_ghat: number | null;
  touch: number | null;
  wastage: number | null;
  fine: number | null;
  pics: number | null;
  rate: number | null;
  amount: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  invoice_no: string;
  date: string;
  customer_id: string;
  item_name: string;
  weight: number | null;
  bag: number | null;
  net_weight: number | null;
  ghat_per_kg: number | null;
  total_ghat: number | null;
  touch: number | null;
  wastage: number | null;
  fine: number | null;
  pics: number | null;
  rate: number | null;
  amount: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  invoice_no: string;
  date: string;
  customer_id: string;
  transaction_type: TransactionType;
  payment_type: PaymentType;
  gross: number | null;
  purity: number | null;
  wast_badi_kg: number | null;
  fine: number | null;
  rate: number | null;
  amount: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  gst_no: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Form types for creating/updating records
export interface CustomerFormData {
  name: string;
  mobile_no: string;
  city?: string;
  gst_no?: string;
  address?: string;
  opening_amount?: number;
  opening_fine?: number;
}

export interface ItemFormData {
  name: string;
  description?: string;
}

export interface SaleFormData {
  date: string;
  customer_id: string;
  item_name: string;
  weight?: number;
  bag?: number;
  net_weight?: number;
  ghat_per_kg?: number;
  touch?: number;
  wastage?: number;
  pics?: number;
  rate?: number;
  remarks?: string;
}

export interface PurchaseFormData {
  date: string;
  customer_id: string;
  item_name: string;
  weight?: number;
  bag?: number;
  net_weight?: number;
  ghat_per_kg?: number;
  touch?: number;
  wastage?: number;
  pics?: number;
  rate?: number;
  remarks?: string;
}

export interface PaymentFormData {
  date: string;
  customer_id: string;
  transaction_type: TransactionType;
  payment_type: PaymentType;
  gross?: number;
  purity?: number;
  wast_badi_kg?: number;
  rate?: number;
  amount?: number;
  remarks?: string;
}

export interface ExpenseFormData {
  date: string;
  category: string;
  amount: number;
  description?: string;
}

// Extended types with customer info for display
export interface SaleWithCustomer extends Sale {
  customer?: Customer;
}

export interface PurchaseWithCustomer extends Purchase {
  customer?: Customer;
}

export interface PaymentWithCustomer extends Payment {
  customer?: Customer;
}

// Dashboard analytics types
export interface DailySummary {
  date: string;
  total_sales: number;
  total_purchases: number;
  total_payments: number;
  total_receipts: number;
  net_cash_flow: number;
}

export interface MonthlySummary {
  month: string;
  total_sales: number;
  total_purchases: number;
  profit: number;
}
