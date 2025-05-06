
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Auth from "./pages/Auth";
import MapaCargas from "./pages/MapaCargas";
import BuscarCargas from "./pages/BuscarCargas";
import BuscarCamiones from "./pages/BuscarCamiones";
import PublicarCarga from "./pages/PublicarCarga";
import PublicarCamion from "./pages/PublicarCamion";
import MisCargas from "./pages/MisCargas";
import MisCamiones from "./pages/MisCamiones";
import AgregarCamion from "./pages/AgregarCamion";
import Profile from "./pages/Profile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VerCarga from "./pages/VerCarga";
import EditarCarga from "./pages/EditarCarga";
import ConfigurarAlertas from "./pages/ConfigurarAlertas";
import Admin from "./pages/Admin";
import ListadoCargas from "./pages/ListadoCargas";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";
import Premium from "./pages/Premium";
import MisPostulaciones from "./pages/MisPostulaciones";
import CompleteProfile from "./pages/CompleteProfile";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "./components/layout";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/mapa-cargas" element={<MapaCargas />} />
              <Route path="/buscar-cargas" element={<BuscarCargas />} />
              <Route path="/buscar-camiones" element={<BuscarCamiones />} />
              <Route path="/publicar-carga" element={<PublicarCarga />} />
              <Route path="/publicar-camion" element={<PublicarCamion />} />
              <Route path="/mis-cargas" element={<MisCargas />} />
              <Route path="/mis-camiones" element={<MisCamiones />} />
              <Route path="/mis-postulaciones" element={<MisPostulaciones />} />
              <Route path="/agregar-camion" element={<AgregarCamion />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/perfil/:userId" element={<Profile />} />
              <Route path="/ver-carga/:id" element={<VerCarga />} />
              <Route path="/editar-carga/:id" element={<EditarCarga />} />
              <Route path="/mis-alertas" element={<ConfigurarAlertas />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/listado-cargas" element={<ListadoCargas />} />
              <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
              <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
