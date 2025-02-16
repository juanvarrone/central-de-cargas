
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ConfigurarAlertas from "./pages/ConfigurarAlertas";
import Index from "./pages/Index";
import ListadoCargas from "./pages/ListadoCargas";
import MapaCargas from "./pages/MapaCargas";
import NotFound from "./pages/NotFound";
import PublicarCarga from "./pages/PublicarCarga";
import Auth from "./pages/Auth";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/configurar-alertas" element={<ConfigurarAlertas />} />
        <Route path="/listado-cargas" element={<ListadoCargas />} />
        <Route path="/mapa-cargas" element={<MapaCargas />} />
        <Route path="/publicar-carga" element={<PublicarCarga />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
