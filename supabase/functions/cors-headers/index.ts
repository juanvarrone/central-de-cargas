
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("CORS diagnostic function is running!");

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the request body if any
    let body = {};
    try {
      if (req.body) {
        const text = await req.text();
        body = JSON.parse(text);
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
    }

    // Run some basic diagnostics
    const diagnostics = {
      headers: Object.fromEntries(req.headers.entries()),
      method: req.method,
      url: req.url,
      body
    };

    console.log("CORS diagnostics:", diagnostics);

    return new Response(
      JSON.stringify({
        message: "CORS check successful",
        status: "ok",
        diagnostics,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("CORS function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "error",
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
