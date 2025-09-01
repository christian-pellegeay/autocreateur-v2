import { createClient } from '@supabase/supabase-js';

// Check if environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variable status for debugging
console.log('Supabase URL status:', supabaseUrl ? 'Available ✓' : 'Missing ✗');
console.log('Supabase Anon Key status:', supabaseAnonKey ? 'Available ✓' : 'Missing ✗');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  throw new Error('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Test the connection and log the result
(async () => {
  try {
    const { data, error, count } = await supabase.from('tools').select('*', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase connection successful. Tools count:', count);
    }
  } catch (e) {
    console.error('Supabase connection error:', e);
  }
})();