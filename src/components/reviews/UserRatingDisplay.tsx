
import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserRatingDisplayProps {
  avgRating?: number;
  totalReviews?: number;
  compact?: boolean;
}

const UserRatingDisplay = ({ 
  avgRating = 0, 
  totalReviews = 0, 
  compact = false 
}: UserRatingDisplayProps) => {
  if (totalReviews === 0) {
    return compact ? null : (
      <Badge variant="outline" className="text-xs">
        Sin calificaciones
      </Badge>
    );
  }

  const roundedRating = Math.round(avgRating * 10) / 10;

  return (
    <div className={`flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Star 
        size={compact ? 12 : 16} 
        className="fill-yellow-400 text-yellow-400" 
      />
      <span className="font-medium">{roundedRating.toFixed(1)}</span>
      <span className="text-muted-foreground">
        ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
      </span>
    </div>
  );
};

export default UserRatingDisplay;
