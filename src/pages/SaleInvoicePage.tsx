import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { salesApi, companyApi } from "@/db/api";
import { supabase } from "@/db/supabase";
import type { SaleWithCustomer, CompanySettings } from "@/types";
import { Button } from "@/components/ui/button";
import { downloadElementAsPdf, ensurePdfLibsLoaded } from "@/utils/pdf";

export default function SaleInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<SaleWithCustomer | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        let s: SaleWithCustomer | null = null;
        if (typeof (salesApi as any).getById === "function") {
          s = await salesApi.getById(id);
        } else {
          const { data, error } = await supabase
            .from("sales")
            .select("*, customer:customers(*)")
            .eq("id", id)
            .maybeSingle();
          if (error) throw error;
          s = (data as any) ?? null;
        }
        const c = await companyApi.get();
        setSale(s);
        setCompany(c);
      } catch (e) {
        console.error("Failed to load sale invoice:", e);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const download = async () => {
      if (sale && !autoDownloaded) {
        await ensurePdfLibsLoaded();
        const el = document.getElementById("invoice-root");
        if (el) {
          await downloadElementAsPdf(el, `Sale_${sale.invoice_no}.pdf`);
          setAutoDownloaded(true);
          setTimeout(() => window.close(), 200);
        }
      }
    };
    download();
  }, [sale, autoDownloaded]);

  const downloadPdf = async () => {
    await ensurePdfLibsLoaded();
    const el = document.getElementById("invoice-root");
    if (el) {
      await downloadElementAsPdf(el, `Sale_${sale?.invoice_no}.pdf`);
    }
  };

  if (!sale) return <div className="p-6">Loading...</div>;

  const openingAmount = sale.customer?.closing_amount || 0;
  const openingFine = sale.customer?.closing_fine || 0;
  const closingAmount = openingAmount + (sale.amount || 0);
  const closingFine = openingFine + (sale.fine || 0);

  return (
    <div className="p-6 print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-xl font-bold">Sale Invoice</h1>
        <Button onClick={downloadPdf}>Download PDF</Button>
      </div>
      <div
        id="invoice-root"
        className="max-w-4xl mx-auto bg-white text-black p-6 border"
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
              {sale.invoice_no}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Date:</span> {sale.date}
            </p>
            <span className="inline-block mt-2 px-3 py-1 border text-sm">
              OUTGOING
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {sale.customer?.name || "Unknown"}
          </p>
        </div>

        <table className="w-full mt-4 border-collapse text-sm">
          <thead>
            <tr className="border">
              <th className="border p-2">Sr.</th>
              <th className="border p-2">Particulars</th>
              <th className="border p-2">Gross Wt</th>
              <th className="border p-2">Bag Wt</th>
              <th className="border p-2">Net Wt</th>
              <th className="border p-2">Touch</th>
              <th className="border p-2">Wast</th>
              <th className="border p-2">Fine</th>
              <th className="border p-2">Pc/Pair</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Cash</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className="border p-2">(1)</td>
              <td className="border p-2">{sale.item_name}</td>
              <td className="border p-2">{(sale.weight || 0).toFixed(2)}</td>
              <td className="border p-2">{(sale.bag || 0).toFixed(2)}</td>
              <td className="border p-2">
                {(
                  sale.net_weight || (sale.weight || 0) - (sale.bag || 0)
                ).toFixed(2)}
              </td>
              <td className="border p-2">{(sale.touch || 0).toFixed(2)}</td>
              <td className="border p-2">{(sale.wastage || 0).toFixed(2)}</td>
              <td className="border p-2">{(sale.fine || 0).toFixed(2)}</td>
              <td className="border p-2">{(sale.pics || 0).toFixed(2)}</td>
              <td className="border p-2">{(sale.rate || 0).toFixed(2)}</td>
              <td className="border p-2">
                ₹
                {(sale.amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr className="border font-semibold">
              <td className="border p-2" colSpan={2}>
                Totals
              </td>
              <td className="border p-2">{(sale.weight || 0).toFixed(2)}</td>
              <td className="border p-2">{(sale.bag || 0).toFixed(2)}</td>
              <td className="border p-2">
                {(
                  sale.net_weight || (sale.weight || 0) - (sale.bag || 0)
                ).toFixed(2)}
              </td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2">{(sale.fine || 0).toFixed(2)}</td>
              <td className="border p-2">0.00</td>
              <td className="border p-2">{(sale.rate || 0).toFixed(2)}</td>
              <td className="border p-2">
                ₹
                {(sale.amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <div className="border p-3">
              <p className="font-semibold mb-2">Opening Balance</p>
              <div className="flex justify-between">
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
              <div className="flex justify-between">
                <span>Fine</span>
                <span>{openingFine.toFixed(3)}g Cr.</span>
              </div>
            </div>
          </div>
          <div>
            <div className="border p-3">
              <p className="font-semibold mb-2">Closing Balance</p>
              <div className="flex justify-between">
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
              <div className="flex justify-between">
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
