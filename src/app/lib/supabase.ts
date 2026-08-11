import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ipycormdgfwzxasazbie.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweWNvcm1kZ2Z3enhhc2F6YmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MDIzMjUsImV4cCI6MjEwMDk3ODMyNX0.56Gpm5aBrnkdUaX5-qk349_WOAOCu4YWe7Fd1CTwUfo";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-supabase-project"));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
