// Hand-written to match supabase/migrations/0001_init.sql.
// Once the project is linked, regenerate with:
//   npx supabase gen types typescript --linked > src/lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          slug: string;
          full_name: string;
          timezone: string;
          slot_duration_minutes: number;
          buffer_minutes: number;
          created_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          full_name?: string;
          timezone?: string;
          slot_duration_minutes?: number;
          buffer_minutes?: number;
        };
        Update: {
          slug?: string;
          full_name?: string;
          timezone?: string;
          slot_duration_minutes?: number;
          buffer_minutes?: number;
        };
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          host_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Update: {
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_rules_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          host_id: string;
          guest_name: string;
          guest_email: string;
          start_time: string;
          end_time: string;
          status: "confirmed" | "cancelled";
          created_at: string;
        };
        // Rows are created via the create_booking() RPC, not direct insert.
        Insert: {
          id?: string;
          host_id: string;
          guest_name: string;
          guest_email: string;
          start_time: string;
          end_time: string;
          status?: "confirmed" | "cancelled";
        };
        Update: {
          status?: "confirmed" | "cancelled";
        };
        Relationships: [
          {
            foreignKeyName: "bookings_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      busy_slots: {
        Row: {
          host_id: string;
          start_time: string;
          end_time: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_booking: {
        Args: {
          p_host_id: string;
          p_start_time: string;
          p_end_time: string;
          p_guest_name: string;
          p_guest_email: string;
        };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
