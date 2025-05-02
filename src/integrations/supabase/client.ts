
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yeyubdwclifbgbqivrsu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleXViZHdjbGlmYmdicWl2cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTU3MjcsImV4cCI6MjA1NTI5MTcyN30.mjMAZTv9efiuTluZeVUKiR8T31NHwVCgJ0e8f3RBxnc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true, 
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web/2.38.4',
    },
  }
});

// Log client initialization
console.log("Supabase client initialized with URL:", SUPABASE_URL);

// Test connection on load
(async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error connecting to Supabase:", error.message);
    } else {
      console.log("Supabase client connection OK");
    }
  } catch (err) {
    console.error("Failed to test Supabase connection:", err);
  }
})();
