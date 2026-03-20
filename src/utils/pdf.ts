declare global {
  interface Window {
    html2canvas?: any;
    jspdf?: any;
  }
}

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

export async function ensurePdfLibsLoaded() {
  if (!window.jspdf) {
    await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
  }
  if (!window.html2canvas) {
    await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  }
}

export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  await ensurePdfLibsLoaded();
  const html2canvas = window.html2canvas;
  const { jsPDF } = window.jspdf;

  // Detect if mobile device
  const isMobile = window.innerWidth <= 768;
  
  // Add a small delay to ensure all elements are rendered
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Enhanced canvas settings for better text rendering
  const canvas = await html2canvas(element, {
    scale: isMobile ? 4 : 3, // Higher scale for better text clarity
    useCORS: true,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    logging: false,
    removeContainer: false,
    foreignObjectRendering: false,
    imageTimeout: 15000,
    onclone: (clonedDoc) => {
      // Ensure all text is black for PDF rendering
      const allElements = clonedDoc.querySelectorAll('*');
      allElements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.color && computedStyle.color !== 'rgb(0, 0, 0)') {
          (el as HTMLElement).style.color = '#000000';
        }
      });
    }
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // Page size A4 in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = isMobile ? 5 : 10; // Smaller margins on mobile

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
}
