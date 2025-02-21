
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface UserRatingsProps {
  userId: string;
}

interface ProfileRatings {
  avg_punctuality_rating: number;
  avg_equipment_rating: number;
  avg_respect_rating: number;
  avg_overall_rating: number;
  total_reviews: number;
}

const UserRatings = ({ userId }: UserRatingsProps) => {
  const [ratings, setRatings] = useState<ProfileRatings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchActiveCategories = async () => {
      const { data, error } = await supabase
        .from("review_category_settings")
        .select("category")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching active categories:", error);
        return;
      }

      setActiveCategories(data.map(item => item.category));
    };

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "avg_punctuality_rating, avg_equipment_rating, avg_respect_rating, avg_overall_rating, total_reviews"
        )
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching ratings:", error);
        return;
      }

      setRatings(data);
      setLoading(false);
    };

    fetchActiveCategories();
    fetchRatings();
  }, [userId]);

  if (loading) {
    return <div>Cargando calificaciones...</div>;
  }

  if (!ratings) {
    return <div>No se encontraron calificaciones.</div>;
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const roundedRating = Math.round(rating);

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < roundedRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Calificaciones</span>
          <span className="text-sm font-normal text-muted-foreground">
            {ratings.total_reviews || 0} reseñas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Calificación General</span>
          {renderStars(ratings.avg_overall_rating)}
        </div>

        <div className="space-y-2">
          {activeCategories.includes("punctuality") && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Puntualidad</span>
              {renderStars(ratings.avg_punctuality_rating)}
            </div>
          )}

          {activeCategories.includes("equipment") && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Estado del Equipo</span>
              {renderStars(ratings.avg_equipment_rating)}
            </div>
          )}

          {activeCategories.includes("respect") && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Trato Recibido</span>
              {renderStars(ratings.avg_respect_rating)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRatings;

