
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReviewNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewedUserId: string;
  reviewedUserName: string;
  reviewerType: 'dador' | 'camionero';
  cargaId: string;
}

const ReviewNotificationModal = ({ 
  open, 
  onOpenChange, 
  reviewedUserId, 
  reviewedUserName, 
  reviewerType,
  cargaId 
}: ReviewNotificationModalProps) => {
  const [ratings, setRatings] = useState({
    punctuality: 0,
    equipment: 0,
    respect: 0,
    overall: 0
  });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      toast({
        title: "Error",
        description: "Debe asignar al menos una calificación general",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const reviewData = {
        reviewer_id: user.id,
        reviewed_id: reviewedUserId,
        carga_id: cargaId,
        reviewer_type: reviewerType,
        punctuality_rating: ratings.punctuality,
        equipment_rating: ratings.equipment,
        respect_rating: ratings.respect,
        overall_rating: ratings.overall,
        comments: comments.trim() || null
      };

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) throw error;

      toast({
        title: "Calificación enviada",
        description: "Tu calificación ha sido registrada exitosamente",
      });

      onOpenChange(false);
      
      // Reset form
      setRatings({ punctuality: 0, equipment: 0, respect: 0, overall: 0 });
      setComments('');

    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Error al enviar la calificación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1"
          >
            <Star
              size={24}
              className={`${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Calificar a {reviewedUserName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Ayuda a otros usuarios calificando tu experiencia con este {reviewerType === 'dador' ? 'transportista' : 'dador de carga'}.
          </p>

          <div className="space-y-4">
            <StarRating
              value={ratings.punctuality}
              onChange={(value) => handleStarClick('punctuality', value)}
              label="Puntualidad"
            />

            <StarRating
              value={ratings.equipment}
              onChange={(value) => handleStarClick('equipment', value)}
              label={reviewerType === 'dador' ? 'Estado del vehículo/equipo' : 'Calidad de la carga'}
            />

            <StarRating
              value={ratings.respect}
              onChange={(value) => handleStarClick('respect', value)}
              label="Trato y respeto"
            />

            <StarRating
              value={ratings.overall}
              onChange={(value) => handleStarClick('overall', value)}
              label="Calificación general *"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios (opcional)</Label>
            <Textarea
              id="comments"
              placeholder="Comparte tu experiencia (máximo 300 caracteres)"
              value={comments}
              onChange={(e) => setComments(e.target.value.slice(0, 300))}
              maxLength={300}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {comments.length}/300 caracteres
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || ratings.overall === 0}
            >
              {loading ? 'Enviando...' : 'Enviar calificación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewNotificationModal;
