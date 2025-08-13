// src/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      user_chemical_watch_list: {
        Row: {
          id: number
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: string
        }
        Update: {
          product_id?: string
        }
      }
      product: {
        Row: {
          id: string
          name: string
          sds_url: string | null
        }
        Insert: {
          id: string
          name: string
          sds_url?: string | null
        }
        Update: {
          name?: string
          sds_url?: string | null
        }
      }
      sds_metadata: {
        Row: {
          product_id: string
          issue_date: string | null
          hazardous_substance: boolean | null
          dangerous_good: boolean | null
          dangerous_goods_class: string | null
          description: string | null
          packing_group: string | null
          subsidiary_risks: string | null
          raw_json: Json | null
          created_at: string
        }
        Insert: {
          product_id: string
          issue_date?: string | null
          hazardous_substance?: boolean | null
          dangerous_good?: boolean | null
          dangerous_goods_class?: string | null
          description?: string | null
          packing_group?: string | null
          subsidiary_risks?: string | null
          raw_json?: Json | null
        }
        Update: {
          product_id?: string
          issue_date?: string | null
          hazardous_substance?: boolean | null
          dangerous_good?: boolean | null
          dangerous_goods_class?: string | null
          description?: string | null
          packing_group?: string | null
          subsidiary_risks?: string | null
          raw_json?: Json | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
