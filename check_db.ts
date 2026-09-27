import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://fvsjnbczmqmyxzdlnwri.supabase.co', 'sb_publishable_uA92nBJaja8X6-Oax3mVaQ_Nh3nKf2S');
async function checkData() {
  const { data: p } = await supabase.from('procurements').select('id, title');
  const { data: u } = await supabase.from('users').select('id, username');
  console.log('Procurements in DB:', p);
  console.log('Users in DB:', u);
}
checkData();
