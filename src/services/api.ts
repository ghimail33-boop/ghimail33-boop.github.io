import { supabase } from './supabase';
import { User, Province, District, Municipality, Ministry, Office, FiscalYear, Procurement, ChecklistStage, ChecklistItem, Inspection, InspectionChecklistResult, Finding, CorrectiveAction, EvidenceFile, AuditLog, DashboardSummary } from '../types';

const stripDisplayFields = <T extends Record<string, any>>(record: T) => {
  const {
    office_name,
    ministry_name,
    province_name,
    district_name,
    municipality_name,
    fiscal_year_name,
    ...dbRecord
  } = record as Record<string, any>;

  return dbRecord as T;
};

const ensureOfficeId = async (proc: Partial<Procurement>): Promise<Partial<Procurement>> => {
  const nextProc = { ...proc };
  const officeName = (nextProc.office_name || '').trim();

  if (!nextProc.office_id && officeName) {
    const { data: officeMatches, error: officeLookupError } = await supabase
      .from('offices')
      .select('id')
      .ilike('name', officeName)
      .limit(1);

    if (officeLookupError) throw new Error(officeLookupError.message);

    if (officeMatches && officeMatches.length > 0) {
      nextProc.office_id = officeMatches[0].id;
    } else {
      const { data: createdOffice, error: officeCreateError } = await supabase
        .from('offices')
        .insert([{ name: officeName, is_active: true }])
        .select('id')
        .single();

      if (officeCreateError) throw new Error(officeCreateError.message);
      nextProc.office_id = createdOffice.id;
    }
  }

  delete (nextProc as any).office_name;
  return nextProc;
};

const generateProcurementIdCode = async (fiscalYearId?: number): Promise<string> => {
  let fiscalYearCode = new Date().getFullYear().toString();

  if (fiscalYearId) {
    const { data: fiscalYear, error: fiscalYearError } = await supabase
      .from('fiscal_years')
      .select('name')
      .eq('id', fiscalYearId)
      .maybeSingle();

    if (!fiscalYearError && fiscalYear?.name) {
      const match = fiscalYear.name.match(/\d{4}/);
      if (match) {
        fiscalYearCode = match[0];
      }
    }
  }

  const { count, error: countError } = await supabase
    .from('procurements')
    .select('*', { count: 'exact', head: true });

  if (countError) throw new Error(countError.message);

  const sequence = (count ?? 0) + 1;
  return `NVC-PROC-${fiscalYearCode}-${String(sequence).padStart(3, '0')}`;
};

export const api = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    // Note: Since we are using standard Postgres without Supabase Auth for users table,
    // we fetch the user directly (in a real app, use Supabase Auth instead)
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
    if (error || !data) throw new Error('प्रयोगकर्ता फेला परेन।');
    
    // Simplistic auth for now
    localStorage.setItem('nvc_token', data.id.toString());
    return { token: data.id.toString(), user: data as User };
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('nvc_token');
    if (!token) throw new Error('तपाईं लगइन हुनुहुन्न।');
    const { data, error } = await supabase.from('users').select('*').eq('id', token).single();
    if (error || !data) throw new Error('प्रयोगकर्ता विवरण प्राप्त गर्न सकिएन।');
    return data as User;
  },

  async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*');
    return data as User[] || [];
  },

  async createUser(user: any): Promise<User> {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw new Error(error.message);
    return data as User;
  },

  async getStages(): Promise<ChecklistStage[]> {
    const { data } = await supabase.from('checklist_stages').select('*').order('sort_order');
    return data as ChecklistStage[] || [];
  },

  async getProvinces(): Promise<Province[]> {
    const { data } = await supabase.from('provinces').select('*');
    return data as Province[] || [];
  },

  async getDistricts(provinceId?: number): Promise<District[]> {
    let q = supabase.from('districts').select('*');
    if (provinceId) q = q.eq('province_id', provinceId);
    const { data } = await q;
    return data as District[] || [];
  },

  async getMunicipalities(districtId?: number): Promise<Municipality[]> {
    let q = supabase.from('municipalities').select('*');
    if (districtId) q = q.eq('district_id', districtId);
    const { data } = await q;
    return data as Municipality[] || [];
  },

  async getMinistries(): Promise<Ministry[]> {
    const { data } = await supabase.from('ministries').select('*');
    return data as Ministry[] || [];
  },

  async getOffices(params?: { ministry_id?: number; province_id?: number }): Promise<Office[]> {
    let q = supabase.from('offices').select('*');
    if (params?.ministry_id) q = q.eq('ministry_id', params.ministry_id);
    if (params?.province_id) q = q.eq('province_id', params.province_id);
    const { data } = await q;
    return data as Office[] || [];
  },

  async createOffice(office: Partial<Office>): Promise<Office> {
    const { data, error } = await supabase.from('offices').insert([office]).select().single();
    if (error) throw new Error(error.message);
    return data as Office;
  },

  async getFiscalYears(): Promise<FiscalYear[]> {
    const { data } = await supabase.from('fiscal_years').select('*');
    return data as FiscalYear[] || [];
  },

  async getProcurements(filters?: Record<string, string | number>): Promise<Procurement[]> {
    let q = supabase.from('procurements').select('*, offices(name), ministries(name_ne), provinces(name_ne), districts(name_ne), municipalities(name_ne), fiscal_years(name)');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      office_name: d.offices?.name,
      ministry_name: d.ministries?.name_ne,
      province_name: d.provinces?.name_ne,
      district_name: d.districts?.name_ne,
      municipality_name: d.municipalities?.name_ne,
      fiscal_year_name: d.fiscal_years?.name
    })) as Procurement[];
  },

  async getProcurement(id: number): Promise<Procurement> {
    const { data, error } = await supabase.from('procurements').select('*, offices(name), ministries(name_ne), provinces(name_ne), districts(name_ne), municipalities(name_ne), fiscal_years(name)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      office_name: data.offices?.name,
      ministry_name: data.ministries?.name_ne,
      province_name: data.provinces?.name_ne,
      district_name: data.districts?.name_ne,
      municipality_name: data.municipalities?.name_ne,
      fiscal_year_name: data.fiscal_years?.name
    } as Procurement;
  },

  async createProcurement(proc: Partial<Procurement>): Promise<Procurement> {
    const resolved = await ensureOfficeId(proc);
    const cleaned = stripDisplayFields(resolved);
    const procurement_id_code = cleaned.procurement_id_code || await generateProcurementIdCode(cleaned.fiscal_year_id);
    const { data, error } = await supabase
      .from('procurements')
      .insert([{ ...cleaned, procurement_id_code }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    
    // Automatically create a draft inspection for this procurement
    const procData = data as Procurement;
    const inspection_code = `INSP-${procData.procurement_id_code.split('-').slice(-2).join('-')}`;
    await supabase.from('inspections').insert([{
      procurement_id: procData.id,
      inspection_code,
      inspection_date: new Date().toISOString().split('T')[0],
      status: 'Draft'
    }]);

    return procData;
  },

  async updateProcurement(id: number, proc: Partial<Procurement>): Promise<Procurement> {
    const resolved = await ensureOfficeId(proc);
    const cleaned = stripDisplayFields(resolved);
    const { data, error } = await supabase.from('procurements').update(cleaned).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Procurement;
  },

  async updateProcurementDoc(procId: number, docId: number, status: string, remarks?: string): Promise<any> {
    const { data, error } = await supabase.from('procurement_documents').update({ status, remarks }).eq('id', docId).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getMasterChecklists(params?: { stage_number?: number }): Promise<ChecklistItem[]> {
    let q = supabase.from('checklist_items').select('*').order('sort_order');
    if (params?.stage_number) q = q.eq('stage_number', params.stage_number);
    const { data } = await q;
    return data as ChecklistItem[] || [];
  },

  async createChecklistItem(item: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const { data, error } = await supabase.from('checklist_items').insert([item]).select().single();
    if (error) throw new Error(error.message);
    return data as ChecklistItem;
  },

  async updateChecklistItem(id: number, item: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const { data, error } = await supabase.from('checklist_items').update(item).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as ChecklistItem;
  },

  async getInspections(filters?: Record<string, string | number>): Promise<Inspection[]> {
    let q = supabase.from('inspections').select('*, procurements(title, procurement_id_code, contractor_name, contract_amount, offices(name))');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      procurement_title: d.procurements?.title,
      procurement_id_code: d.procurements?.procurement_id_code,
      office_name: d.procurements?.offices?.name,
      contractor_name: d.procurements?.contractor_name,
      contract_amount: d.procurements?.contract_amount
    })) as Inspection[];
  },

  async getInspection(id: number): Promise<Inspection> {
    const { data, error } = await supabase.from('inspections').select('*, procurements(title, procurement_id_code)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      procurement_title: data.procurements?.title,
      procurement_id_code: data.procurements?.procurement_id_code
    } as Inspection;
  },

  async createInspection(dataObj: Partial<Inspection>): Promise<Inspection> {
    const { data, error } = await supabase.from('inspections').insert([dataObj]).select().single();
    if (error) throw new Error(error.message);
    return data as Inspection;
  },

  async updateInspection(id: number, dataObj: Partial<Inspection>): Promise<Inspection> {
    const { data, error } = await supabase.from('inspections').update(dataObj).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Inspection;
  },

  async getInspectionChecklist(id: number, stage?: number): Promise<InspectionChecklistResult[]> {
    let itemsQuery = supabase
      .from('checklist_items')
      .select('*')
      .eq('is_active', true)
      .order('stage_number')
      .order('sort_order');
    if (stage) itemsQuery = itemsQuery.eq('stage_number', stage);

    const [itemsResult, resultsResult, stagesResult] = await Promise.all([
      itemsQuery,
      supabase.from('inspection_checklist_results').select('*').eq('inspection_id', id),
      supabase.from('checklist_stages').select('id, title_ne'),
    ]);
    if (itemsResult.error) throw new Error(itemsResult.error.message);
    if (resultsResult.error) throw new Error(resultsResult.error.message);
    if (stagesResult.error) throw new Error(stagesResult.error.message);

    const resultsByItemId = new Map(
      (resultsResult.data || []).map((result) => [result.checklist_item_id, result])
    );
    const stageTitles = new Map(
      (stagesResult.data || []).map((checklistStage) => [checklistStage.id, checklistStage.title_ne])
    );

    return (itemsResult.data || []).map((item) => {
      const result = resultsByItemId.get(item.id);
      return {
        ...item,
        id: item.id,
        checklist_item_id: item.id,
        stage_title_ne: stageTitles.get(item.stage_id) || '',
        result_id: result?.id,
        compliance_status: result?.compliance_status || 'जाँच बाँकी',
        risk_level: result?.risk_level || item.default_risk_level || 'मध्यम',
        evidence_reference: result?.evidence_reference,
        observation: result?.observation,
        financial_impact: result?.financial_impact || 0,
        inspector_comment: result?.inspector_comment,
        completed_at: result?.completed_at,
      };
    }) as InspectionChecklistResult[];
  },

  async saveInspectionChecklistItem(inspectionId: number, payload: any): Promise<any> {
    const { data, error } = await supabase.from('inspection_checklist_results').upsert({
      inspection_id: inspectionId,
      checklist_item_id: payload.checklist_item_id,
      compliance_status: payload.compliance_status,
      risk_level: payload.risk_level,
      evidence_reference: payload.evidence_reference,
      observation: payload.observation,
      financial_impact: payload.financial_impact,
      inspector_comment: payload.inspector_comment
    }, { onConflict: 'inspection_id, checklist_item_id' }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getFindings(filters?: Record<string, string | number>): Promise<Finding[]> {
    let q = supabase.from('findings').select('*, inspections(inspection_code), procurements(title, procurement_id_code)');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      inspection_code: d.inspections?.inspection_code,
      procurement_title: d.procurements?.title,
      procurement_id_code: d.procurements?.procurement_id_code
    })) as Finding[];
  },

  async getFinding(id: number): Promise<Finding> {
    const { data, error } = await supabase.from('findings').select('*, inspections(inspection_code), procurements(title, procurement_id_code)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      inspection_code: data.inspections?.inspection_code,
      procurement_title: data.procurements?.title,
      procurement_id_code: data.procurements?.procurement_id_code
    } as Finding;
  },

  async createFinding(finding: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase.from('findings').insert([finding]).select().single();
    if (error) throw new Error(error.message);
    return data as Finding;
  },

  async updateFinding(id: number, finding: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase.from('findings').update(finding).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as Finding;
  },

  async deleteFinding(id: number): Promise<any> {
    const { data, error } = await supabase.from('findings').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  },

  async getCorrectiveActions(filters?: Record<string, string | number>): Promise<CorrectiveAction[]> {
    let q = supabase.from('corrective_actions').select('*, findings(finding_code, title, risk_level)');
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) q = q.eq(k, v);
      });
    }
    const { data } = await q;
    return (data || []).map(d => ({
      ...d,
      finding_code: d.findings?.finding_code,
      finding_title: d.findings?.title,
      finding_risk_level: d.findings?.risk_level
    })) as CorrectiveAction[];
  },

  async createCorrectiveAction(action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const { data, error } = await supabase.from('corrective_actions').insert([action]).select().single();
    if (error) throw new Error(error.message);
    return data as CorrectiveAction;
  },

  async updateCorrectiveAction(id: number, action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const { data, error } = await supabase.from('corrective_actions').update(action).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as CorrectiveAction;
  },

  async verifyCorrectiveAction(id: number, verification_status: string, verification_remarks?: string): Promise<CorrectiveAction> {
    const { data, error } = await supabase.from('corrective_actions').update({ verification_status, verification_remarks }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as CorrectiveAction;
  },

  async getEvidenceFiles(inspectionId: number, checklistItemId?: number): Promise<EvidenceFile[]> {
    let q = supabase.from('evidence_files').select('*').eq('inspection_id', inspectionId);
    if (checklistItemId) q = q.eq('checklist_item_id', checklistItemId);
    const { data } = await q;
    return data as EvidenceFile[] || [];
  },

  async uploadEvidence(formData: FormData): Promise<EvidenceFile> {
    // For Supabase, uploading evidence files needs supabase storage.
    // Assuming bucket named 'evidence' exists.
    const file = formData.get('file') as File;
    const inspection_id = formData.get('inspection_id');
    const { data, error } = await supabase.storage.from('evidence').upload(`${inspection_id}/${file.name}`, file);
    if (error) throw new Error(error.message);
    
    // Create record in evidence_files
    const { data: record, error: dbError } = await supabase.from('evidence_files').insert([{
      inspection_id,
      file_name: file.name,
      stored_file_name: data.path,
      file_path: data.path,
      file_size: file.size,
      file_type: file.type
    }]).select().single();
    if (dbError) throw new Error(dbError.message);
    return record as EvidenceFile;
  },

  async deleteEvidence(id: number): Promise<any> {
    const { data, error } = await supabase.from('evidence_files').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await fetch('/api/dashboard/summary');
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Dashboard summary failed to load.');
    }

    return response.json() as Promise<DashboardSummary>;
  },

  async getInspectionReport(inspectionId: number): Promise<any> {
    return { error: 'Report generation not supported in frontend-only mode yet.' };
  },

  async getAuditLogs(params?: { action?: string; entity_type?: string }): Promise<AuditLog[]> {
    let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (params?.action) q = q.eq('action', params.action);
    if (params?.entity_type) q = q.eq('entity_type', params.entity_type);
    const { data } = await q;
    return data as AuditLog[] || [];
  }
};
