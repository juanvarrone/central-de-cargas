export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      camiones_disponibles: {
        Row: {
          capacidad: string
          created_at: string
          destino: string
          destino_ciudad: string | null
          destino_detalle: string | null
          destino_lat: number | null
          destino_lng: number | null
          destino_provincia: string | null
          estado: string
          fecha_disponible_desde: string
          fecha_disponible_hasta: string | null
          id: string
          observaciones: string | null
          origen: string
          origen_ciudad: string | null
          origen_detalle: string | null
          origen_lat: number | null
          origen_lng: number | null
          origen_provincia: string | null
          radio_km: number | null
          refrigerado: boolean | null
          tipo_camion: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          capacidad: string
          created_at?: string
          destino: string
          destino_ciudad?: string | null
          destino_detalle?: string | null
          destino_lat?: number | null
          destino_lng?: number | null
          destino_provincia?: string | null
          estado?: string
          fecha_disponible_desde: string
          fecha_disponible_hasta?: string | null
          id?: string
          observaciones?: string | null
          origen: string
          origen_ciudad?: string | null
          origen_detalle?: string | null
          origen_lat?: number | null
          origen_lng?: number | null
          origen_provincia?: string | null
          radio_km?: number | null
          refrigerado?: boolean | null
          tipo_camion: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          capacidad?: string
          created_at?: string
          destino?: string
          destino_ciudad?: string | null
          destino_detalle?: string | null
          destino_lat?: number | null
          destino_lng?: number | null
          destino_provincia?: string | null
          estado?: string
          fecha_disponible_desde?: string
          fecha_disponible_hasta?: string | null
          id?: string
          observaciones?: string | null
          origen?: string
          origen_ciudad?: string | null
          origen_detalle?: string | null
          origen_lat?: number | null
          origen_lng?: number | null
          origen_provincia?: string | null
          radio_km?: number | null
          refrigerado?: boolean | null
          tipo_camion?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      cargas: {
        Row: {
          cantidad_cargas: number
          created_at: string
          destino: string
          destino_ciudad: string | null
          destino_detalle: string | null
          destino_lat: number | null
          destino_lng: number | null
          destino_provincia: string | null
          estado: string
          fecha_carga_desde: string
          fecha_carga_hasta: string | null
          id: string
          observaciones: string | null
          origen: string
          origen_ciudad: string | null
          origen_detalle: string | null
          origen_lat: number | null
          origen_lng: number | null
          origen_provincia: string | null
          tarifa: number
          tipo_camion: string
          tipo_carga: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          cantidad_cargas?: number
          created_at?: string
          destino: string
          destino_ciudad?: string | null
          destino_detalle?: string | null
          destino_lat?: number | null
          destino_lng?: number | null
          destino_provincia?: string | null
          estado?: string
          fecha_carga_desde: string
          fecha_carga_hasta?: string | null
          id?: string
          observaciones?: string | null
          origen: string
          origen_ciudad?: string | null
          origen_detalle?: string | null
          origen_lat?: number | null
          origen_lng?: number | null
          origen_provincia?: string | null
          tarifa: number
          tipo_camion: string
          tipo_carga: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          cantidad_cargas?: number
          created_at?: string
          destino?: string
          destino_ciudad?: string | null
          destino_detalle?: string | null
          destino_lat?: number | null
          destino_lng?: number | null
          destino_provincia?: string | null
          estado?: string
          fecha_carga_desde?: string
          fecha_carga_hasta?: string | null
          id?: string
          observaciones?: string | null
          origen?: string
          origen_ciudad?: string | null
          origen_detalle?: string | null
          origen_lat?: number | null
          origen_lng?: number | null
          origen_provincia?: string | null
          tarifa?: number
          tipo_camion?: string
          tipo_carga?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cargas_postulaciones: {
        Row: {
          carga_id: string
          created_at: string
          estado: string
          id: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          carga_id: string
          created_at?: string
          estado?: string
          id?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          carga_id?: string
          created_at?: string
          estado?: string
          id?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargas_postulaciones_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          avg_equipment_rating: number | null
          avg_overall_rating: number | null
          avg_punctuality_rating: number | null
          avg_respect_rating: number | null
          blocked_reason: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_blocked: boolean | null
          phone_number: string | null
          subscription_ends_at: string | null
          subscription_tier: string | null
          total_reviews: number | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          avg_equipment_rating?: number | null
          avg_overall_rating?: number | null
          avg_punctuality_rating?: number | null
          avg_respect_rating?: number | null
          blocked_reason?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          phone_number?: string | null
          subscription_ends_at?: string | null
          subscription_tier?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          avg_equipment_rating?: number | null
          avg_overall_rating?: number | null
          avg_punctuality_rating?: number | null
          avg_respect_rating?: number | null
          blocked_reason?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          phone_number?: string | null
          subscription_ends_at?: string | null
          subscription_tier?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      review_category_settings: {
        Row: {
          category: string
          created_at: string | null
          id: number
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          carga_id: string | null
          comments: string | null
          created_at: string
          equipment_rating: number | null
          id: string
          overall_rating: number | null
          punctuality_rating: number | null
          respect_rating: number | null
          reviewed_id: string
          reviewer_id: string
          reviewer_type: string
          updated_at: string
        }
        Insert: {
          carga_id?: string | null
          comments?: string | null
          created_at?: string
          equipment_rating?: number | null
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          respect_rating?: number | null
          reviewed_id: string
          reviewer_id: string
          reviewer_type: string
          updated_at?: string
        }
        Update: {
          carga_id?: string | null
          comments?: string | null
          created_at?: string
          equipment_rating?: number | null
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          respect_rating?: number | null
          reviewed_id?: string
          reviewer_id?: string
          reviewer_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trucks: {
        Row: {
          capacidad: string
          created_at: string
          foto_acoplado: string | null
          foto_chasis: string | null
          id: string
          patente_acoplado: string | null
          patente_chasis: string
          refrigerado: boolean | null
          tipo_camion: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacidad: string
          created_at?: string
          foto_acoplado?: string | null
          foto_chasis?: string | null
          id?: string
          patente_acoplado?: string | null
          patente_chasis: string
          refrigerado?: boolean | null
          tipo_camion: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacidad?: string
          created_at?: string
          foto_acoplado?: string | null
          foto_chasis?: string | null
          id?: string
          patente_acoplado?: string | null
          patente_chasis?: string
          refrigerado?: boolean | null
          tipo_camion?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ubicaciones_favoritas: {
        Row: {
          created_at: string
          direccion: string
          id: string
          lat: number | null
          lng: number | null
          tipo: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          direccion: string
          id?: string
          lat?: number | null
          lng?: number | null
          tipo: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          direccion?: string
          id?: string
          lat?: number | null
          lng?: number | null
          tipo?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ubicaciones_favoritas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_alerts: {
        Row: {
          created_at: string
          date_from: string | null
          date_to: string | null
          id: string
          locations: string[]
          name: string
          notify_available_trucks: boolean
          notify_new_loads: boolean
          radius_km: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          id?: string
          locations: string[]
          name: string
          notify_available_trucks?: boolean
          notify_new_loads?: boolean
          radius_km?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          id?: string
          locations?: string[]
          name?: string
          notify_available_trucks?: boolean
          notify_new_loads?: boolean
          radius_km?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_valid_phone: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
