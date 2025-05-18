
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Plus, 
  Trash, 
  FileText, 
  Save, 
  Download,
  ArrowLeft,
  Building,
  CreditCard,
  QrCode,
  IndianRupee
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { saveInvoicePDF, openInvoicePDF } from "@/services/pdfService";
import { InvoiceData, InvoiceItem, CompanyDetails, BankDetails } from "@/types/invoice";
import { Switch } from "@/components/ui/switch";

const CreateInvoice = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);
  
  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [notes, setNotes] = useState("Thank you for your business!");
  const [paymentTerms, setPaymentTerms] = useState("Payment due within 30 days of invoice date.");
  const [status, setStatus] = useState<"Paid" | "Pending" | "Overdue">("Pending");
  const [currency, setCurrency] = useState("INR"); // Default to Indian Rupees
  const [showQRCode, setShowQRCode] = useState(true);
  
  // Company details
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: "Your Company Name",
    email: "company@example.com",
    phone: "+91 9876543210",
    address: "Company Address\nCity, State, PIN",
    taxId: "GSTIN: 12ABCDE1234F1Z5",
    logo: ""
  });
  
  // Bank details
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountName: "Company Account Name",
    accountNumber: "1234567890",
    bankName: "Bank Name",
    ifscCode: "BANK0001234",
    upiId: "company@upi"
  });
  
  // Logo file handling
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  
  // Load saved settings on component mount
  useEffect(() => {
    // Load company details from localStorage if available
    const savedCompanyDetails = localStorage.getItem('companyDetails');
    if (savedCompanyDetails) {
      try {
        const parsedDetails = JSON.parse(savedCompanyDetails);
        setCompanyDetails(parsedDetails);
      } catch (error) {
        console.error("Failed to parse company details:", error);
      }
    }
    
    // Load bank details from localStorage if available
    const savedBankDetails = localStorage.getItem('bankDetails');
    if (savedBankDetails) {
      try {
        const parsedDetails = JSON.parse(savedBankDetails);
        setBankDetails(parsedDetails);
      } catch (error) {
        console.error("Failed to parse bank details:", error);
      }
    }
    
    // Load other invoice settings
    const savedInvoicePrefix = localStorage.getItem('invoicePrefix');
    if (savedInvoicePrefix) {
      setInvoiceNumber(savedInvoicePrefix + "001");
    }
    
    const savedCurrency = localStorage.getItem('defaultCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    const savedNotes = localStorage.getItem('defaultInvoiceNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
    
    const savedPaymentTerms = localStorage.getItem('defaultPaymentTerms');
    if (savedPaymentTerms) {
      setPaymentTerms(savedPaymentTerms);
    }
    
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setCompanyDetails(prev => ({ ...prev, logo: savedLogo }));
      setLogoPreview(savedLogo);
    }
  }, []);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setCompanyDetails(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const addItem = () => {
    const newId = String(items.length + 1);
    setItems([...items, { id: newId, description: '', quantity: 1, price: 0 }]);
  };
  
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      toast({
        title: "Cannot remove item",
        description: "Invoice must have at least one item",
        variant: "destructive"
      });
    }
  };
  
  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };
  
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  const subtotal = calculateSubtotal();
  const taxRate = 18; // Default to 18% (GST in India)
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };
  
  const handleSaveDraft = () => {
    toast({
      title: "Invoice saved",
      description: "Your invoice has been saved as a draft.",
    });
  };
  
  const getInvoiceData = (): InvoiceData => {
    return {
      invoiceNumber,
      invoiceDate,
      dueDate,
      clientName,
      clientEmail,
      clientAddress,
      items,
      notes,
      paymentTerms,
      taxRate,
      status,
      currency,
      companyDetails,
      bankDetails,
      showQRCode
    };
  };
  
  const handleGeneratePDF = () => {
    const invoiceData = getInvoiceData();
    
    // Form validation
    if (!invoiceData.clientName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a client name",
        variant: "destructive"
      });
      return;
    }
    
    openInvoicePDF(invoiceData);
    
    toast({
      title: "PDF Generated",
      description: "Your invoice PDF has been generated and opened in a new tab.",
    });
  };
  
  const handleDownloadPDF = () => {
    const invoiceData = getInvoiceData();
    
    // Form validation
    if (!invoiceData.clientName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a client name",
        variant: "destructive"
      });
      return;
    }
    
    saveInvoicePDF(invoiceData);
    
    toast({
      title: "PDF Downloaded",
      description: "Your invoice PDF has been downloaded.",
    });
  };

  return (
    <PageLayout>
      <div className="py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Create Invoice</h1>
            <p className="text-muted-foreground">Fill in the details below to create a new invoice</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <ArrowLeft size={16} />
                Cancel
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto" onClick={handleSaveDraft}>
              <Save size={16} />
              Save Draft
            </Button>
            <Button className="btn-primary flex items-center gap-2 w-full sm:w-auto" onClick={handleDownloadPDF}>
              <FileText size={16} />
              Download PDF
            </Button>
            <Button 
              className="btn-primary flex items-center gap-2 w-full sm:w-auto bg-purple-600 hover:bg-purple-700" 
              variant="default" 
              onClick={handleGeneratePDF}
            >
              <FileText size={16} />
              Preview PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Invoice Info */}
          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input 
                    id="invoiceNumber" 
                    value={invoiceNumber} 
                    onChange={(e) => setInvoiceNumber(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input 
                    id="invoiceDate" 
                    type="date" 
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as "Paid" | "Pending" | "Overdue")}>
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
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ (Indian Rupee)</SelectItem>
                      <SelectItem value="USD">$ (US Dollar)</SelectItem>
                      <SelectItem value="EUR">€ (Euro)</SelectItem>
                      <SelectItem value="GBP">£ (British Pound)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Label htmlFor="showQRCode">
                    Include UPI QR code for payment
                  </Label>
                  <Switch 
                    id="showQRCode"
                    checked={showQRCode}
                    onCheckedChange={setShowQRCode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Your Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyDetails.name}
                      onChange={(e) => setCompanyDetails({...companyDetails, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyDetails.email}
                      onChange={(e) => setCompanyDetails({...companyDetails, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      value={companyDetails.phone}
                      onChange={(e) => setCompanyDetails({...companyDetails, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">GST/Tax ID</Label>
                    <Input
                      id="taxId"
                      value={companyDetails.taxId}
                      onChange={(e) => setCompanyDetails({...companyDetails, taxId: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    rows={3}
                    value={companyDetails.address}
                    onChange={(e) => setCompanyDetails({...companyDetails, address: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full max-w-sm"
                    />
                    {logoPreview && (
                      <div className="w-20 h-20 border rounded flex items-center justify-center p-1">
                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Bank Details */}
          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID (for QR code payment)</Label>
                  <Input
                    id="upiId"
                    value={bankDetails.upiId}
                    onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input 
                      id="clientName" 
                      placeholder="Enter client name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input 
                      id="clientEmail" 
                      type="email" 
                      placeholder="Enter client email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Client Address</Label>
                  <Textarea 
                    id="clientAddress" 
                    placeholder="Enter client address" 
                    rows={3}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground pb-2">
                  <div className="col-span-6 md:col-span-5">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-3 md:col-span-3">Price ({getCurrencySymbol()})</div>
                  <div className="col-span-1 md:col-span-1 text-right">Total</div>
                  <div className="col-span-1 md:col-span-1"></div>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 md:col-span-5">
                      <Input 
                        placeholder="Item description" 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3 md:col-span-3">
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-1 text-right font-medium">
                      {getCurrencySymbol()}{(item.quantity * item.price).toFixed(2)}
                    </div>
                    <div className="col-span-1 md:col-span-1 flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash size={16} className="text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2 flex items-center gap-2"
                  onClick={addItem}
                >
                  <Plus size={16} />
                  Add Item
                </Button>
                
                <div className="flex flex-col items-end space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between w-full md:w-1/3 text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{getCurrencySymbol()}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full md:w-1/3 text-sm">
                    <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                    <span className="font-medium">{getCurrencySymbol()}{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full md:w-1/3 text-lg font-bold pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>{getCurrencySymbol()}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="card-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Additional notes to appear on the invoice" 
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Textarea 
                    id="paymentTerms" 
                    placeholder="Payment terms" 
                    rows={3}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleSaveDraft}>
              <Save size={16} className="mr-2" />
              Save Draft
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto" 
              onClick={handleDownloadPDF}
            >
              <Download size={16} className="mr-2" />
              Download PDF
            </Button>
            <Button 
              className="btn-primary w-full sm:w-auto" 
              onClick={handleGeneratePDF}
            >
              <FileText size={16} className="mr-2" />
              Preview PDF
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateInvoice;
