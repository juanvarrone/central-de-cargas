
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PublicarCarga from "./pages/PublicarCarga";
import BuscarCargas from "./pages/BuscarCargas";
import PublicarCamion from "./pages/PublicarCamion";
import AgregarCamion from "./pages/AgregarCamion";
import BuscarCamiones from "./pages/BuscarCamiones";
import ConfigurarAlertas from "./pages/ConfigurarAlertas";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import AdminPage from "./pages/Admin";
import MisCargas from "./pages/MisCargas";
import VerCarga from "./pages/VerCarga";
import EditarCarga from "./pages/EditarCarga";
import Profile from "./pages/Profile";
import Premium from "./pages/Premium";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/publicar-carga" element={<PublicarCarga />} />
        <Route path="/buscar-cargas" element={<BuscarCargas />} />
        <Route path="/publicar-camion" element={<PublicarCamion />} />
        <Route path="/agregar-camion" element={<AgregarCamion />} />
        <Route path="/buscar-camiones" element={<BuscarCamiones />} />
        <Route path="/configurar-alertas" element={<ConfigurarAlertas />} />
        <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/mis-cargas" element={<MisCargas />} />
        <Route path="/ver-carga/:id" element={<VerCarga />} />
        <Route path="/editar-carga/:id" element={<EditarCarga />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
