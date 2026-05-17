import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { keyName, expiresIn } = await req.json();

    if (!keyName || keyName.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Key name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate API key using database function
    const { data: apiKey, error: keyError } = await supabaseClient
      .rpc('generate_api_key');

    if (keyError) {
      console.error('Error generating API key:', keyError);
      throw keyError;
    }

    // Calculate expiration date if specified
    let expiresAt = null;
    if (expiresIn) {
      const days = parseInt(expiresIn);
      if (!isNaN(days) && days > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }
    }

    // Save API key to database
    const { data, error } = await supabaseClient
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_name: keyName.trim(),
        api_key: apiKey,
        expires_at: expiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving API key:', error);
      throw error;
    }

    console.log(`API key generated successfully for user ${user.id}: ${keyName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...data,
          // Return the full API key only on creation
          api_key: apiKey
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-api-key function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
