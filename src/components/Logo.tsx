import { Truck } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  withText?: boolean;
}

const Logo = ({ size = "medium", withText = true }: LogoProps) => {
  // Size mapping
  const sizeMap = {
    small: {
      textClass: "text-lg",
      containerClass: "h-12",
    },
    medium: {
      textClass: "text-xl",
      containerClass: "h-16",
    },
    large: {
      textClass: "text-2xl",
      containerClass: "h-20",
    },
  };

  const { textClass, containerClass } = sizeMap[size];

  return (
    <div className={`logo-container ${containerClass} flex items-center`}>
      {withText && (
        <div className={`app-title ${textClass} flex items-center`}>
          <span className="text-black font-bold uppercase">CARGAS</span>
          <span className="ml-2 text-white font-light uppercase          interface LogoProps {
            size?: "small" | "medium" | "large";
            withText?: boolean;
            footer?: boolean; // <-- agrega esta línea
          }
          
          const Logo = ({ size = "medium", withText = true, footer = false }: LogoProps) => {
            // ...existing code...
            return (
              <div className={`logo-container ${containerClass} flex items-center`}>
                {withText && (
                  <div className={`app-title ${textClass} flex items-center`}>
                    <span className="text-black font-bold uppercase">CARGAS</span>
                    <span
                      className={`ml-2 font-light uppercase ${
                        footer ? "text-blue-600" : "text-white"
                      }`}
                    >
                      ARGENTINAS
                    </span>
                  </div>
                )}
                {/* <img src="/images/logo1.png" alt="Logo Cargas Argentinas" className="h-full object-contain ml-2" /> */}
              </div>
            );
          };">ARGENTINAS</span>
        </div>
      )}
      {/* <img src="/images/logo1.png" alt="Logo Cargas Argentinas" className="h-full object-contain ml-2" /> */}
    </div>
  );
};

export default Logo;