import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
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
} from '@/types';

// Helper to get current user's company ID
let cachedCompanyId: string | null = null;

export const getCurrentCompanyId = async (): Promise<string> => {
  if (cachedCompanyId) return cachedCompanyId;
  
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) throw new Error('User document not found');
  
  const companyId = userDoc.data().company_id;
  if (!companyId) throw new Error('User not associated with a company');
  
  cachedCompanyId = companyId;
  return companyId;
};

export const clearCompanyIdCache = () => {
  cachedCompanyId = null;
};

// Helper to generate invoice number
const generateInvoiceNo = async (type: 'sale' | 'purchase' | 'payment'): Promise<string> => {
  const companyId = await getCurrentCompanyId();
  const prefix = type === 'sale' ? 'S' : type === 'purchase' ? 'P' : 'PAY';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${companyId.slice(0, 4).toUpperCase()}-${timestamp}`;
};

// Customers API
export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const companyId = await getCurrentCompanyId();
    const q = query(
      collection(db, 'customers'),
      where('company_id', '==', companyId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
  },

  async getById(id: string): Promise<Customer | null> {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const companyId = await getCurrentCompanyId();
    const data = docSnap.data();
    if (data.company_id !== companyId) throw new Error('Access denied');
    
    return { id: docSnap.id, ...data } as Customer;
  },

  async create(data: CustomerFormData): Promise<string> {
    const companyId = await getCurrentCompanyId();
    const docRef = await addDoc(collection(db, 'customers'), {
      ...data,
      company_id: companyId,
      closing_amount: data.opening_amount || 0,
      closing_fine: data.opening_fine || 0,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<CustomerFormData>): Promise<void> {
    const companyId = await getCurrentCompanyId();
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().company_id !== companyId) {
      throw new Error('Access denied');
    }
    
    await updateDoc(docRef, {
      ...data,
      updated_at: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const companyId = await getCurrentCompanyId();
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().company_id !== companyId) {
      throw new Error('Access denied');
    }
    
    await deleteDoc(docRef);
  },

  async updateBalances(
    customerId: string,
    amountChange: number,
    fineChange: number
  ): Promise<void> {
    const customer = await this.getById(customerId);
    if (!customer) throw new Error('Customer not found');
    
    const docRef = doc(db, 'customers', customerId);
    await updateDoc(docRef, {
      closing_amount: (customer.closing_amount || 0) + amountChange,
      closing_fine: (customer.closing_fine || 0) + fineChange,
      updated_at: Timestamp.now(),
    });
  },
};

// Items API
export const itemsApi = {
  async getAll(): Promise<Item[]> {
    const companyId = await getCurrentCompanyId();
    const q = query(
      collection(db, 'items'),
      where('company_id', '==', companyId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
  },

  async create(data: ItemFormData): Promise<string> {
    const companyId = await getCurrentCompanyId();
    const docRef = await addDoc(collection(db, 'items'), {
      ...data,
      company_id: companyId,
      created_at: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: ItemFormData): Promise<void> {
    const companyId = await getCurrentCompanyId();
    const docRef = doc(db, 'items', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().company_id !== companyId) {
      throw new Error('Access denied');
    }
    
    await updateDoc(docRef, data);
  },

  async delete(id: string): Promise<void> {
    const companyId = await getCurrentCompanyId();
    const docRef = doc(db, 'items', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().company_id !== companyId) {
      throw new Error('Access denied');
    }
    
    await deleteDoc(docRef);
  },
};

// Sales API
export const salesApi = {
  async getAll(startDate?: string, endDate?: string): Promise<Sale[]> {
    const companyId = await getCurrentCompanyId();
    let q = query(
      collection(db, 'sales'),
      where('company_id', '==', companyId),
      orderBy('date', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    let sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
    
    // Filter by date range if provided
    if (startDate || endDate) {
      sales = sales.filter(sale => {
        if (startDate && sale.date < startDate) return false;
        if (endDate && sale.date > endDate) return false;
        return true;
      });
    }
    
    return sales;
  },

  async create(data: SaleFormData): Promise<string> {
    const companyId = await getCurrentCompanyId();
    const invoiceNo = await generateInvoiceNo('sale');
    
    const batch = writeBatch(db);
    
    // Add sale document
    const saleRef = doc(collection(db, 'sales'));
    batch.set(saleRef, {
      ...data,
      company_id: companyId,
      invoice_no: invoiceNo,
      created_at: Timestamp.now(),
    });
    
    // Update customer balances
    const customerRef = doc(db, 'customers', data.customer_id);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
      const customer = customerSnap.data();
      batch.update(customerRef, {
        closing_amount: (customer.closing_amount || 0) + (data.amount || 0),
        closing_fine: (customer.closing_fine || 0) + (data.fine || 0),
        updated_at: Timestamp.now(),
      });
    }
    
    await batch.commit();
    return saleRef.id;
  },
};

// Purchases API
export const purchasesApi = {
  async getAll(startDate?: string, endDate?: string): Promise<Purchase[]> {
    const companyId = await getCurrentCompanyId();
    const q = query(
      collection(db, 'purchases'),
      where('company_id', '==', companyId),
      orderBy('date', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    let purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
    
    if (startDate || endDate) {
      purchases = purchases.filter(purchase => {
        if (startDate && purchase.date < startDate) return false;
        if (endDate && purchase.date > endDate) return false;
        return true;
      });
    }
    
    return purchases;
  },

  async create(data: PurchaseFormData): Promise<string> {
    const companyId = await getCurrentCompanyId();
    const invoiceNo = await generateInvoiceNo('purchase');
    
    const batch = writeBatch(db);
    
    const purchaseRef = doc(collection(db, 'purchases'));
    batch.set(purchaseRef, {
      ...data,
      company_id: companyId,
      invoice_no: invoiceNo,
      created_at: Timestamp.now(),
    });
    
    const customerRef = doc(db, 'customers', data.customer_id);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
      const customer = customerSnap.data();
      batch.update(customerRef, {
        closing_amount: (customer.closing_amount || 0) - (data.amount || 0),
        closing_fine: (customer.closing_fine || 0) - (data.fine || 0),
        updated_at: Timestamp.now(),
      });
    }
    
    await batch.commit();
    return purchaseRef.id;
  },
};

// Payments API
export const paymentsApi = {
  async getAll(startDate?: string, endDate?: string): Promise<Payment[]> {
    const companyId = await getCurrentCompanyId();
    const q = query(
      collection(db, 'payments'),
      where('company_id', '==', companyId),
      orderBy('date', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    let payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    
    if (startDate || endDate) {
      payments = payments.filter(payment => {
        if (startDate && payment.date < startDate) return false;
        if (endDate && payment.date > endDate) return false;
        return true;
      });
    }
    
    return payments;
  },

  async create(data: PaymentFormData): Promise<string> {
    const companyId = await getCurrentCompanyId();
    const invoiceNo = await generateInvoiceNo('payment');
    
    const batch = writeBatch(db);
    
    const paymentRef = doc(collection(db, 'payments'));
    batch.set(paymentRef, {
      ...data,
      company_id: companyId,
      invoice_no: invoiceNo,
      created_at: Timestamp.now(),
    });
    
    const customerRef = doc(db, 'customers', data.customer_id);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
      const customer = customerSnap.data();
      const multiplier = data.transaction_type === 'payment' ? -1 : 1;
      batch.update(customerRef, {
        closing_amount: (customer.closing_amount || 0) + (data.amount || 0) * multiplier,
        updated_at: Timestamp.now(),
      });
    }
    
    await batch.commit();
    return paymentRef.id;
  },
};

// Expenses API
export const expensesApi = {
  async getAll(): Promise<Expense[]> {
    const companyId = await getCurrentCompanyId();
    const q = query(
      collection(db, 'expenses'),
      where('company_id', '==', companyId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  },

  async create(data: ExpenseFormData): Promise<string> {
    const companyId = await getCurrentCompanyId();
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...data,
      company_id: companyId,
      created_at: Timestamp.now(),
    });
    return docRef.id;
  },

  async delete(id: string): Promise<void> {
    const companyId = await getCurrentCompanyId();
    const docRef = doc(db, 'expenses', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || docSnap.data().company_id !== companyId) {
      throw new Error('Access denied');
    }
    
    await deleteDoc(docRef);
  },
};

// Company API
export const companyApi = {
  async get(): Promise<CompanySettings | null> {
    const companyId = await getCurrentCompanyId();
    const docRef = doc(db, 'companies', companyId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as CompanySettings;
  },

  async upsert(data: Partial<CompanySettings>): Promise<void> {
    const companyId = await getCurrentCompanyId();
    const docRef = doc(db, 'companies', companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...data,
        updated_at: Timestamp.now(),
      });
    } else {
      await updateDoc(docRef, {
        ...data,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
    }
  },
};

// Analytics API
export const analyticsApi = {
  async getDashboardSummary() {
    const companyId = await getCurrentCompanyId();
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's sales
    const salesQuery = query(
      collection(db, 'sales'),
      where('company_id', '==', companyId),
      where('date', '==', today)
    );
    const salesSnap = await getDocs(salesQuery);
    const todaySales = salesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    
    // Get today's purchases
    const purchasesQuery = query(
      collection(db, 'purchases'),
      where('company_id', '==', companyId),
      where('date', '==', today)
    );
    const purchasesSnap = await getDocs(purchasesQuery);
    const todayPurchases = purchasesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    
    // Get all sales for total
    const allSalesQuery = query(
      collection(db, 'sales'),
      where('company_id', '==', companyId)
    );
    const allSalesSnap = await getDocs(allSalesQuery);
    const totalSales = allSalesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    
    // Get all purchases for total
    const allPurchasesQuery = query(
      collection(db, 'purchases'),
      where('company_id', '==', companyId)
    );
    const allPurchasesSnap = await getDocs(allPurchasesQuery);
    const totalPurchases = allPurchasesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    
    return {
      todaySales,
      todayPurchases,
      totalSales,
      totalPurchases,
      totalCash: 0, // Calculate from payments
      totalBank: 0, // Calculate from payments
    };
  },
};
