import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = window.env.SUPABASE_URL;
const supabaseKey = window.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
