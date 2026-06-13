import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ChatBotSlot from "./components/layout/ChatBotSlot";
import { Toaster } from "sonner";


function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <ScrollToTop />
      {!isAdmin && <Header />}
      <main>
        <AppRoutes />
      </main>
      <ChatBotSlot />

      {!isAdmin && <Footer />}

      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
}