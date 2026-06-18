export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          arm_cm: number | null
          body_fat_pct: number | null
          chest_cm: number | null
          created_at: string
          hip_cm: number | null
          id: string
          leg_cm: number | null
          measured_at: string
          muscle_mass_kg: number | null
          notes: string | null
          photo_url: string | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          hip_cm?: number | null
          id?: string
          leg_cm?: number | null
          measured_at?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          photo_url?: string | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          hip_cm?: number | null
          id?: string
          leg_cm?: number | null
          measured_at?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          photo_url?: string | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      engine_message_templates: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          is_default: boolean
          professional_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          id?: string
          is_default?: boolean
          professional_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_default?: boolean
          professional_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      glucose_goals: {
        Row: {
          created_at: string
          id: string
          max_value: number
          min_value: number
          notes: string | null
          patient_id: string
          professional_id: string
          reading_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_value: number
          min_value: number
          notes?: string | null
          patient_id: string
          professional_id: string
          reading_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_value?: number
          min_value?: number
          notes?: string | null
          patient_id?: string
          professional_id?: string
          reading_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "glucose_goals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      glucose_readings: {
        Row: {
          created_at: string
          id: string
          measured_at: string
          notes: string | null
          patient_id: string | null
          reading_type: string
          user_id: string
          value_mg_dl: number
        }
        Insert: {
          created_at?: string
          id?: string
          measured_at?: string
          notes?: string | null
          patient_id?: string | null
          reading_type: string
          user_id: string
          value_mg_dl: number
        }
        Update: {
          created_at?: string
          id?: string
          measured_at?: string
          notes?: string | null
          patient_id?: string | null
          reading_type?: string
          user_id?: string
          value_mg_dl?: number
        }
        Relationships: [
          {
            foreignKeyName: "glucose_readings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          is_favorite: boolean
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          analysis: string | null
          calories: number | null
          carbs_g: number | null
          created_at: string
          fat_g: number | null
          id: string
          image_url: string | null
          is_diet_compliant: boolean | null
          logged_at: string
          meal_type: string | null
          protein_g: number | null
          user_id: string
        }
        Insert: {
          analysis?: string | null
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          id?: string
          image_url?: string | null
          is_diet_compliant?: boolean | null
          logged_at?: string
          meal_type?: string | null
          protein_g?: number | null
          user_id: string
        }
        Update: {
          analysis?: string | null
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          id?: string
          image_url?: string | null
          is_diet_compliant?: boolean | null
          logged_at?: string
          meal_type?: string | null
          protein_g?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_assignments: {
        Row: {
          assignment_type: string
          content: Json
          created_at: string
          id: string
          patient_id: string
          professional_id: string
          sent_via: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignment_type: string
          content?: Json
          created_at?: string
          id?: string
          patient_id: string
          professional_id: string
          sent_via?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string
          content?: Json
          created_at?: string
          id?: string
          patient_id?: string
          professional_id?: string
          sent_via?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          adherence_status: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          goal: string | null
          id: string
          invite_status: string
          invite_token: string | null
          last_activity_at: string | null
          notes: string | null
          patient_user_id: string | null
          phone: string | null
          professional_id: string
          updated_at: string
        }
        Insert: {
          adherence_status?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          goal?: string | null
          id?: string
          invite_status?: string
          invite_token?: string | null
          last_activity_at?: string | null
          notes?: string | null
          patient_user_id?: string | null
          phone?: string | null
          professional_id: string
          updated_at?: string
        }
        Update: {
          adherence_status?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          goal?: string | null
          id?: string
          invite_status?: string
          invite_token?: string | null
          last_activity_at?: string | null
          notes?: string | null
          patient_user_id?: string | null
          phone?: string | null
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_versions: {
        Row: {
          assignment_id: string
          content: string
          created_at: string
          id: string
          notes: string | null
          professional_id: string
          version_number: number
        }
        Insert: {
          assignment_id: string
          content: string
          created_at?: string
          id?: string
          notes?: string | null
          professional_id: string
          version_number?: number
        }
        Update: {
          assignment_id?: string
          content?: string
          created_at?: string
          id?: string
          notes?: string | null
          professional_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_versions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "patient_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          bio: string | null
          brand_color: string | null
          created_at: string
          display_name: string | null
          email_contact: string | null
          id: string
          logo_url: string | null
          registration_number: string | null
          specialty: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          brand_color?: string | null
          created_at?: string
          display_name?: string | null
          email_contact?: string | null
          id: string
          logo_url?: string | null
          registration_number?: string | null
          specialty?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          brand_color?: string | null
          created_at?: string
          display_name?: string | null
          email_contact?: string | null
          id?: string
          logo_url?: string | null
          registration_number?: string | null
          specialty?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          created_at: string
          dietary_restrictions: string[] | null
          food_preferences: string[] | null
          full_name: string | null
          height_cm: number | null
          id: string
          main_goal: string | null
          onboarding_completed: boolean
          sex: string | null
          streak_days: number
          target_weight_kg: number | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          account_type?: string
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          food_preferences?: string[] | null
          full_name?: string | null
          height_cm?: number | null
          id: string
          main_goal?: string | null
          onboarding_completed?: boolean
          sex?: string | null
          streak_days?: number
          target_weight_kg?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          account_type?: string
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          food_preferences?: string[] | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          main_goal?: string | null
          onboarding_completed?: boolean
          sex?: string | null
          streak_days?: number
          target_weight_kg?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          calories: string | null
          created_at: string
          diet_type: string | null
          id: string
          ingredients: string | null
          instructions: string | null
          is_favorite: boolean | null
          meal_type: string | null
          portions: string | null
          time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: string | null
          created_at?: string
          diet_type?: string | null
          id?: string
          ingredients?: string | null
          instructions?: string | null
          is_favorite?: boolean | null
          meal_type?: string | null
          portions?: string | null
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: string | null
          created_at?: string
          diet_type?: string | null
          id?: string
          ingredients?: string | null
          instructions?: string | null
          is_favorite?: boolean | null
          meal_type?: string | null
          portions?: string | null
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          category: string | null
          created_at: string
          estimated_price: number | null
          id: string
          is_purchased: boolean
          list_id: string
          name: string
          position: number
          quantity: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          is_purchased?: boolean
          list_id: string
          name: string
          position?: number
          quantity?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          is_purchased?: boolean
          list_id?: string
          name?: string
          position?: number
          quantity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          estimated_total: number | null
          id: string
          notes: string | null
          patient_id: string | null
          professional_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_total?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_total?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
