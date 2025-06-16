import { Truck } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  withText?: boolean;
}

const Logo = ({ size = "medium", withText = true }: LogoProps) => {
  // Size mapping
  const sizeMap = {
    small: {
      iconSize: 16,
      textClass: "text-lg",
      containerClass: "gap-1 h-6",
    },
    medium: {
      iconSize: 20,
      textClass: "text-xl",
      containerClass: "gap-2 h-8",
    },
    large: {
      iconSize: 24,
      textClass: "text-2xl",
      containerClass: "gap-3 h-10",
    },
  };

  const { iconSize, textClass, containerClass } = sizeMap[size];

  return (
    <div className={`logo-container ${containerClass} flex items-center bg-argentina-blue text-white p-1 rounded`}>
      {withText && (
        <div className={`app-title ${textClass} flex items-center`}>
          <span className="text-black font-bold">CARGAS</span>
          <span className="text-white mx-1">ARGENTINAS</span>
        </div>
      )}
<img src="/images/logo1.png" alt="Logo Cargas Argentinas" className="h-full ml-2" />
    </div>
  );
};

export default Logo;