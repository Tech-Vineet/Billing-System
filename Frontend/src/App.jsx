import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Login from "./pages/login";
import Home from "./pages/home";
import Layout from "@/layout";
import Profile from "./pages/profile";
import Team from "./pages/team"; // ✅ Import added
import Product from '@/pages/product'
import Customer from '@/pages/customer'
import BusinessProfile from '@/pages/businessProfile'
import Invoice2 from '@/pages/createInvoice'
import Invoice from '@/pages/invoice'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Login />} />
        <Route path="/team" element={<Layout><Team /></Layout>} /> {/* ✅ Route added */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/product" element={<Layout><Product /></Layout>} />
         <Route path="/customers" element={<Layout><Customer /></Layout>} />
         <Route path="/businessProfile" element={<Layout><BusinessProfile /></Layout>} />
         <Route path="/createInvoice" element={<Layout><Invoice2 /></Layout>} />
         <Route path="/invoice" element={<Layout><Invoice /></Layout>} />

      </Routes>
    </Router>
  );
}

export default App;
