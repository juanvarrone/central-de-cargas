
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PublicarCarga from "./pages/PublicarCarga";
import ListadoCargas from "./pages/ListadoCargas";
import MapaCargas from "./pages/MapaCargas";
import ConfigurarAlertas from "./pages/ConfigurarAlertas";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import AdminPage from "./pages/Admin";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/publicar-carga" element={<PublicarCarga />} />
        <Route path="/listado-cargas" element={<ListadoCargas />} />
        <Route path="/mapa-cargas" element={<MapaCargas />} />
        <Route path="/configurar-alertas" element={<ConfigurarAlertas />} />
        <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
