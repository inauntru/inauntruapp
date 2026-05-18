export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          plan: "gratuit" | "standard" | "premium";
          role: "user" | "moderator" | "admin" | "super_admin";
          check_ins_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      facilitators: {
        Row: {
          id: number;
          slug: string;
          name: string;
          specialty: string | null;
          bio: string | null;
          image_url: string | null;
          rating: number | null;
          sessions_count: number | null;
          tags: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["facilitators"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["facilitators"]["Insert"]>;
      };
      practices: {
        Row: {
          id: number;
          title: string;
          category: "Suflu" | "Prezență" | "Fluiditate" | "Odihnă" | "Vitalitate" | "Expresie";
          facilitator_id: number | null;
          facilitator_name: string | null;
          facilitator_slug: string | null;
          duration: number;
          level: "Începător" | "Intermediar" | "Avansat";
          is_premium: boolean;
          media_type: "audio" | "video" | null;
          image_url: string | null;
          thumbnail_url: string | null;
          description: string | null;
          long_description: string | null;
          tags: string[];
          status: "active" | "draft";
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["practices"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["practices"]["Insert"]>;
      };
      blog_posts: {
        Row: {
          id: number;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          author: string | null;
          category: string | null;
          tags: string[];
          image_url: string | null;
          read_time: number | null;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };
      live_sessions: {
        Row: {
          id: number;
          title: string;
          facilitator_id: number | null;
          facilitator_name: string | null;
          facilitator_avatar: string | null;
          scheduled_at: string;
          duration: number;
          spots_total: number;
          spots_left: number;
          is_premium: boolean;
          tags: string[];
          status: "upcoming" | "live" | "completed" | "cancelled";
          meeting_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["live_sessions"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["live_sessions"]["Insert"]>;
      };
      check_ins: {
        Row: {
          id: number;
          user_id: string;
          mood: string;
          body_zones: string[];
          intensity: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["check_ins"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["check_ins"]["Insert"]>;
      };
      user_practices: {
        Row: {
          id: number;
          user_id: string;
          practice_id: number;
          completed: boolean;
          duration_watched: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_practices"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_practices"]["Insert"]>;
      };
      journal_entries: {
        Row: {
          id: number;
          user_id: string;
          title: string | null;
          content: string;
          mood: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["journal_entries"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Insert"]>;
      };
      settings: {
        Row: {
          key: string;
          value: Record<string, unknown>;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["settings"]["Row"], "updated_at"> & {
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Facilitator = Database["public"]["Tables"]["facilitators"]["Row"];
export type Practice = Database["public"]["Tables"]["practices"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type LiveSession = Database["public"]["Tables"]["live_sessions"]["Row"];
export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];
export type UserPractice = Database["public"]["Tables"]["user_practices"]["Row"];
export type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
export type Setting = Database["public"]["Tables"]["settings"]["Row"];
