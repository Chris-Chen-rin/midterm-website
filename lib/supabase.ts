import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for server-side
export const createServerSupabaseClient = () => createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// For client components
export const createBrowserSupabaseClient = () => createClient(supabaseUrl, supabaseAnonKey)

// Singleton pattern for client-side to prevent multiple instances
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | undefined

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient()
  }
  return browserClient
}

// Add the missing export as an alias to the existing function
export const getSupabaseBrowser = getSupabaseBrowserClient
