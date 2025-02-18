
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PoliticasPrivacidad = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Política de Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-500 mb-4">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Información que Recolectamos</h2>
              <p>
                Recopilamos información personal que usted nos proporciona directamente, incluyendo pero no limitado a: nombre, dirección de correo electrónico, número de teléfono, CUIT/CUIL y datos relacionados con las operaciones de transporte.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Uso de la Información</h2>
              <p>
                La información recolectada se utiliza para:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Procesar sus transacciones</li>
                <li>Enviar notificaciones sobre sus operaciones</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Protección de Datos</h2>
              <p>
                Sus datos personales están protegidos de acuerdo con la Ley 25.326 de Protección de Datos Personales. Usted tiene derecho a acceder, rectificar y suprimir sus datos personales.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación. Puede configurar su navegador para rechazar todas las cookies o indicar cuándo se envía una cookie.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Contacto</h2>
              <p>
                Para ejercer sus derechos de acceso, rectificación o supresión de datos, contáctenos a través de [correo electrónico de contacto].
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

export default PoliticasPrivacidad;
