
import { Truck } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  withText?: boolean;
}

const Logo = ({ size = "medium", withText = true }: LogoProps) => {
  // Size mapping
  const sizeMap = {
    small: {
      iconSize: 20,
      textClass: "text-lg",
      containerClass: "gap-1",
    },
    medium: {
      iconSize: 28,
      textClass: "text-xl",
      containerClass: "gap-2",
    },
    large: {
      iconSize: 36,
      textClass: "text-2xl",
      containerClass: "gap-3",
    },
  };

  const { iconSize, textClass, containerClass } = sizeMap[size];

  return (
    <div className={`logo-container ${containerClass}`}>
      <div className="relative">
        {/* Bandera argentina como fondo del ícono */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="w-full h-1/3 bg-blue-400"></div>
          <div className="w-full h-1/3 bg-white"></div>
          <div className="w-full h-1/3 bg-blue-400"></div>
        </div>
        
        {/* Camión con efecto de profundidad */}
        <div className="absolute inset-0 text-secondary blur-[1px]">
          <Truck size={iconSize} strokeWidth={2.5} />
        </div>
        <Truck size={iconSize} className="text-primary relative z-10" strokeWidth={2} />
      </div>

      {withText && (
        <div className={`app-title ${textClass} flex items-center`}>
          <span className="text-primary">CARGAS</span>
          <span className="text-secondary mx-1">ARGENTINAS</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
