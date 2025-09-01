// This Edge Function creates an admin role for the first time setup

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get the request payload
    const { userId, secret } = await req.json();
    
    // Verify the secret to prevent unauthorized access
    // In a real app, this would be a more secure mechanism
    const adminSecret = Deno.env.get("ADMIN_SECRET");
    if (!adminSecret || secret !== adminSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the user to verify it exists
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Set the user's role to 'admin' in auth.users metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId, 
      { user_metadata: { role: 'admin' } }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update the user_profiles table to set is_admin to true
    const { error: profileUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('id', userId);

    if (profileUpdateError) {
      return new Response(
        JSON.stringify({ error: profileUpdateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User role has been set to admin",
        user: userData.user.email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});