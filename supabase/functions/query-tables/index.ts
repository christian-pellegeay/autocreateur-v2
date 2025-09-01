import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

  // Initialize Supabase client with service role key
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );

  try {
    // Extract table name from query parameters
    const url = new URL(req.url);
    const tableName = url.searchParams.get("table");
    
    if (!tableName) {
      return new Response(
        JSON.stringify({ error: "Table name is required as a query parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify user is authenticated and has admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user has admin role
    const { data: userData, error: roleError } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (roleError || !userData || !userData.is_admin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Perform a count query on the table
    const { data: countData, error: countError } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      return new Response(
        JSON.stringify({ 
          error: `Error accessing table ${tableName}`,
          details: countError.message,
          hint: countError.hint || "Check if the table exists and you have proper permissions"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get first 10 records for preview
    const { data: records, error: recordsError } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(10);
    
    if (recordsError) {
      return new Response(
        JSON.stringify({ error: recordsError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get table schema information
    const { data: tableInfo, error: schemaError } = await supabaseAdmin.rpc(
      'check_access_policies',
      { table_name: tableName }
    );

    return new Response(
      JSON.stringify({
        table: tableName,
        count: countData.length,
        preview: records,
        policies: tableInfo || "No policy information available",
        error: schemaError ? schemaError.message : null
      }),
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