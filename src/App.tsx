
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ConfigurarAlertas from "./pages/ConfigurarAlertas";
import Index from "./pages/Index";
import ListadoCargas from "./pages/ListadoCargas";
import MapaCargas from "./pages/MapaCargas";
import NotFound from "./pages/NotFound";
import PublicarCarga from "./pages/PublicarCarga";
import { Toaster } from "./components/ui/toaster";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/configurar-alertas" element={<ConfigurarAlertas />} />
        <Route path="/listado-cargas" element={<ListadoCargas />} />
        <Route path="/mapa-cargas" element={<MapaCargas />} />
        <Route path="/publicar-carga" element={<PublicarCarga />} />
        <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
        <Route path="/politicas-de-privacidad" element={<PoliticasPrivacidad />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
