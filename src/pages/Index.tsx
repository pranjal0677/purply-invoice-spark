
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto flex-1">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
