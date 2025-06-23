import { Truck } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  withText?: boolean;
}

const Logo = ({ size = "medium", withText = false }: LogoProps) => {
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
    <div className={`logo-container ${containerClass} flex items-center bg-argentina-blue text-white p-1 rounded overflow-hidden`}>
      {withText && (
        <div className={`app-title ${textClass} flex items-center`}>
          <span className="text-black font-bold">CARGAS</span>
          <span className="text-white mx-1">ARGENTINAS</span>
        </div>
      )}
      <img src="/images/logo1.png" alt="Logo Cargas Argentinas" className="h-full object-contain ml-2" />
    </div>
  );
};

export default Logo;