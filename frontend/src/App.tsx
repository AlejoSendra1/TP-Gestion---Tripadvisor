import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";

import Index from "./pages/Index";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ExperienceDetails from "./pages/ExperienceDetails";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CreatePublication from "@/pages/CreatePublication";
import EditPublication from "@/pages/EditPublication";

const queryClient = new QueryClient();
sessionStorage.setItem("isLoggedIn", "false");

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/experience/:id" element={<ExperienceDetails />} />

            {/* 🔒 Rutas protegidas para Hosts */}
            <Route element={<ProtectedRoute allowedRoles={["HOST"]} />}>
              <Route path="/experience/:id/edit" element={<EditPublication />} />
              <Route path="/create-publication" element={<CreatePublication />} />
            </Route>

            {/* Ruta catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
