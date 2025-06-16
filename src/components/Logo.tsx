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
      <svg
        className="h-full ml-2"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C13.6569 6 15.1571 6.63214 16.3145 7.65685" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="15" cy="12" r="2" fill="white"/>
      </svg>
    </div>
  );
};

export default Logo;