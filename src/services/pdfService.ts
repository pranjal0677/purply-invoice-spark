
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData, InvoiceItem } from '@/types/invoice';

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  
  // Add company logo if available
  if (data.companyDetails.logo) {
    try {
      // Add logo in top-left corner
      doc.addImage(data.companyDetails.logo, 'JPEG', 14, 10, 40, 25);
    } catch (error) {
      console.error("Failed to add logo to PDF:", error);
    }
  }
  
  // Add company info and invoice header
  doc.setFillColor(155, 135, 245); // Primary Purple
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("INVOICE", data.companyDetails.logo ? 60 : 14, 25);
  
  // Company details
  const startYCompanyDetails = 50;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("From:", 14, startYCompanyDetails);
  doc.setFont(undefined, 'normal');
  doc.text(data.companyDetails.name, 14, startYCompanyDetails + 8);
  doc.text(data.companyDetails.email, 14, startYCompanyDetails + 16);
  doc.text(data.companyDetails.phone, 14, startYCompanyDetails + 24);
  
  const addressLines = data.companyDetails.address.split('\n');
  addressLines.forEach((line, i) => {
    doc.text(line, 14, startYCompanyDetails + 32 + (i * 8));
  });
  
  if (data.companyDetails.taxId) {
    doc.text(`Tax ID: ${data.companyDetails.taxId}`, 14, startYCompanyDetails + 32 + (addressLines.length * 8));
  }
  
  // Invoice details
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${data.invoiceNumber}`, doc.internal.pageSize.getWidth() - 90, startYCompanyDetails);
  doc.text(`Date: ${data.invoiceDate}`, doc.internal.pageSize.getWidth() - 90, startYCompanyDetails + 8);
  doc.text(`Due Date: ${data.dueDate}`, doc.internal.pageSize.getWidth() - 90, startYCompanyDetails + 16);
  
  if (data.status) {
    let statusColor;
    switch (data.status) {
      case 'Paid': statusColor = [0, 150, 0]; break; // Green
      case 'Pending': statusColor = [255, 150, 0]; break; // Orange
      case 'Overdue': statusColor = [200, 0, 0]; break; // Red
      default: statusColor = [0, 0, 0]; // Black
    }
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text(`Status: ${data.status}`, doc.internal.pageSize.getWidth() - 90, startYCompanyDetails + 24);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'normal');
  }
  
  // Client details
  const startYClientDetails = startYCompanyDetails + 60;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text("Bill To:", 14, startYClientDetails);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  doc.text(data.clientName, 14, startYClientDetails + 8);
  doc.text(data.clientEmail, 14, startYClientDetails + 16);
  const clientAddressLines = data.clientAddress.split('\n');
  clientAddressLines.forEach((line, i) => {
    doc.text(line, 14, startYClientDetails + 24 + (i * 8));
  });
  
  // Set currency symbol
  const currencySymbol = data.currency === 'INR' ? '₹' : (data.currency === 'USD' ? '$' : data.currency);
  
  // Invoice items
  const tableColumn = ["Item", "Quantity", `Unit Price (${currencySymbol})`, `Total (${currencySymbol})`];
  const tableRows: (string | number)[][] = [];
  
  data.items.forEach(item => {
    const total = item.quantity * item.price;
    tableRows.push([
      item.description,
      item.quantity,
      `${item.price.toFixed(2)}`,
      `${total.toFixed(2)}`
    ]);
  });
  
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * (data.taxRate / 100);
  const total = subtotal + tax;
  
  // Add table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startYClientDetails + 50,
    theme: 'striped',
    headStyles: { 
      fillColor: [155, 135, 245],
      textColor: [255, 255, 255]
    },
    foot: [
      ["", "", "Subtotal", `${currencySymbol}${subtotal.toFixed(2)}`],
      ["", "", `Tax (${data.taxRate}%)`, `${currencySymbol}${tax.toFixed(2)}`],
      ["", "", "Total", `${currencySymbol}${total.toFixed(2)}`]
    ],
    footStyles: { 
      fillColor: [240, 240, 240],
      textColor: [30, 30, 30],
      fontStyle: 'bold'
    }
  });
  
  // Add notes, payment terms, and bank details
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Notes:", 14, finalY);
  doc.setFont(undefined, 'normal');
  doc.text(data.notes, 14, finalY + 8);
  
  doc.setFont(undefined, 'bold');
  doc.text("Payment Terms:", 14, finalY + 25);
  doc.setFont(undefined, 'normal');
  doc.text(data.paymentTerms, 14, finalY + 33);
  
  // Add bank details
  doc.setFont(undefined, 'bold');
  doc.text("Bank Details:", 14, finalY + 50);
  doc.setFont(undefined, 'normal');
  doc.text(`Account Name: ${data.bankDetails.accountName}`, 14, finalY + 58);
  doc.text(`Account Number: ${data.bankDetails.accountNumber}`, 14, finalY + 66);
  doc.text(`Bank Name: ${data.bankDetails.bankName}`, 14, finalY + 74);
  doc.text(`IFSC Code: ${data.bankDetails.ifscCode}`, 14, finalY + 82);
  doc.text(`UPI ID: ${data.bankDetails.upiId}`, 14, finalY + 90);
  
  // Add QR code if requested
  if (data.showQRCode && data.bankDetails.upiId) {
    try {
      // Generate a data URL for QR code (using UPI ID)
      const upiQrData = `upi://pay?pa=${data.bankDetails.upiId}&pn=${encodeURIComponent(data.companyDetails.name)}&am=${total}&cu=${data.currency}&tn=Invoice-${data.invoiceNumber}`;
      
      // This is a placeholder - in a real app you would generate a QR code image
      // For now we just draw a box with text since jsPDF doesn't have QR generation built-in
      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(doc.internal.pageSize.getWidth() - 70, finalY + 50, 60, 60, 3, 3, 'FD');
      
      doc.setFontSize(8);
      doc.text("QR Code for Payment", doc.internal.pageSize.getWidth() - 40, finalY + 80, { align: 'center' });
      doc.text("(UPI Payment)", doc.internal.pageSize.getWidth() - 40, finalY + 85, { align: 'center' });
      
      // Note: In a real implementation, you would use a QR code generation library
      // and then add the image using doc.addImage()
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  }
  
  // Add footer with purplish accent
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(254, 198, 161); // Soft Orange
  doc.rect(0, pageHeight - 20, doc.internal.pageSize.getWidth(), 20, 'F');
  
  return doc;
};

export const saveInvoicePDF = (data: InvoiceData) => {
  const doc = generateInvoicePDF(data);
  doc.save(`Invoice-${data.invoiceNumber}.pdf`);
};

export const openInvoicePDF = (data: InvoiceData) => {
  const doc = generateInvoicePDF(data);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
