import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface MapLocationInputFallbackProps {
  id: string;
  label: string;
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const MapLocationInputFallback = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}: MapLocationInputFallbackProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      <Label htmlFor={id} className="flex items-center gap-2">
        {label} {required && <span className="text-red-500">*</span>}
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      </Label>
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="mt-2"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Google Maps no está disponible. Ingrese la dirección manualmente.
      </p>
    </div>
  );
};

export default MapLocationInputFallback;