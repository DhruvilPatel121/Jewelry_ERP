import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Download, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { salesApi, purchasesApi, paymentsApi, companyApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

interface ActionButtonsProps {
  type: 'sale' | 'purchase' | 'payment';
  id: string;
  onEdit?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  size?: 'sm' | 'default';
  className?: string;
}

export default function ActionButtons({ 
  type, 
  id, 
  onEdit, 
  onDownload, 
  onDelete, 
  size = 'sm',
  className = '' 
}: ActionButtonsProps) {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      const editRoute = type === 'sale' ? '/new-sale' : 
                       type === 'purchase' ? '/new-purchase' : 
                       '/new-payment';
      navigate(`${editRoute}?edit=${id}`);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    let toastId: string | number | undefined;

    try {
      setIsDownloading(true);
      
      // Show loading message and store the toast ID
      toastId = toast.loading(`Generating ${type} PDF...`);
      
      // Load the data directly and generate PDF
      let data: any;
      let company: any;
      
      // Load company settings
      company = await companyApi.get();
      
      // Load transaction data based on type
      if (type === 'sale') {
        if (typeof (salesApi as any).getById === "function") {
          data = await salesApi.getById(id);
        } else {
          const { data: saleData } = await supabase
            .from("sales")
            .select("*, customer:customers(*)")
            .eq("id", id)
            .maybeSingle();
          data = saleData;
        }
      } else if (type === 'purchase') {
        if (typeof (purchasesApi as any).getById === "function") {
          data = await purchasesApi.getById(id);
        } else {
          const { data: purchaseData } = await supabase
            .from("purchases")
            .select("*, customer:customers(*)")
            .eq("id", id)
            .maybeSingle();
          data = purchaseData;
        }
      } else if (type === 'payment') {
        if (typeof (paymentsApi as any).getById === "function") {
          data = await paymentsApi.getById(id);
        } else {
          const { data: paymentData } = await supabase
            .from("payments")
            .select("*, customer:customers(*)")
            .eq("id", id)
            .maybeSingle();
          data = paymentData;
        }
      }

      if (!data) {
        // Dismiss loading toast and show error
        if (toastId) {
          toast.dismiss(toastId);
        }
        toast.error(`Failed to load ${type} data`);
        setIsDownloading(false);
        return;
      }

      // Generate invoice HTML and download PDF
      await generateAndDownloadPdf(data, company, type);
      
      // Dismiss loading toast and show success
      if (toastId) {
        toast.dismiss(toastId);
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} PDF downloaded successfully!`);
      
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // Dismiss loading toast and show error
      if (toastId) {
        toast.dismiss(toastId);
      }
      toast.error(`Failed to download ${type} PDF`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const generateAndDownloadPdf = async (data: any, company: any, transactionType: string) => {
    try {
      // Load PDF libraries
      await loadPdfLibraries();
      
      // Create invoice HTML
      const invoiceHtml = createInvoiceHtml(data, company, transactionType);
      
      // Create a temporary div to render the invoice
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = invoiceHtml;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);
      
      // Wait for rendering, then generate PDF
      setTimeout(async () => {
        await downloadElementAsPdf(tempDiv, `${transactionType}_${data.invoice_no || data.id}.pdf`);
        document.body.removeChild(tempDiv);
      }, 500);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const loadPdfLibraries = async () => {
    if (!window.jspdf) {
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
    }
    if (!window.html2canvas) {
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
    }
  };

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const existing = Array.from(document.getElementsByTagName('script')).find(
        (s) => s.src === src
      );
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  const downloadElementAsPdf = async (element: HTMLElement, filename: string) => {
    const html2canvas = (window as any).html2canvas;
    const { jsPDF } = (window as any).jspdf;

    // Detect if mobile device
    const isMobile = window.innerWidth <= 768;
    
    // Responsive canvas settings
    const canvas = await html2canvas(element, {
      scale: isMobile ? 3 : 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: element.scrollHeight,
      windowWidth: 800,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Page size A4 in mm
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = isMobile ? 5 : 10;

    // Convert canvas size (px) to mm (approx 1mm = 3.78px)
    const pxToMm = (px: number) => px / 3.78;
    const contentWidthMm = pxToMm(canvas.width);
    const contentHeightMm = pxToMm(canvas.height);

    // Scale to fit page width/height with responsive considerations
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const scale = Math.min(maxWidth / contentWidthMm, maxHeight / contentHeightMm);
    const renderWidth = contentWidthMm * scale;
    const renderHeight = contentHeightMm * scale;

    const pdf = new jsPDF({
      orientation: contentHeightMm > contentWidthMm ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    pdf.addImage(imgData, 'PNG', margin, margin, renderWidth, renderHeight);
    pdf.save(filename);
  };

  const createInvoiceHtml = (data: any, company: any, type: string) => {
    const isSale = type === 'sale';
    const isPurchase = type === 'purchase';
    const isPayment = type === 'payment';
    
    const openingAmount = data.customer?.closing_amount || 0;
    const openingFine = data.customer?.closing_fine || 0;
    const closingAmount = openingAmount + (data.amount || 0);
    const closingFine = openingFine + (data.fine || 0);

    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: white; min-width: 800px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #eee;">
          <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
            ${company?.logo_url ? `
              <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; border-radius: 8px; background: white; padding: 4px;">
                <img src="${company.logo_url}" alt="Company Logo" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;" />
              </div>
            ` : `
              <div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
                <span style="font-size: 24px; color: #999; font-weight: bold;">${(company?.company_name || 'Company').charAt(0)}</span>
              </div>
            `}
            <div style="flex: 1;">
              <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333; line-height: 1.2;">${company?.company_name || 'Company'}</h2>
              ${company?.address ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #666; line-height: 1.4;">${company.address}</p>` : ''}
              ${company?.phone ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #666;">📞 ${company.phone}</p>` : ''}
              ${company?.email ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #666;">✉️ ${company.email}</p>` : ''}
            </div>
          </div>
          <div style="text-align: right; min-width: 200px;">
            <div style="display: inline-block; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px;">
              <p style="margin: 0; font-size: 13px; color: #555;"><strong>Voucher No:</strong> ${data.invoice_no || data.id}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #555;"><strong>Date:</strong> ${data.date}</p>
            </div>
            <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
              ${isPayment ? 
                (data.transaction_type === 'receipt' ? '<span style="background: #28a745; color: white;">RECEIPT</span>' : '<span style="background: #dc3545; color: white;">PAYMENT</span>') : 
                '<span style="background: #6c757d; color: white;">TRANSACTION</span>'
              }
            </span>
          </div>
        </div>

        <div style="margin-top: 16px;">
          <p><strong>Name:</strong> ${data.customer?.name || 'Unknown'}</p>
        </div>

        ${isPayment ? `
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse; font-size: 12px; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-weight: 600; color: #495057;">Particulars</th>
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Gross</th>
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Purity (%)</th>
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Wast Badi (kg)</th>
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Rate</th>
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Fine</th>
                <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: 600; color: #495057;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border: 1px solid #ddd; background: white;">
                <td style="border: 1px solid #ddd; padding: 12px 8px; vertical-align: middle;">${(data.payment_type || '').replace('_', ' ')}</td>
                <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; vertical-align: middle;">${(data.gross || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; vertical-align: middle;">${(data.purity || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; vertical-align: middle;">${(data.wast_badi_kg || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; vertical-align: middle;">${(data.rate || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; vertical-align: middle;">${(data.fine || 0).toFixed(3)}g</td>
                <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; vertical-align: middle; font-weight: bold; background: #f8f9fa;">${(data.amount || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          ${data.remarks ? `
            <div style="margin-top: 16px;">
              <p style="font-size: 13px; color: #495057;"><strong>Remarks:</strong> ${data.remarks}</p>
            </div>
          ` : ''}

          <div style="margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <p style="margin: 0; font-size: 13px; color: #495057;"><strong>Opening Amount:</strong> ₹${openingAmount.toLocaleString('en-IN')}</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #495057;"><strong>Opening Fine:</strong> ${(openingFine || 0).toFixed(3)}g</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 13px; color: #495057;"><strong>Closing Amount:</strong> ₹${closingAmount.toLocaleString('en-IN')}</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #495057;"><strong>Closing Fine:</strong> ${(closingFine || 0).toFixed(3)}g</p>
              </div>
            </div>
          </div>
        ` : `
          <!-- Sales/Purchase table structure remains the same -->
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse; font-size: 11px; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: left; font-weight: 600; color: #495057; white-space: nowrap;">Sr.</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: left; font-weight: 600; color: #495057;">Particulars</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Gross Wt</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Bag Wt</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Net Wt</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Touch</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Wast</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Fine</th>
                ${isSale || isPurchase ? '<th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Pc/Pair</th>' : ''}
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Rate</th>
                <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; font-weight: 600; color: #495057; white-space: nowrap;">Cash</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border: 1px solid #ddd; background: white;">
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; vertical-align: middle;">1</td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; vertical-align: middle;">${data.item_name || (data.payment_type || '').replace('_', ' ')}</td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">${(data.weight || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">${(data.bag || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">
                  ${((data.net_weight || (data.weight || 0) - (data.bag || 0)).toFixed(2))}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">${(data.touch || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">${(data.wastage || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">${(data.fine || 0).toFixed(2)}</td>
                ${isSale || isPurchase ? `<td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">${(data.pics || 0).toFixed(2)}</td>` : ''}
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle;">${(data.rate || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px 6px; text-align: right; vertical-align: middle; font-weight: bold; background: #f8f9fa;">${(data.amount || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <p style="margin: 0; font-size: 13px; color: #495057;"><strong>Opening Amount:</strong> ₹${openingAmount.toLocaleString('en-IN')}</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #495057;"><strong>Opening Fine:</strong> ${(openingFine || 0).toFixed(3)}g</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 13px; color: #495057;"><strong>Closing Amount:</strong> ₹${closingAmount.toLocaleString('en-IN')}</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #495057;"><strong>Closing Fine:</strong> ${(closingFine || 0).toFixed(3)}g</p>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Edit Button */}
      <Button
        variant="ghost"
        size="icon"
        className={buttonSize}
        onClick={handleEdit}
        title={`Edit ${type}`}
      >
        <Edit className={iconSize} />
      </Button>

      {/* Download Button */}
      <Button
        variant="ghost"
        size="icon"
        className={buttonSize}
        onClick={handleDownload}
        title={`Download ${type} invoice`}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <Download className={iconSize} />
        )}
      </Button>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${buttonSize} text-destructive hover:text-destructive`}
            title={`Delete ${type}`}
          >
            <Trash2 className={iconSize} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {type.charAt(0).toUpperCase() + type.slice(1)}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {type} transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
