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
      budgets: {
        Row: {
          created_at: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          budget_id: number | null
          created_at: string | null
          due_date: string | null
          due_day: number | null
          frequency: Database["public"]["Enums"]["frequency_type"] | null
          group_id: number | null
          id: number
          name: string
          repeat_interval: number | null
          repeat_unit: Database["public"]["Enums"]["repeat_unit_type"] | null
          repeats: boolean | null
          snoozed: boolean | null
          target_amount: number | null
          user_id: string
        }
        Insert: {
          budget_id?: number | null
          created_at?: string | null
          due_date?: string | null
          due_day?: number | null
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          group_id?: number | null
          id?: never
          name: string
          repeat_interval?: number | null
          repeat_unit?: Database["public"]["Enums"]["repeat_unit_type"] | null
          repeats?: boolean | null
          snoozed?: boolean | null
          target_amount?: number | null
          user_id: string
        }
        Update: {
          budget_id?: number | null
          created_at?: string | null
          due_date?: string | null
          due_day?: number | null
          frequency?: Database["public"]["Enums"]["frequency_type"] | null
          group_id?: number | null
          id?: never
          name?: string
          repeat_interval?: number | null
          repeat_unit?: Database["public"]["Enums"]["repeat_unit_type"] | null
          repeats?: boolean | null
          snoozed?: boolean | null
          target_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "category_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      category_groups: {
        Row: {
          budget_id: number
          created_at: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          budget_id: number
          created_at?: string
          id?: number
          name?: string
          user_id: string
        }
        Update: {
          budget_id?: number
          created_at?: string
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_groups_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_budgets: {
        Row: {
          available: number | null
          budget_id: number
          created_at: string
          id: number
          month: string
          user_id: string
        }
        Insert: {
          available?: number | null
          budget_id: number
          created_at?: string
          id?: number
          month: string
          user_id: string
        }
        Update: {
          available?: number | null
          budget_id?: number
          created_at?: string
          id?: number
          month?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_budgets_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_category_details: {
        Row: {
          amount_assigned: number | null
          amount_spent: number | null
          carryover_from_previous_month: number | null
          category_id: number
          created_at: string
          id: number
          monthly_budget_id: number
          user_id: string
        }
        Insert: {
          amount_assigned?: number | null
          amount_spent?: number | null
          carryover_from_previous_month?: number | null
          category_id: number
          created_at?: string
          id?: number
          monthly_budget_id: number
          user_id: string
        }
        Update: {
          amount_assigned?: number | null
          amount_spent?: number | null
          carryover_from_previous_month?: number | null
          category_id?: number
          created_at?: string
          id?: number
          monthly_budget_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_category_details_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_category_details_monthly_budget_id_fkey"
            columns: ["monthly_budget_id"]
            isOneToOne: false
            referencedRelation: "monthly_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          budget_id: number
          category_id: number | null
          cleared: boolean | null
          created_at: string
          date: string | null
          id: number
          note: string | null
          payee: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          user_id: string
        }
        Insert: {
          amount?: number
          budget_id: number
          category_id?: number | null
          cleared?: boolean | null
          created_at?: string
          date?: string | null
          id?: number
          note?: string | null
          payee?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          user_id: string
        }
        Update: {
          amount?: number
          budget_id?: number
          category_id?: number | null
          cleared?: boolean | null
          created_at?: string
          date?: string | null
          id?: number
          note?: string | null
          payee?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      frequency_type: "weekly" | "monthly" | "yearly" | "custom"
      repeat_unit_type: "day" | "week" | "month" | "year"
      transaction_type_enum: "inflow" | "outflow"
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
