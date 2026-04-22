import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { paymentsApi, companyApi } from "@/db/api";
import { supabase } from "@/db/supabase";
import type { PaymentWithCustomer, CompanySettings } from "@/types";
import { Button } from "@/components/ui/button";
import { downloadElementAsPdf, ensurePdfLibsLoaded } from "@/utils/pdf";

export default function PaymentInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentWithCustomer | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        let p: PaymentWithCustomer | null = null;
        if (typeof (paymentsApi as any).getById === "function") {
          p = await paymentsApi.getById(id);
        } else {
          const { data, error } = await supabase
            .from("payments")
            .select("*, customer:customers(*)")
            .eq("id", id)
            .maybeSingle();
          if (error) throw error;
          p = (data as any) ?? null;
        }
        const c = await companyApi.get();
        setPayment(p);
        setCompany(c);
      } catch (e) {
        console.error("Failed to load payment invoice:", e);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const download = async () => {
      if (payment && company && !autoDownloaded) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ensurePdfLibsLoaded();
        const el = document.getElementById("invoice-root");
        if (el) {
          await downloadElementAsPdf(el, `${payment.transaction_type === 'receipt' ? 'Receipt' : 'Payment'}_${payment.invoice_no || payment.id}.pdf`);
          setAutoDownloaded(true);
          setTimeout(() => window.close(), 200);
        }
      }
    };
    download();
  }, [payment, company, autoDownloaded]);

  const downloadPdf = async () => {
    await ensurePdfLibsLoaded();
    const el = document.getElementById("invoice-root");
    if (el) {
      await downloadElementAsPdf(el, `${payment?.transaction_type === 'receipt' ? 'Receipt' : 'Payment'}_${payment?.invoice_no || payment?.id}.pdf`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (!payment) return <div className="p-6">Loading...</div>;

  // Use the opening balance stored AT THE TIME this payment was created.
  // If opening_amount is not yet stored (older records), fall back to reverse calculation.
  let openingAmount: number;
  let openingFine: number;

  if (payment.opening_amount !== null && payment.opening_amount !== undefined) {
    // Fresh records: use stored snapshot
    openingAmount = payment.opening_amount;
    openingFine = payment.opening_fine || 0;
  } else {
    // Legacy records (created before this fix): reverse-derive from current closing balance
    const currentClosing = payment.customer?.closing_amount || 0;
    const currentClosingFine = payment.customer?.closing_fine || 0;
    if (payment.transaction_type === 'payment') {
      openingAmount = currentClosing + (payment.amount || 0);
      openingFine = currentClosingFine + (payment.fine || 0);
    } else {
      openingAmount = currentClosing - (payment.amount || 0);
      openingFine = currentClosingFine - (payment.fine || 0);
    }
  }

  // Closing balance = opening ± this transaction
  let closingAmount: number;
  let closingFine: number;
  if (payment.transaction_type === 'payment') {
    closingAmount = openingAmount - (payment.amount || 0);
    closingFine = openingFine - (payment.fine || 0);
  } else {
    closingAmount = openingAmount + (payment.amount || 0);
    closingFine = openingFine + (payment.fine || 0);
  }

  return (
    <div className="p-6 print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-xl font-bold">
          {payment.transaction_type === 'receipt' ? 'Receipt' : 'Payment'} Invoice
        </h1>
        <Button onClick={downloadPdf}>Download PDF</Button>
      </div>
      <div
        id="invoice-root"
        className="max-w-4xl mx-auto bg-white text-black p-4 sm:p-6 border print:p-6"
        style={{ minWidth: '800px' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company?.logo_url && (
              <img
                src={company.logo_url}
                alt="Logo"
                className="h-12 w-12 object-contain"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {company?.company_name || "Company"}
              </h2>
              {company?.address && <p className="text-sm">{company.address}</p>}
              {company?.phone && <p className="text-sm">📞 {company.phone}</p>}
              {company?.email && <p className="text-sm">✉️ {company.email}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
              <p className="text-sm font-bold text-gray-900">
                <span className="text-gray-600">Voucher No:</span>{" "}
                {payment.invoice_no || payment.id}
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                <span className="text-gray-600">Date:</span> {formatDate(payment.date)}
              </p>
            </div>
            <div className="inline-block">
              <span className={`px-4 py-2 border rounded font-bold text-sm ${
                payment.transaction_type === 'receipt'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                {payment.transaction_type === 'receipt' ? 'RECEIPT' : 'PAYMENT'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {payment.customer?.name || "Unknown"}
          </p>
        </div>

        <table className="w-full mt-4 border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border">
              <th className="border p-1 sm:p-2">Sr.</th>
              <th className="border p-1 sm:p-2">Particulars</th>
              <th className="border p-1 sm:p-2">Gross</th>
              <th className="border p-1 sm:p-2">Purity</th>
              <th className="border p-1 sm:p-2">Wast Badi</th>
              <th className="border p-1 sm:p-2">Rate</th>
              <th className="border p-1 sm:p-2">Fine</th>
              <th className="border p-1 sm:p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className="border p-1 sm:p-2">(1)</td>
              <td className="border p-1 sm:p-2">
                {(payment.payment_type || '').replace('_', ' ').toUpperCase()}
              </td>
              <td className="border p-1 sm:p-2">
                {(payment.gross || 0).toFixed(2)}
              </td>
              <td className="border p-1 sm:p-2">
                {(payment.purity || 0).toFixed(2)}%
              </td>
              <td className="border p-1 sm:p-2">
                {(payment.wast_badi_kg || 0).toFixed(2)}kg
              </td>
              <td className="border p-1 sm:p-2">
                {(payment.rate || 0).toFixed(2)}
              </td>
              <td className="border p-1 sm:p-2">
                {(payment.fine || 0).toFixed(3)}g
              </td>
              <td className="border p-1 sm:p-2 font-semibold bg-gray-50">
                ₹
                {(payment.amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>

        {payment.remarks && (
          <div className="mt-4 p-3 bg-gray-50 border">
            <p className="text-sm">
              <span className="font-semibold">Remarks:</span> {payment.remarks}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
          <div>
            <div className="border p-2 sm:p-3">
              <p className="font-semibold mb-2 text-sm sm:text-base">Opening Balance</p>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Amount</span>
                <span>
                  ₹
                  {openingAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  Cr.
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Fine</span>
                <span>{openingFine.toFixed(3)}g Cr.</span>
              </div>
            </div>
          </div>
          <div>
            <div className="border p-2 sm:p-3">
              <p className="font-semibold mb-2 text-sm sm:text-base">Closing Balance</p>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Amount</span>
                <span>
                  ₹
                  {closingAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  Cr.
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Fine</span>
                <span>{closingFine.toFixed(3)}g Cr.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-right text-sm border-t pt-4">
          <div className="inline-block">
            <p className="text-black" style={{ fontSize: '14px', marginBottom: '4px' }}>
              Printed on: {formatDate(new Date().toISOString().split('T')[0])}
            </p>
            <p className="text-black" style={{ fontSize: '14px', marginBottom: '4px' }}>
              For: {company?.company_name || "Company"}
            </p>
            <p className="text-black" style={{ fontSize: '12px', marginTop: '8px' }}>
              Handcrafted by Shivvilon Solutions
            </p>
            <p className="text-black" style={{ fontSize: '12px' }}>
              © {new Date().getFullYear()} SilvonX. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
