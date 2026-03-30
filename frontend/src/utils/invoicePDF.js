import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const COMPANY = {
  name:    'Maa Mamta Enterprises',
  address: 'Sarwara Chowk (Near Chiran Machine), Bajpatti',
  city:    'Sitamarhi, Bihar, 843314',
  phone:   '9661514131, 9304681084',
  email:   'maamamtaenterprises1402@gmail.com',
  gstin:   '10FXFPK2668H1ZJ',
  fssai:   '10426090000037',
};

const RS = 'Rs.';

async function imgToBase64(url) {
  const res  = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  const convert = (n) => {
    if (n < 20)       return ones[n];
    if (n < 100)      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000)     return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000)   return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  const rupees = Math.floor(num);
  const paise  = Math.round((num - rupees) * 100);
  let result   = convert(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result + ' Only';
}

export async function generateInvoicePDF(order, cartItems, paidAmount, cashierName) {
  const [maaB64, relianceB64, campaB64] = await Promise.all([
    imgToBase64('/logo.jpg'),
    imgToBase64('/reliance.jpg'),
    imgToBase64('/campa.jpg'),
  ]);

  const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 14;

  // ════════════════════════════════════════════════════
  // HEADER SECTION
  // Layout:
  //   Row 1 — Reliance logo (left) | "Bill Invoice" center | Campa logo (right)
  //   Row 2 — Company name + details (left) | Maa Mamta logo (right)
  // ════════════════════════════════════════════════════

  // ── Row 1: Reliance logo (top-left) ──────────────────
  doc.addImage(relianceB64, 'JPEG', margin, 8, 42, 18, undefined, 'FAST');

  // ── Row 1: "Bill Invoice" title (center) ─────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text('Bill Invoice', pageW / 2, 17, { align: 'center' });

  // ── Row 1: Campa logo (top-right) ────────────────────
  doc.addImage(campaB64, 'JPEG', pageW - margin - 42, 8, 42, 18, undefined, 'FAST');

  // ── Thin separator line between row1 and row2 ────────
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, 28, pageW - margin, 28);

  // ── Row 2: Company name + details (left) ─────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(COMPANY.name, margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  [
    COMPANY.address,
    COMPANY.city,
    `Phone: ${COMPANY.phone}`,
    `Email: ${COMPANY.email}`,
    `GSTIN: ${COMPANY.gstin}`,
    `FSSAI: ${COMPANY.fssai}`,
  ].forEach((line, i) => doc.text(line, margin, 41 + i * 4.5));

  // ── Row 2: Maa Mamta logo (right, circular style) ────
  // Logo centered on right side between y=28 and divider
  const logoSize = 32;
  const logoX    = pageW - margin - logoSize;
  const logoY    = 29;
  doc.addImage(maaB64, 'JPEG', logoX, logoY, logoSize, logoSize, undefined, 'FAST');

  // ── Main divider ──────────────────────────────────────
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(margin, 64, pageW - margin, 64);

  // ════════════════════════════════════════════════════
  // CUSTOMER + INVOICE META
  // ════════════════════════════════════════════════════
  const now = new Date(order.createdAt || new Date());

  // Customer (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text('Customer:', margin, 73);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName || 'N/A', margin + 23, 73);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Mobile:', margin, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerPhone || 'N/A', margin + 16, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('Address:', margin, 86);
  doc.setFont('helvetica', 'normal');
  const addrLines = doc.splitTextToSize(order.customerAddress || 'N/A', 65);
  doc.text(addrLines, margin + 18, 86);

  // Invoice meta (right)
  const col1 = 120;
  const col2 = col1 + 24;

  const metaRows = [
    ['Invoice No:', String(order.orderNumber || '')],
    ['Date:',      format(now, 'dd/M/yyyy')],
    ['Time:',      format(now, 'h:mm:ss aa')],
  ];
  if (cashierName) metaRows.push(['Cashier:', cashierName]);

  metaRows.forEach(([label, val], i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(0);
    doc.text(label, col1, 73 + i * 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(val, col2, 73 + i * 6.5);
  });

  // ════════════════════════════════════════════════════
  // ITEMS TABLE
  // ════════════════════════════════════════════════════
  const items    = cartItems || order.items || [];
  const totalAmt = Math.round(items.reduce((s, i) => s + i.price * (i.qty ?? i.quantity), 0));
  const totalQty = items.reduce((s, i) => s + (i.qty ?? i.quantity), 0);

  const tableBody = items.map((item, i) => [
    i + 1,
    item.name,
    item.qty ?? item.quantity,
    item.price,
    item.price * (item.qty ?? item.quantity),
  ]);

  autoTable(doc, {
    startY: 97,
    head: [['S.No', 'Item', 'Qty', 'Rate (Rs.)', 'Amount (Rs.)']],
    body: tableBody,
    foot: [['TOTAL', '', totalQty, '', `Rs.${totalAmt}`]],
    margin: { left: margin, right: margin },
    styles: {
      fontSize:    9.5,
      cellPadding: 3,
      textColor:   [0, 0, 0],
      lineColor:   [0, 0, 0],
      lineWidth:   0.25,
      overflow:    'linebreak',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'normal',
      lineWidth: 0.3,
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' },
      1: { cellWidth: 85 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 33, halign: 'right' },
    },
    theme: 'grid',
  });

  // ════════════════════════════════════════════════════
  // PAYMENT SUMMARY
  // ════════════════════════════════════════════════════
  const y = doc.lastAutoTable.finalY + 5;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);

  const paid      = Math.round((Number(paidAmount) || 0) * 100) / 100;
  const pending   = Math.round((totalAmt - paid) * 100) / 100;
  const payStatus = paid >= totalAmt ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(0);
  doc.text(`Payment Status: ${payStatus}`, margin, y + 8);
  doc.text(`Paid: ${RS}${paid}`,           margin, y + 15);
  doc.text(`Pending: ${RS}${pending}`,     margin, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total Amount: ${RS}${totalAmt}`, pageW - margin, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Amount in Words:', pageW - margin, y + 16, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0);
  const wordsLines = doc.splitTextToSize(numberToWords(totalAmt), 90);
  doc.text(wordsLines, pageW - margin, y + 22, { align: 'right' });

  // ════════════════════════════════════════════════════
  // SIGNATURES
  // ════════════════════════════════════════════════════
  const sigY = y + 52;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('Receiver Signature',   margin,         sigY);
  doc.text('Authorized Signatory', pageW - margin, sigY, { align: 'right' });

  doc.save(`Invoice-${order.orderNumber || 'bill'}.pdf`);
}