
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Star } from "lucide-react";

interface Reviewer {
  full_name: string | null;
}

interface Review {
  id: string;
  created_at: string;
  punctuality_rating: number;
  equipment_rating: number;
  respect_rating: number;
  overall_rating: number;
  comments: string | null;
  reviewer: Reviewer;
  reviewer_type: string;
}

interface ReviewsListProps {
  userId: string;
}

const ReviewsList = ({ userId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
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

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          reviewer:reviewer_id(full_name)
        `)
        .eq("reviewed_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      // Process the data to ensure it matches the Review interface
      const processedReviews = data.map(item => {
        // Handle reviewer data which might have an error
        const reviewer = typeof item.reviewer === 'object' && item.reviewer !== null
          ? item.reviewer
          : { full_name: 'Usuario desconocido' };

        return {
          ...item,
          reviewer: reviewer
        };
      }) as Review[];

      setReviews(processedReviews);
      setLoading(false);
    };

    fetchActiveCategories();
    fetchReviews();
  }, [userId]);

  if (loading) {
    return <div>Cargando reseñas...</div>;
  }

  if (reviews.length === 0) {
    return <div>No hay reseñas disponibles.</div>;
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getReviewerType = (type: string) => {
    return type === "shipper" ? "Dador de Carga" : "Transportista";
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {review.reviewer.full_name || "Usuario"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getReviewerType(review.reviewer_type)} •{" "}
                    {format(new Date(review.created_at), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div className="flex items-center">
                  {renderStars(review.overall_rating)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeCategories.includes("punctuality") && (
                  <div>
                    <p className="text-sm font-medium">Puntualidad</p>
                    <div className="flex items-center">
                      {renderStars(review.punctuality_rating)}
                    </div>
                  </div>
                )}

                {activeCategories.includes("equipment") && (
                  <div>
                    <p className="text-sm font-medium">Estado del Equipo</p>
                    <div className="flex items-center">
                      {renderStars(review.equipment_rating)}
                    </div>
                  </div>
                )}

                {activeCategories.includes("respect") && (
                  <div>
                    <p className="text-sm font-medium">Trato Recibido</p>
                    <div className="flex items-center">
                      {renderStars(review.respect_rating)}
                    </div>
                  </div>
                )}
              </div>

              {review.comments && (
                <p className="text-sm text-gray-600">{review.comments}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;
