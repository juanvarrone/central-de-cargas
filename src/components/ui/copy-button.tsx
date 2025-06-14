
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
  onCopy: () => void;
  loading?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

const CopyButton = ({ 
  onCopy, 
  loading = false, 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  children = 'Copiar'
}: CopyButtonProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    try {
      onCopy();
      toast({
        title: "Copiado",
        description: "Los datos han sido copiados para edición",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar los datos",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      <Copy className="h-4 w-4" />
      {children}
    </Button>
  );
};

export default CopyButton;
