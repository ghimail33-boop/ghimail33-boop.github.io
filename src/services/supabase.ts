import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvsjnbczmqmyxzdlnwri.supabase.co';
const supabaseKey = 'sb_publishable_uA92nBJaja8X6-Oax3mVaQ_Nh3nKf2S';

export const supabase = createClient(supabaseUrl, supabaseKey);
