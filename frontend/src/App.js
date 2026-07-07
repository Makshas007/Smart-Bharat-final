import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CivicChatWidget } from "@/components/chat/CivicChatWidget";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ReportIssue from "@/pages/ReportIssue";
import TrackIssue from "@/pages/TrackIssue";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/track" element={<TrackIssue />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
          <CivicChatWidget />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;
