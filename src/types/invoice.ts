
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CompanyDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  logo?: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
  taxRate: number;
  status?: "Paid" | "Pending" | "Overdue";
  currency: string;
  companyDetails: CompanyDetails;
  bankDetails: BankDetails;
  showQRCode?: boolean;
}
