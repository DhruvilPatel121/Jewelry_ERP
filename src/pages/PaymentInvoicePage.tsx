import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { paymentsApi, companyApi, customersApi } from "@/db/api";
import type { PaymentWithCustomer, CompanySettings, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { downloadElementAsPdf, ensurePdfLibsLoaded } from "@/utils/pdf";

export default function PaymentInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentWithCustomer | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const single = await paymentsApi.getById(id);
      setPayment(single);
      if (single?.customer_id) {
        const c = await customersApi.getById(single.customer_id);
        setCustomer(c);
      }
      const co = await companyApi.get();
      setCompany(co);
    };
    load();
  }, [id]);

  useEffect(() => {
    const download = async () => {
      if (payment && !autoDownloaded) {
        await ensurePdfLibsLoaded();
        const el = document.getElementById("invoice-root");
        if (el) {
          await downloadElementAsPdf(
            el,
            `${payment.transaction_type.toUpperCase()}_${payment.invoice_no}.pdf`,
          );
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
      await downloadElementAsPdf(
        el,
        `${payment?.transaction_type.toUpperCase()}_${payment?.invoice_no}.pdf`,
      );
    }
  };
  if (!payment) return <div className="p-6">Loading...</div>;

  const openingAmount = customer?.closing_amount || 0;
  const openingFine = customer?.closing_fine || 0;
  const multiplier = payment.transaction_type === "payment" ? -1 : 1;
  const closingAmount = openingAmount + (payment.amount || 0) * multiplier;
  const closingFine = openingFine + (payment.fine || 0) * multiplier;

  return (
    <div className="p-6 print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-xl font-bold">Payment/Receipt</h1>
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
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <span className="font-semibold">Voucher No:</span>{" "}
              {payment.invoice_no}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Date:</span> {payment.date}
            </p>
            <span className="inline-block mt-2 px-3 py-1 border text-sm">
              {payment.transaction_type.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {customer?.name || "Unknown"}
          </p>
        </div>

        <table className="w-full mt-4 border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border">
              <th className="border p-1 sm:p-2">Type</th>
              <th className="border p-1 sm:p-2">Payment Mode</th>
              <th className="border p-1 sm:p-2">Gross</th>
              <th className="border p-1 sm:p-2">Purity</th>
              <th className="border p-1 sm:p-2">Fine</th>
              <th className="border p-1 sm:p-2">Rate</th>
              <th className="border p-1 sm:p-2">Amount</th>
              <th className="border p-1 sm:p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className="border p-1 sm:p-2 capitalize">
                {payment.transaction_type}
              </td>
              <td className="border p-1 sm:p-2 capitalize">{payment.payment_type}</td>
              <td className="border p-1 sm:p-2">{(payment.gross || 0).toFixed(3)}</td>
              <td className="border p-1 sm:p-2">
                {(payment.purity || 0).toFixed(3)}%
              </td>
              <td className="border p-1 sm:p-2">{(payment.fine || 0).toFixed(3)}g</td>
              <td className="border p-1 sm:p-2">{(payment.rate || 0).toFixed(2)}</td>
              <td className="border p-1 sm:p-2">
                ₹
                {(payment.amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="border p-1 sm:p-2">{payment.remarks || ""}</td>
            </tr>
          </tbody>
        </table>

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

        <div className="mt-6 text-right text-sm">
          <p>Printed on {new Date().toLocaleString("en-IN")}</p>
          <p className="mt-2">For, {company?.company_name || "Company"}</p>
        </div>
      </div>
    </div>
  );
}
