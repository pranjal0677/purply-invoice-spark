import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Download, 
  Search, 
  FileText, 
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Hourglass
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { openInvoicePDF, saveInvoicePDF } from "@/services/pdfService";
import { InvoiceData } from "@/types/invoice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock invoices with the updated type
const initialInvoicesList = [
  { 
    id: "INV-001", 
    client: "Acme Corp", 
    amount: 1200, 
    date: "2025-05-15", 
    status: "Paid",
    // Sample invoice data for PDF generation
    invoiceNumber: "INV-001",
    invoiceDate: "2025-05-15",
    dueDate: "2025-05-30",
    clientName: "Acme Corp",
    clientEmail: "contact@acme.com",
    clientAddress: "123 Business St\nCity, State 12345",
    items: [
      { id: "1", description: "Web Design Services", quantity: 1, price: 1200 }
    ],
    notes: "Thank you for your business!",
    paymentTerms: "Net 15",
    taxRate: 0,
    currency: "INR",
    companyDetails: {
      name: "Your Company",
      email: "company@example.com",
      phone: "+91 9876543210",
      address: "Company Address\nCity, State, PIN",
      taxId: "GSTIN: 12ABCDE1234F1Z5"
    },
    bankDetails: {
      accountName: "Company Account",
      accountNumber: "1234567890",
      bankName: "Bank Name",
      ifscCode: "BANK0001234",
      upiId: "company@upi"
    },
    showQRCode: true
  },
  { 
    id: "INV-002", 
    client: "Stark Industries", 
    amount: 3450, 
    date: "2025-05-10", 
    status: "Pending",
    invoiceNumber: "INV-002",
    invoiceDate: "2025-05-10",
    dueDate: "2025-05-25",
    clientName: "Stark Industries",
    clientEmail: "accounts@stark.com",
    clientAddress: "200 Park Avenue\nNew York, NY 10166",
    items: [
      { id: "1", description: "Technical Consultation", quantity: 3, price: 1150 }
    ],
    notes: "Please pay within terms",
    paymentTerms: "Net 15",
    taxRate: 0,
    currency: "INR",
    companyDetails: {
      name: "Your Company",
      email: "company@example.com",
      phone: "+91 9876543210",
      address: "Company Address\nCity, State, PIN",
      taxId: "GSTIN: 12ABCDE1234F1Z5"
    },
    bankDetails: {
      accountName: "Company Account",
      accountNumber: "1234567890",
      bankName: "Bank Name",
      ifscCode: "BANK0001234",
      upiId: "company@upi"
    },
    showQRCode: true
  },
  { 
    id: "INV-003", 
    client: "Wayne Enterprises", 
    amount: 2750, 
    date: "2025-05-05", 
    status: "Paid",
    invoiceNumber: "INV-003",
    invoiceDate: "2025-05-05",
    dueDate: "2025-05-20",
    clientName: "Wayne Enterprises",
    clientEmail: "billing@wayne.com",
    clientAddress: "1007 Mountain Drive\nGotham, NY 10286",
    items: [
      { id: "1", description: "Security Analysis", quantity: 1, price: 2750 }
    ],
    notes: "Thank you for your business!",
    paymentTerms: "Net 15",
    taxRate: 0
  },
  { 
    id: "INV-004", 
    client: "Oscorp", 
    amount: 1850, 
    date: "2025-04-28", 
    status: "Paid",
    invoiceNumber: "INV-004",
    invoiceDate: "2025-04-28",
    dueDate: "2025-05-13",
    clientName: "Oscorp",
    clientEmail: "finance@oscorp.com",
    clientAddress: "Northwest Corner\nNew York, NY 10023",
    items: [
      { id: "1", description: "Research Equipment", quantity: 1, price: 1850 }
    ],
    notes: "Thank you for your business!",
    paymentTerms: "Net 15",
    taxRate: 0
  },
  { 
    id: "INV-005", 
    client: "LexCorp", 
    amount: 4200, 
    date: "2025-04-22", 
    status: "Overdue",
    invoiceNumber: "INV-005",
    invoiceDate: "2025-04-22",
    dueDate: "2025-05-07",
    clientName: "LexCorp",
    clientEmail: "payments@lexcorp.com",
    clientAddress: "1000 Main Street\nMetropolis, DE 19901",
    items: [
      { id: "1", description: "Tech Consulting", quantity: 2, price: 2100 }
    ],
    notes: "Payment overdue - please remit immediately",
    paymentTerms: "Net 15",
    taxRate: 0
  },
  { 
    id: "INV-006", 
    client: "Queen Industries", 
    amount: 2100, 
    date: "2025-04-15", 
    status: "Pending",
    invoiceNumber: "INV-006",
    invoiceDate: "2025-04-15",
    dueDate: "2025-04-30",
    clientName: "Queen Industries",
    clientEmail: "ar@queen.com",
    clientAddress: "123 Star City\nSeattle, WA 98101",
    items: [
      { id: "1", description: "Equipment Rental", quantity: 1, price: 2100 }
    ],
    notes: "Please pay within terms",
    paymentTerms: "Net 15",
    taxRate: 0
  },
  { 
    id: "INV-007", 
    client: "Kord Industries", 
    amount: 1350, 
    date: "2025-04-10", 
    status: "Paid",
    invoiceNumber: "INV-007",
    invoiceDate: "2025-04-10",
    dueDate: "2025-04-25",
    clientName: "Kord Industries",
    clientEmail: "invoices@kord.com",
    clientAddress: "350 5th Avenue\nChicago, IL 60611",
    items: [
      { id: "1", description: "Software License", quantity: 3, price: 450 }
    ],
    notes: "Thank you for your business!",
    paymentTerms: "Net 15",
    taxRate: 0
  },
];

const Invoices = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [invoicesList, setInvoicesList] = useState(initialInvoicesList);
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoicesList)[0] | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Paid": return <Check className="h-3 w-3 mr-1" />;
      case "Pending": return <Clock className="h-3 w-3 mr-1" />;
      case "Overdue": return <Hourglass className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };
  
  const handleDownloadPDF = (invoiceId: string) => {
    const invoice = invoicesList.find(inv => inv.id === invoiceId);
    if (invoice) {
      saveInvoicePDF(invoice as InvoiceData);
      toast({
        title: "PDF Download Started",
        description: `Invoice ${invoiceId} is being downloaded as PDF.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: `Invoice ${invoiceId} not found.`,
        variant: "destructive",
      });
    }
  };
  
  const handleViewInvoice = (invoiceId: string) => {
    const invoice = invoicesList.find(inv => inv.id === invoiceId);
    if (invoice) {
      openInvoicePDF(invoice as InvoiceData);
      toast({
        title: "Opening Invoice",
        description: `Viewing invoice ${invoiceId} in a new tab.`,
      });
    } else {
      toast({
        title: "Error",
        description: `Invoice ${invoiceId} not found.`,
        variant: "destructive",
      });
    }
  };
  
  const handleStatusChange = (invoice: typeof invoicesList[0]) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    setShowStatusDialog(true);
  };
  
  const handleSaveStatus = () => {
    if (selectedInvoice && newStatus) {
      setInvoicesList(invoicesList.map(inv => 
        inv.id === selectedInvoice.id ? { ...inv, status: newStatus } : inv
      ));
      
      toast({
        title: "Status Updated",
        description: `Invoice ${selectedInvoice.id} status changed to ${newStatus}.`,
      });
      
      setShowStatusDialog(false);
      setSelectedInvoice(null);
    }
  };
  
  const filteredInvoices = searchTerm 
    ? invoicesList.filter(
        invoice => 
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : invoicesList;

  return (
    <PageLayout title="Invoices">
      <div className="py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search invoices..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/create-invoice">
            <Button className="btn-primary flex items-center gap-2 w-full md:w-auto">
              <Plus size={16} />
              New Invoice
            </Button>
          </Link>
        </div>

        <Card className="card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Invoice #</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        {invoice.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invoice.currency === 'INR' ? '₹' : '$'}{invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{invoice.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleStatusChange(invoice)}
                        className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusColor(invoice.status)}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice.id)}
                        >
                          <Download size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft size={14} />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page 1 of 1
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              Next
              <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Invoice Status</DialogTitle>
            <DialogDescription>
              Change the status of invoice {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus}>
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Invoices;
