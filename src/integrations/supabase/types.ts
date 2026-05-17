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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          photo_id: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          photo_id?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          photo_id?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          photo_id: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_id?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_id?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_stories: {
        Row: {
          cover_image_url: string | null
          created_at: string
          display_order: number
          id: string
          intro: string | null
          is_featured: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          intro?: string | null
          is_featured?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          intro?: string | null
          is_featured?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      photo_story_items: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          photo_id: string
          story_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_id: string
          story_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_id?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_story_items_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_story_items_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "photo_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          category: string | null
          created_at: string | null
          file_path: string
          id: string
          is_homepage_featured: boolean | null
          likes: number | null
          storage_url: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_path: string
          id?: string
          is_homepage_featured?: boolean | null
          likes?: number | null
          storage_url: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_path?: string
          id?: string
          is_homepage_featured?: boolean | null
          likes?: number | null
          storage_url?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shows: {
        Row: {
          backdrop_image_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_featured: boolean | null
          slug: string
          title: string
          trailer_video_url: string | null
          updated_at: string
        }
        Insert: {
          backdrop_image_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean | null
          slug: string
          title: string
          trailer_video_url?: string | null
          updated_at?: string
        }
        Update: {
          backdrop_image_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean | null
          slug?: string
          title?: string
          trailer_video_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      slideshow_photos: {
        Row: {
          created_at: string | null
          display_order: number
          file_path: string
          id: string
          is_active: boolean | null
          storage_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          file_path: string
          id?: string
          is_active?: boolean | null
          storage_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          file_path?: string
          id?: string
          is_active?: boolean | null
          storage_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string | null
          chapters: Json
          created_at: string | null
          description: string | null
          duration: string | null
          episode_number: number | null
          file_path: string | null
          hls_url: string | null
          id: string
          is_homepage_featured: boolean | null
          likes: number | null
          season_number: number | null
          show_id: string | null
          source_type: string | null
          storage_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          category?: string | null
          chapters?: Json
          created_at?: string | null
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          file_path?: string | null
          hls_url?: string | null
          id?: string
          is_homepage_featured?: boolean | null
          likes?: number | null
          season_number?: number | null
          show_id?: string | null
          source_type?: string | null
          storage_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          category?: string | null
          chapters?: Json
          created_at?: string | null
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          file_path?: string | null
          hls_url?: string | null
          id?: string
          is_homepage_featured?: boolean | null
          likes?: number | null
          season_number?: number | null
          show_id?: string | null
          source_type?: string | null
          storage_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_progress: {
        Row: {
          completed: boolean
          created_at: string
          duration_seconds: number | null
          id: string
          position_seconds: number
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number | null
          id?: string
          position_seconds?: number
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number | null
          id?: string
          position_seconds?: number
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_photo_likes: { Args: { photo_id: string }; Returns: undefined }
      decrement_video_likes: { Args: { video_id: string }; Returns: undefined }
      generate_api_key: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_photo_likes: { Args: { photo_id: string }; Returns: undefined }
      increment_video_likes: { Args: { video_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
