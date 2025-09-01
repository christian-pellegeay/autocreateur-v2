import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info",
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get table counts for debugging
    const tables = ['tools', 'user_profiles', 'ticket_packages', 'tool_usages', 'purchases', 'app_configuration'];
    const counts = {};
    const errors = {};

    for (const table of tables) {
      try {
        const { data, error, count } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          errors[table] = error.message;
        } else {
          counts[table] = count;
        }
      } catch (e) {
        errors[table] = e.message;
      }
    }

    // Check RLS policies for the tools table specifically
    let policies = [];
    try {
      const { data, error } = await supabaseAdmin.rpc(
        'check_access_policies',
        { table_name: 'tools' }
      );
      
      if (error) {
        errors['policies'] = error.message;
      } else {
        policies = data || [];
      }
    } catch (e) {
      errors['policies'] = e.message;
    }

    // Get a sample of tools for debugging
    let toolsSample = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('tools')
        .select('*')
        .limit(5);
        
      if (error) {
        errors['tools_sample'] = error.message;
      } else {
        toolsSample = data || [];
      }
    } catch (e) {
      errors['tools_sample'] = e.message;
    }

    // Get environment info
    const envInfo = {
      url: Deno.env.get("SUPABASE_URL") ? "Set" : "Not set",
      anonKey: Deno.env.get("SUPABASE_ANON_KEY") ? "Set" : "Not set",
      serviceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "Set" : "Not set",
    };

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        tableCounts: counts,
        errors: errors,
        policies: policies,
        toolsSample: toolsSample,
        environment: envInfo
      }, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});