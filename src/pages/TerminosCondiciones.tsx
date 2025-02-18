
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TerminosCondiciones = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Términos y Condiciones</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-500 mb-4">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar el Sistema de Gestión de Cargas (en adelante, "la Plataforma"), usted acepta estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice la Plataforma.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p>
                La Plataforma es un servicio que permite la publicación y búsqueda de cargas para transporte en el territorio de la República Argentina, facilitando la conexión entre dadores de carga y transportistas.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Registro y Cuenta de Usuario</h2>
              <p>
                Para utilizar los servicios de la Plataforma, los usuarios deberán registrarse proporcionando información veraz y mantenerla actualizada. La cuenta es personal e intransferible.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Responsabilidades</h2>
              <p>
                La Plataforma actúa como intermediario y no es responsable por las operaciones realizadas entre las partes. Los usuarios son responsables de verificar la información proporcionada.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Legislación Aplicable</h2>
              <p>
                Estos términos y condiciones se rigen por las leyes de la República Argentina. Cualquier disputa está sujeta a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
              </p>
            </section>

            <div className="mt-8 flex justify-center">
              <Link to="/">
                <Button variant="outline">Volver al Inicio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TerminosCondiciones;
