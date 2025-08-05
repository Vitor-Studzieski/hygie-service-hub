
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import CreateOS from "./pages/CreateOS";
import Orders from "./pages/Orders";
import Parameters from "./pages/Parameters";
import Reports from "./pages/Reports";
import Indicators from "./pages/Indicators";
import ViewOrder from "./pages/ViewOrder";
import EditOrder from "./pages/EditOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create-os" element={<CreateOS />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/view-order/:id" element={<ViewOrder />} />
            <Route path="/edit-order/:id" element={<EditOrder />} />
            <Route path="/parameters" element={<Parameters />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/quality-control" element={<Indicators />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
