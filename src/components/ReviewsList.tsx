
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  created_at: string;
  punctuality_rating: number;
  equipment_rating: number;
  respect_rating: number;
  overall_rating: number;
  comments: string | null;
  reviewer: {
    full_name: string | null;
  };
}

interface ReviewsListProps {
  userId: string;
}

const ReviewsList = ({ userId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select(`
            *,
            reviewer:profiles!reviews_reviewer_id_fkey(full_name)
          `)
          .eq("reviewed_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setReviews(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las reseñas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId, toast]);

  if (loading) {
    return <div>Cargando reseñas...</div>;
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No hay reseñas disponibles.
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {review.reviewer.full_name || "Usuario Anónimo"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Puntualidad</p>
                  <div className="flex">{renderStars(review.punctuality_rating)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado del Equipo</p>
                  <div className="flex">{renderStars(review.equipment_rating)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trato Recibido</p>
                  <div className="flex">{renderStars(review.respect_rating)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calificación General</p>
                  <div className="flex">{renderStars(review.overall_rating)}</div>
                </div>
              </div>

              {review.comments && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Comentarios</p>
                  <p className="text-sm">{review.comments}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;
