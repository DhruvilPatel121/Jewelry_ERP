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
      if (payment && !autoDownloaded) {
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
  }, [payment, autoDownloaded]);

  const downloadPdf = async () => {
    await ensurePdfLibsLoaded();
    const el = document.getElementById("invoice-root");
    if (el) {
      await downloadElementAsPdf(el, `${payment?.transaction_type === 'receipt' ? 'Receipt' : 'Payment'}_${payment?.invoice_no || payment?.id}.pdf`);
    }
  };

  if (!payment) return <div className="p-6">Loading...</div>;

  const openingAmount = payment.customer?.closing_amount || 0;
  const openingFine = payment.customer?.closing_fine || 0;
  const closingAmount = openingAmount + (payment.amount || 0);
  const closingFine = openingFine + (payment.fine || 0);

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
            <p className="text-sm">
              <span className="font-semibold">Voucher No:</span>{" "}
              {payment.invoice_no || payment.id}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Date:</span> {payment.date}
            </p>
            <span className={`inline-block mt-2 px-3 py-1 border text-sm font-semibold ${
              payment.transaction_type === 'receipt' 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {payment.transaction_type === 'receipt' ? 'RECEIPT' : 'PAYMENT'}
            </span>
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

        <div className="mt-6 p-4 bg-gray-50 border">
          <div className="flex justify-between">
            <div>
              <p className="text-sm">
                <span className="font-semibold">Opening Amount:</span> ₹
                {openingAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold">Opening Fine:</span>{" "}
                {(openingFine || 0).toFixed(3)}g
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="font-semibold">Closing Amount:</span> ₹
                {closingAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold">Closing Fine:</span>{" "}
                {(closingFine || 0).toFixed(3)}g
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-right text-sm">
          <p>Printed on {new Date().toLocaleString("en-IN")}</p>
          <p className="mt-2">For, {company?.company_name || "Company"}</p>
        </div>
      </div>
    </div>
  );
}
