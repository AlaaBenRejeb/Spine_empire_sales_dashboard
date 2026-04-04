import { createBrowserClient } from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";

let clientInstance: any = null;
let isInitializing = false;

export function createClient() {
  // During SSR/build, use the raw client
  if (typeof window === "undefined") {
    return createRawClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // In the browser, return a shared singleton instance
  if (!clientInstance && !isInitializing) {
    isInitializing = true;
    console.log("Supabase Client: Locking Initialization Singleton...");
    
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "spine-setter-auth-v1",
          // The 'lock' option ensures concurrent tabs don't clash
          // We provide a custom implementation to speed up recovery in Dev Mode
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );
    isInitializing = false;
  }

  return clientInstance;
}
