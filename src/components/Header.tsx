
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText,
  Plus, 
  User, 
  Settings, 
  Menu, 
  X,
  LogOut,
  CreditCard,
  UserRound
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileAction = (action: string) => {
    toast({
      title: `Profile Action: ${action}`,
      description: `You clicked on ${action}`,
    });
  };

  return (
    <header className="border-b border-border bg-white sticky top-0 z-30">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                InvoiceGen
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-6">
              <ul className="flex items-center gap-6">
                <li>
                  <Link to="/" className="text-foreground hover:text-primary transition-colors">Dashboard</Link>
                </li>
                <li>
                  <Link to="/invoices" className="text-foreground hover:text-primary transition-colors">Invoices</Link>
                </li>
                <li>
                  <Link to="/clients" className="text-foreground hover:text-primary transition-colors">Clients</Link>
                </li>
                <li>
                  <Link to="/settings" className="text-foreground hover:text-primary transition-colors">Settings</Link>
                </li>
              </ul>
              
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User size={16} />
                      Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleProfileAction("Profile Settings")}>
                      <UserRound className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleProfileAction("Billing")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleProfileAction("Settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleProfileAction("Logout")}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link to="/create-invoice">
                  <Button className="btn-primary flex items-center gap-2">
                    <Plus size={16} />
                    New Invoice
                  </Button>
                </Link>
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
                <Link to="/" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/invoices" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Invoices
                </Link>
              </li>
              <li>
                <Link to="/clients" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Clients
                </Link>
              </li>
              <li>
                <Link to="/settings" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                  Settings
                </Link>
              </li>
              
              <li>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full justify-start p-2 h-auto font-normal"
                  onClick={() => {
                    handleProfileAction("Profile");
                    setMobileMenuOpen(false);
                  }}
                >
                  <User size={16} />
                  Profile
                </Button>
              </li>
              
              <li className="pt-4 border-t border-border">
                <Link to="/create-invoice" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="btn-primary w-full flex items-center justify-center gap-2">
                    <Plus size={16} />
                    New Invoice
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
