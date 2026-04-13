import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { expensesApi, companyApi } from "@/db/api";
import type { Expense, CompanySettings } from "@/types";
import { Button } from "@/components/ui/button";
import { downloadElementAsPdf, ensurePdfLibsLoaded } from "@/utils/pdf";
import { supabase } from "@/db/supabase";

export default function ExpenseInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setExpense(data || null);
      const co = await companyApi.get();
      setCompany(co);
    };
    load();
  }, [id]);

  useEffect(() => {
    const download = async () => {
      if (expense && company && !autoDownloaded) {
        // Add a small delay to ensure all elements are rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ensurePdfLibsLoaded();
        const el = document.getElementById("invoice-root");
        if (el) {
          await downloadElementAsPdf(el, `Expense_${expense.id}.pdf`);
          setAutoDownloaded(true);
          setTimeout(() => window.close(), 200);
        }
      }
    };
    download();
  }, [expense, company, autoDownloaded]);

  const downloadPdf = async () => {
    await ensurePdfLibsLoaded();
    const el = document.getElementById("invoice-root");
    if (el) {
      await downloadElementAsPdf(el, `Expense_${expense?.id}.pdf`);
    }
  };
  // Format date as DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (!expense) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-xl font-bold">Expense</h1>
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
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
              <p className="text-sm font-bold text-gray-900">
                <span className="text-gray-600">Date:</span> {formatDate(expense.date)}
              </p>
            </div>
            <div className="inline-block">
              <span className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded font-bold text-sm">
                EXPENSE
              </span>
            </div>
          </div>
        </div>

        <table className="w-full mt-4 border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border">
              <th className="border p-1 sm:p-2">Category</th>
              <th className="border p-1 sm:p-2">Description</th>
              <th className="border p-1 sm:p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td className="border p-1 sm:p-2">{expense.category}</td>
              <td className="border p-1 sm:p-2">{expense.description || ""}</td>
              <td className="border p-1 sm:p-2">
                ₹
                {(expense.amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>

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
