import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://fvsjnbczmqmyxzdlnwri.supabase.co', 'sb_publishable_uA92nBJaja8X6-Oax3mVaQ_Nh3nKf2S');

async function checkDashboard() {
    const [
      { data: procurementsData, error: err1 },
      { data: inspections, error: err2 },
      { data: findings, error: err3 },
      { data: corrective_actions, error: err4 },
      { data: checklist_stages, error: err5 },
      { data: checklist_items, error: err6 },
      { data: results, error: err7 },
      { data: provinces, error: err8 }
    ] = await Promise.all([
      supabase.from('procurements').select('*, offices(name)'),
      supabase.from('inspections').select('*'),
      supabase.from('findings').select('*'),
      supabase.from('corrective_actions').select('*'),
      supabase.from('checklist_stages').select('*').order('sort_order'),
      supabase.from('checklist_items').select('*'),
      supabase.from('inspection_checklist_results').select('*'),
      supabase.from('provinces').select('*')
    ]);

    console.log('Errors:', { err1, err2, err3, err4, err5, err6, err7, err8 });
    console.log('Procurements Count:', procurementsData?.length);
}

checkDashboard();
