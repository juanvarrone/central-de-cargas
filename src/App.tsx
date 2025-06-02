
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import PublicarCarga from "./pages/PublicarCarga";
import EditarCarga from "./pages/EditarCarga";
import VerCarga from "./pages/VerCarga";
import MisCargas from "./pages/MisCargas";
import BuscarCargas from "./pages/BuscarCargas";
import ListadoCargas from "./pages/ListadoCargas";
import MapaCargas from "./pages/MapaCargas";
import MisPostulaciones from "./pages/MisPostulaciones";
import AgregarCamion from "./pages/AgregarCamion";
import MisCamiones from "./pages/MisCamiones";
import DisponibilidadesCamion from "./pages/DisponibilidadesCamion";
import PublicarCamion from "./pages/PublicarCamion";
import BuscarCamiones from "./pages/BuscarCamiones";
import ConfigurarAlertas from "./pages/ConfigurarAlertas";
import Premium from "./pages/Premium";
import Admin from "./pages/Admin";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/publicar-carga" element={<PublicarCarga />} />
                <Route path="/editar-carga/:id" element={<EditarCarga />} />
                <Route path="/ver-carga/:id" element={<VerCarga />} />
                <Route path="/mis-cargas" element={<MisCargas />} />
                <Route path="/buscar-cargas" element={<BuscarCargas />} />
                <Route path="/listado-cargas" element={<ListadoCargas />} />
                <Route path="/mapa-cargas" element={<MapaCargas />} />
                <Route path="/mis-postulaciones" element={<MisPostulaciones />} />
                <Route path="/agregar-camion" element={<AgregarCamion />} />
                <Route path="/mis-camiones" element={<MisCamiones />} />
                <Route path="/disponibilidades-camion/:truckId" element={<DisponibilidadesCamion />} />
                <Route path="/publicar-camion" element={<PublicarCamion />} />
                <Route path="/buscar-camiones" element={<BuscarCamiones />} />
                <Route path="/configurar-alertas" element={<ConfigurarAlertas />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
                <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
