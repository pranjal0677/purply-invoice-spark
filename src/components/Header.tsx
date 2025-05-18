
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Plus, 
  User, 
  Settings, 
  Menu, 
  X
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-white sticky top-0 z-30">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              InvoiceGen
            </h1>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-6">
              <ul className="flex items-center gap-6">
                <li>
                  <a href="#" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
                </li>
                <li>
                  <a href="#" className="text-foreground hover:text-primary transition-colors">Invoices</a>
                </li>
                <li>
                  <a href="#" className="text-foreground hover:text-primary transition-colors">Clients</a>
                </li>
                <li>
                  <a href="#" className="text-foreground hover:text-primary transition-colors">Settings</a>
                </li>
              </ul>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <User size={16} />
                  Profile
                </Button>
                <Button className="btn-primary flex items-center gap-2">
                  <Plus size={16} />
                  New Invoice
                </Button>
              </div>
            </nav>
          )}

          {/* Mobile Menu Toggle Button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <nav className="py-4 animate-fade-in">
            <ul className="grid gap-4">
              <li>
                <a href="#" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                  Invoices
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                  Clients
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                  Settings
                </a>
              </li>
              <li className="pt-4 border-t border-border">
                <Button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Plus size={16} />
                  New Invoice
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
