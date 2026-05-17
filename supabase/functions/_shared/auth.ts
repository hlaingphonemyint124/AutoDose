import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

export interface AuthResult {
  userId: string;
  isApiKey: boolean;
}

/**
 * Validates authentication from either JWT token or API key
 * Returns the user ID if authentication is successful
 */
export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  // Check if it's an API key (starts with 'sk_')
  if (authHeader.startsWith('sk_')) {
    const apiKey = authHeader;
    
    // Validate API key
    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('user_id, is_active, expires_at')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (keyError) {
      console.error('Error validating API key:', keyError);
      throw new Error('Invalid API key');
    }

    if (!keyData) {
      throw new Error('Invalid API key');
    }

    if (!keyData.is_active) {
      throw new Error('API key is inactive');
    }

    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      throw new Error('API key has expired');
    }

    // Update last used timestamp
    await supabaseClient
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('api_key', apiKey);

    console.log(`API key authenticated for user: ${keyData.user_id}`);
    return { userId: keyData.user_id, isApiKey: true };
  }

  // Otherwise, treat as JWT Bearer token
  const token = authHeader.replace('Bearer ', '');
  const supabaseWithAuth = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser();

  if (authError || !user) {
    throw new Error('Invalid JWT token');
  }

  console.log(`JWT authenticated for user: ${user.id}`);
  return { userId: user.id, isApiKey: false };
}

/**
 * Checks if a user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) {
    console.error('Error checking admin role:', error);
    return false;
  }

  return !!data;
}
