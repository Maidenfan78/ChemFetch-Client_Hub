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
          added_at: string
        }
        Insert: {
          user_id: string
          product_id: string
        }
        Update: {
          product_id?: string
        }
      }
    }
    Views: {}
    Functions: {}
  }
}
