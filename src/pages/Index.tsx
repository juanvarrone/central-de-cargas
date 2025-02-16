
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-4xl w-full px-6 py-12 space-y-8">
        <div className="space-y-2 text-center">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-neutral-100 text-neutral-800 rounded-full">
            Bienvenido
          </span>
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl text-neutral-900">
            Una nueva experiencia
          </h1>
          <p className="max-w-xl mx-auto text-lg text-neutral-600">
            Diseñada con atención al detalle y enfoque en la simplicidad
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Minimalista",
              description: "Diseño limpio y elegante que resalta lo importante"
            },
            {
              title: "Intuitiva",
              description: "Navegación fluida y natural para todos los usuarios"
            },
            {
              title: "Moderna",
              description: "Tecnologías actuales para una experiencia premium"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group relative p-6 bg-white rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-8">
          <button className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
            Comenzar
          </button>
          <button className="px-6 py-3 text-sm font-medium text-neutral-900 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
            Más información
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
