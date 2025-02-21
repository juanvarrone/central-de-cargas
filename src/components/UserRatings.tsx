
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  avg_punctuality_rating: number;
  avg_equipment_rating: number;
  avg_respect_rating: number;
  avg_overall_rating: number;
  total_reviews: number;
}

interface UserRatingsProps {
  userId: string;
}

const UserRatings = ({ userId }: UserRatingsProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "avg_punctuality_rating, avg_equipment_rating, avg_respect_rating, avg_overall_rating, total_reviews"
        )
        .eq("id", userId)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, [userId]);

  if (!profile) return null;

  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < roundedRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Calificaciones Promedio</h3>
            <span className="text-sm text-muted-foreground">
              {profile.total_reviews} reseñas en total
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Puntualidad</p>
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(profile.avg_punctuality_rating)}</div>
                <span className="text-sm">
                  {profile.avg_punctuality_rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Estado del Equipo</p>
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(profile.avg_equipment_rating)}</div>
                <span className="text-sm">{profile.avg_equipment_rating.toFixed(1)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Trato Recibido</p>
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(profile.avg_respect_rating)}</div>
                <span className="text-sm">{profile.avg_respect_rating.toFixed(1)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Calificación General</p>
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(profile.avg_overall_rating)}</div>
                <span className="text-sm">{profile.avg_overall_rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRatings;
