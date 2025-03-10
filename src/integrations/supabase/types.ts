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
          total_reviews: number | null
          updated_at: string
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
          total_reviews?: number | null
          updated_at?: string
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
          total_reviews?: number | null
          updated_at?: string
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
      is_admin: {
        Args: {
          user_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
