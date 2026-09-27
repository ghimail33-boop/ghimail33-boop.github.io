import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://fvsjnbczmqmyxzdlnwri.supabase.co', 'sb_publishable_uA92nBJaja8X6-Oax3mVaQ_Nh3nKf2S');

async function cleanData() {
  console.log('Cleaning demo data...');
  // This will cascade or we can just delete from procurements where title like '%(DEMO DATA)%'
  const { data, error } = await supabase
    .from('procurements')
    .delete()
    .like('title', '%(DEMO DATA)%');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Demo data deleted successfully.');
  }
}
cleanData();
