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
      filekey: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      history: {
        Row: {
          content: string
          created_at: string
          date: string
          editor: string
          embedding: string | null
          from: string
          id: number
          metadata: Json | null
          os: Database["public"]["Enums"]["OSEnum"]
          product: Database["public"]["Enums"]["ProductEnum"]
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          date?: string
          editor: string
          embedding?: string | null
          from?: string
          id?: number
          metadata?: Json | null
          os: Database["public"]["Enums"]["OSEnum"]
          product: Database["public"]["Enums"]["ProductEnum"]
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          editor?: string
          embedding?: string | null
          from?: string
          id?: number
          metadata?: Json | null
          os?: Database["public"]["Enums"]["OSEnum"]
          product?: Database["public"]["Enums"]["ProductEnum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "history_editor_fkey"
            columns: ["editor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lotties: {
        Row: {
          additionalPath: string | null
          created_at: string
          domain: Database["public"]["Enums"]["ProductDomain"]
          editor: string | null
          file: string
          hasAnim: boolean
          id: number
          isDark: boolean
          loop: boolean
          name: string
          os: Database["public"]["Enums"]["OSEnum"]
          product: Database["public"]["Enums"]["ProductEnum"]
          size: Json | null
          updated_at: string
          version: number
        }
        Insert: {
          additionalPath?: string | null
          created_at?: string
          domain: Database["public"]["Enums"]["ProductDomain"]
          editor?: string | null
          file: string
          hasAnim: boolean
          id?: number
          isDark?: boolean
          loop?: boolean
          name: string
          os: Database["public"]["Enums"]["OSEnum"]
          product: Database["public"]["Enums"]["ProductEnum"]
          size?: Json | null
          updated_at?: string
          version: number
        }
        Update: {
          additionalPath?: string | null
          created_at?: string
          domain?: Database["public"]["Enums"]["ProductDomain"]
          editor?: string | null
          file?: string
          hasAnim?: boolean
          id?: number
          isDark?: boolean
          loop?: boolean
          name?: string
          os?: Database["public"]["Enums"]["OSEnum"]
          product?: Database["public"]["Enums"]["ProductEnum"]
          size?: Json | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "lotties_editor_fkey"
            columns: ["editor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["ProfileRole"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["ProfileRole"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["ProfileRole"]
        }
        Relationships: []
      }
      share: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          file_key: string
          id: number
          url: string
          url_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          file_key: string
          id?: number
          url: string
          url_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          file_key?: string
          id?: number
          url?: string
          url_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strings: {
        Row: {
          code: string
          components: Database["public"]["Enums"]["StringComponent"] | null
          content: string
          created_at: string
          description: string | null
          editor: string | null
          embedding: string
          id: number
          metadata: Json
          os: Database["public"]["Enums"]["OSEnum"]
          product: Database["public"]["Enums"]["ProductEnum"]
          role: Database["public"]["Enums"]["StringRole"]
          source: Database["public"]["Enums"]["StringSource"]
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          components?: Database["public"]["Enums"]["StringComponent"] | null
          content: string
          created_at?: string
          description?: string | null
          editor?: string | null
          embedding: string
          id?: number
          metadata: Json
          os: Database["public"]["Enums"]["OSEnum"]
          product: Database["public"]["Enums"]["ProductEnum"]
          role: Database["public"]["Enums"]["StringRole"]
          source: Database["public"]["Enums"]["StringSource"]
          updated_at: string
          version: number
        }
        Update: {
          code?: string
          components?: Database["public"]["Enums"]["StringComponent"] | null
          content?: string
          created_at?: string
          description?: string | null
          editor?: string | null
          embedding?: string
          id?: number
          metadata?: Json
          os?: Database["public"]["Enums"]["OSEnum"]
          product?: Database["public"]["Enums"]["ProductEnum"]
          role?: Database["public"]["Enums"]["StringRole"]
          source?: Database["public"]["Enums"]["StringSource"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "strings_editor_fkey"
            columns: ["editor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_history: {
        Args: {
          query_embedding: string
          filter: Json
          match_count?: number
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          embedding: Json
          os: string
          from: string
          similarity: number
        }[]
      }
      match_string: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          embedding: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      OSEnum: "ios" | "android" | "common"
      ProductDomain:
        | "common"
        | "home"
        | "call"
        | "call_summary"
        | "call_tip"
        | "contact"
        | "search"
        | "setting"
      ProductEnum: "adotphone" | "aiphone"
      ProfileRole: "user" | "admin" | "superadmin"
      StringComponent: "modal" | "toast" | "button" | "title"
      StringRole: "words" | "sentence"
      StringSource: "client" | "server"
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
