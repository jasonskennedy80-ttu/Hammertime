// Placeholder database types — replace with `npx supabase gen types typescript` output
// once connected to your Supabase project.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          company: string | null
          email: string | null
          email_secondary: string | null
          phone: string | null
          phone_secondary: string | null
          preferred_contact: string
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          zip: string | null
          mailing_same_as_address: boolean
          mailing_address_line1: string | null
          mailing_address_line2: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          notes: string | null
          status: string
          created_by: string | null
          last_activity_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          company?: string | null
          email?: string | null
          email_secondary?: string | null
          phone?: string | null
          phone_secondary?: string | null
          preferred_contact?: string
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          mailing_same_as_address?: boolean
          mailing_address_line1?: string | null
          mailing_address_line2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          notes?: string | null
          status?: string
          created_by?: string | null
          last_activity_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          company?: string | null
          email?: string | null
          email_secondary?: string | null
          phone?: string | null
          phone_secondary?: string | null
          preferred_contact?: string
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          mailing_same_as_address?: boolean
          mailing_address_line1?: string | null
          mailing_address_line2?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          notes?: string | null
          status?: string
          last_activity_at?: string | null
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          customer_id: string
          name: string
          type: string
          status: string
          location_address: string | null
          description: string | null
          internal_notes: string | null
          customer_notes: string | null
          salesperson_id: string | null
          start_date: string | null
          completion_date: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          discount_amount: number
          total: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          name: string
          type: string
          status?: string
          location_address?: string | null
          description?: string | null
          internal_notes?: string | null
          customer_notes?: string | null
          salesperson_id?: string | null
          start_date?: string | null
          completion_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          discount_amount?: number
          total?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: string
          status?: string
          location_address?: string | null
          description?: string | null
          internal_notes?: string | null
          customer_notes?: string | null
          salesperson_id?: string | null
          start_date?: string | null
          completion_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          discount_amount?: number
          total?: number
          updated_at?: string
        }
      }
      scope_sections: {
        Row: {
          id: string
          project_id: string
          title: string
          section_type: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          section_type?: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          section_type?: string
          description?: string | null
          sort_order?: number
          updated_at?: string
        }
      }
      line_items: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          quantity: number
          unit: string
          unit_price: number
          markup_percent: number
          taxable: boolean
          sort_order: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
          markup_percent?: number
          taxable?: boolean
          sort_order?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
          markup_percent?: number
          taxable?: boolean
          sort_order?: number
          total?: number
          updated_at?: string
        }
      }
      payment_schedule_items: {
        Row: {
          id: string
          project_id: string
          label: string
          amount: number
          due_trigger: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          label: string
          amount: number
          due_trigger: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          label?: string
          amount?: number
          due_trigger?: string
          sort_order?: number
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          project_id: string
          version_number: number
          title: string
          status: string
          valid_until: string | null
          notes: string | null
          snapshot_json: Json
          storage_path: string | null
          sent_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number?: number
          title: string
          status?: string
          valid_until?: string | null
          notes?: string | null
          snapshot_json?: Json
          storage_path?: string | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          status?: string
          valid_until?: string | null
          notes?: string | null
          snapshot_json?: Json
          storage_path?: string | null
          sent_at?: string | null
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          project_id: string
          proposal_id: string | null
          version_number: number
          title: string
          status: string
          terms: string | null
          warranty_terms: string | null
          snapshot_json: Json
          storage_path: string | null
          sent_at: string | null
          signed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          proposal_id?: string | null
          version_number?: number
          title: string
          status?: string
          terms?: string | null
          warranty_terms?: string | null
          snapshot_json?: Json
          storage_path?: string | null
          sent_at?: string | null
          signed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          status?: string
          terms?: string | null
          warranty_terms?: string | null
          snapshot_json?: Json
          storage_path?: string | null
          sent_at?: string | null
          signed_at?: string | null
          updated_at?: string
        }
      }
      template_clauses: {
        Row: {
          id: string
          title: string
          category: string
          body: string
          version: number
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          body: string
          version?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          category?: string
          body?: string
          version?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      document_versions: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          version_number: number
          revision_label: string | null
          revision_notes: string | null
          snapshot_json: Json
          storage_path: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          version_number: number
          revision_label?: string | null
          revision_notes?: string | null
          snapshot_json: Json
          storage_path?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: never
      }
      activity_logs: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          action: string
          actor_id: string | null
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          action: string
          actor_id?: string | null
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
