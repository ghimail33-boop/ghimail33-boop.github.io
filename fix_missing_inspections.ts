import { supabase } from './src/services/supabase';

async function main() {
  console.log('Fetching procurements...');
  const { data: procurements, error: procErr } = await supabase.from('procurements').select('*');
  if (procErr) {
    console.error('Error fetching procurements:', procErr);
    return;
  }

  console.log('Fetching inspections...');
  const { data: inspections, error: inspErr } = await supabase.from('inspections').select('procurement_id');
  if (inspErr) {
    console.error('Error fetching inspections:', inspErr);
    return;
  }

  const existingProcIds = new Set(inspections.map(i => i.procurement_id));
  const missingProcs = procurements.filter(p => !existingProcIds.has(p.id));

  console.log(`Found ${missingProcs.length} procurements missing inspections.`);

  for (const proc of missingProcs) {
    const inspection_code = `INSP-${proc.procurement_id_code.split('-').slice(-2).join('-')}`;
    console.log(`Creating inspection ${inspection_code} for procurement ${proc.id}`);
    
    const { error: insertErr } = await supabase.from('inspections').insert([{
      procurement_id: proc.id,
      inspection_code,
      inspection_date: new Date().toISOString().split('T')[0],
      status: 'Draft'
    }]);

    if (insertErr) {
      console.error(`Failed to create inspection for procurement ${proc.id}:`, insertErr);
    }
  }

  console.log('Done!');
}

main();
