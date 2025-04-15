import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for server-side
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

// For client components
export const createBrowserSupabaseClient = () => createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        const value = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1]
        return value ? decodeURIComponent(value) : null
      },
      setItem: (key, value) => {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax`
      },
      removeItem: (key) => {
        document.cookie = `${key}=; path=/; max-age=0`
      },
    },
  },
})

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
