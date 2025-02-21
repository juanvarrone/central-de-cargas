
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  punctuality_rating: z.string().min(1, "Por favor califica la puntualidad"),
  equipment_rating: z.string().min(1, "Por favor califica el estado del equipo"),
  respect_rating: z.string().min(1, "Por favor califica el trato recibido"),
  comments: z.string().optional(),
});

interface ReviewFormProps {
  reviewedId: string;
  cargaId: string;
  reviewerType: "shipper" | "carrier";
  onSuccess: () => void;
}

const ReviewForm = ({ reviewedId, cargaId, reviewerType, onSuccess }: ReviewFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      punctuality_rating: "",
      equipment_rating: "",
      respect_rating: "",
      comments: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const reviewData = {
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        carga_id: cargaId,
        punctuality_rating: parseInt(data.punctuality_rating),
        equipment_rating: parseInt(data.equipment_rating),
        respect_rating: parseInt(data.respect_rating),
        overall_rating: Math.round(
          (parseInt(data.punctuality_rating) +
            parseInt(data.equipment_rating) +
            parseInt(data.respect_rating)) /
            3
        ),
        comments: data.comments || null,
        reviewer_type: reviewerType,
      };

      const { error } = await supabase.from("reviews").insert([reviewData]);

      if (error) throw error;

      toast({
        title: "Reseña enviada",
        description: "Tu reseña ha sido publicada exitosamente",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ratingOptions = [
    { value: "1", label: "1 - Malo" },
    { value: "2", label: "2 - Regular" },
    { value: "3", label: "3 - Bueno" },
    { value: "4", label: "4 - Muy Bueno" },
    { value: "5", label: "5 - Excelente" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="punctuality_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Puntualidad</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {ratingOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`punctuality-${option.value}`} />
                      <label htmlFor={`punctuality-${option.value}`}>{option.label}</label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado del Equipo</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {ratingOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`equipment-${option.value}`} />
                      <label htmlFor={`equipment-${option.value}`}>{option.label}</label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="respect_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trato Recibido</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {ratingOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`respect-${option.value}`} />
                      <label htmlFor={`respect-${option.value}`}>{option.label}</label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentarios Adicionales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comparte tu experiencia..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar Reseña"}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;
