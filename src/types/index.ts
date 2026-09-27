export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'inspector' | 'reviewer' | 'public_officer';
  role_display_name?: string;
  designation?: string;
  phone?: string;
  office_id?: number;
  office_name?: string;
}

export interface Province {
  id: number;
  name_en: string;
  name_ne: string;
}

export interface District {
  id: number;
  province_id: number;
  name_en: string;
  name_ne: string;
}

export interface Municipality {
  id: number;
  district_id: number;
  name_en: string;
  name_ne: string;
  type: string;
}

export interface Ministry {
  id: number;
  name_en: string;
  name_ne: string;
  code: string;
}

export interface Office {
  id: number;
  name: string;
  code?: string;
  ministry_id?: number;
  ministry_name?: string;
  province_id?: number;
  province_name?: string;
  district_id?: number;
  district_name?: string;
  address?: string;
}

export interface FiscalYear {
  id: number;
  name: string;
  is_current: boolean;
}

export interface ProcurementDocument {
  id: number;
  procurement_id: number;
  document_title: string;
  status: 'उपलब्ध' | 'उपलब्ध छैन' | 'आंशिक' | 'लागू नहुने';
  remarks?: string;
}

export interface Procurement {
  id: number;
  procurement_id_code: string;
  procurement_number: string;
  office_id: number;
  office_name?: string;
  ministry_id?: number;
  ministry_name?: string;
  province_id?: number;
  province_name?: string;
  district_id?: number;
  district_name?: string;
  municipality_id?: number;
  municipality_name?: string;
  ward?: string;
  title: string;
  procurement_type: 'Works' | 'Goods' | 'Consultancy Services' | 'Other Services';
  procurement_method: 'Open Competitive Bidding' | 'Sealed Quotation' | 'Direct Procurement' | 'Consumer Committee' | 'Consultancy Selection' | 'Special Circumstances';
  fiscal_year_id: number;
  fiscal_year_name?: string;
  budget_source?: string;
  estimated_cost: number;
  contract_amount: number;
  contract_number?: string;
  contract_date?: string;
  contractor_name?: string;
  contract_start_date?: string;
  contract_completion_date?: string;
  current_status: 'योजना' | 'बोलपत्र आह्वान' | 'मूल्याङ्कन' | 'सम्झौता' | 'संचालनमा' | 'सम्पन्न' | 'रद्द' | 'विवादित';
  inspection_date?: string;
  inspection_team?: string;
  lead_inspector?: string;
  remarks?: string;
  created_at?: string;
  latest_inspection_id?: number;
  latest_inspection_code?: string;
  inspection_status?: string;
  completion_percentage?: number;
  risk_score?: number;
  findings_count?: number;
  high_risk_findings_count?: number;
  documents?: ProcurementDocument[];
}

export interface ChecklistStage {
  id: number;
  stage_number: number;
  title_ne: string;
  title_en: string;
  description?: string;
  sort_order: number;
  checklist_items_count?: number;
}

export interface ChecklistItem {
  id: number;
  checklist_code: string;
  stage_id: number;
  stage_number: number;
  stage_title_ne?: string;
  inspection_area: string;
  legal_reference: string;
  required_documents?: string;
  inspection_question: string;
  possible_irregularity?: string;
  default_risk_level: 'न्यून' | 'मध्यम' | 'उच्च' | 'अत्यन्त उच्च';
  sort_order: number;
  is_active: boolean;
}

export interface InspectionChecklistResult {
  checklist_item_id: number;
  checklist_code: string;
  stage_id: number;
  stage_number: number;
  inspection_area: string;
  legal_reference: string;
  required_documents?: string;
  inspection_question: string;
  possible_irregularity?: string;
  default_risk_level: 'न्यून' | 'मध्यम' | 'उच्च' | 'अत्यन्त उच्च';
  sort_order: number;
  stage_title_ne: string;
  result_id?: number;
  compliance_status?: 'परिपालन' | 'आंशिक परिपालन' | 'परिपालन नभएको' | 'लागू नहुने' | 'प्रमाण अपुग' | 'जाँच बाँकी';
  risk_level?: 'न्यून' | 'मध्यम' | 'उच्च' | 'अत्यन्त उच्च';
  evidence_reference?: string;
  observation?: string;
  financial_impact?: number;
  inspector_comment?: string;
  evidence_count?: number;
  findings_count?: number;
}

export interface Inspection {
  id: number;
  inspection_code: string;
  procurement_id: number;
  procurement_title?: string;
  procurement_id_code?: string;
  procurement_number?: string;
  procurement_type?: string;
  procurement_method?: string;
  estimated_cost?: number;
  contract_amount?: number;
  contractor_name?: string;
  office_id?: number;
  office_name?: string;
  inspection_date?: string;
  status: 'Draft' | 'In Progress' | 'Submitted' | 'Under Review' | 'Returned for Correction' | 'Verified' | 'Closed';
  lead_inspector_id?: number;
  lead_inspector_name?: string;
  inspection_team?: string;
  summary_notes?: string;
  risk_score: number;
  completion_percentage: number;
  verified_by?: number;
  verified_by_name?: string;
  verified_at?: string;
  created_at?: string;
  findings_count?: number;
  high_risk_findings_count?: number;
  stats?: {
    total_items: number;
    checked_items: number;
    compliant_items: number;
    partial_items: number;
    non_compliant_items: number;
    na_items: number;
    missing_evidence_items: number;
    high_risk_items: number;
    critical_risk_items: number;
    total_financial_impact: number;
  };
}

export interface Finding {
  id: number;
  finding_code: string;
  inspection_id?: number;
  inspection_code?: string;
  procurement_id: number;
  procurement_title?: string;
  procurement_id_code?: string;
  contractor_name?: string;
  office_name?: string;
  checklist_item_id?: number;
  checklist_code?: string;
  inspection_area?: string;
  stage_number?: number;
  title: string;
  description: string;
  legal_reference?: string;
  evidence_summary?: string;
  possible_irregularity?: string;
  risk_level: 'न्यून' | 'मध्यम' | 'उच्च' | 'अत्यन्त उच्च';
  estimated_financial_impact: number;
  responsible_office?: string;
  responsible_officer?: string;
  recommended_corrective_action?: string;
  deadline?: string;
  deadline_bs?: string;
  status: 'Open' | 'Under Review' | 'Corrective Action Required' | 'Resolved' | 'Closed' | 'Referred';
  inspector_remarks?: string;
  created_at?: string;
  corrective_actions_count?: number;
  pending_actions_count?: number;
}

export interface CorrectiveAction {
  id: number;
  finding_id: number;
  finding_code?: string;
  finding_title?: string;
  finding_risk_level?: string;
  inspection_id?: number;
  procurement_id?: number;
  procurement_title?: string;
  procurement_id_code?: string;
  office_name?: string;
  corrective_action_text: string;
  responsible_office?: string;
  responsible_officer?: string;
  deadline?: string;
  deadline_bs?: string;
  progress_notes?: string;
  completion_date?: string;
  status: 'बाँकी' | 'प्रक्रियामा' | 'सम्पन्न' | 'प्रमाणित' | 'समयसीमा नाघेको';
  verification_status: 'Unverified' | 'Verified' | 'Rejected';
  verification_remarks?: string;
  verification_officer?: string;
  verified_at?: string;
  is_overdue?: boolean;
}

export interface EvidenceFile {
  id: number;
  inspection_id: number;
  checklist_item_id?: number;
  checklist_code?: string;
  inspection_area?: string;
  file_name: string;
  stored_file_name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  document_number?: string;
  document_date?: string;
  page_number?: string;
  description?: string;
  uploader_name?: string;
  uploaded_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  username?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  created_at: string;
}

export interface DashboardSummary {
  kpis: {
    total_procurements: string | number;
    total_inspections: string | number;
    in_progress_inspections: string | number;
    verified_inspections: string | number;
    total_findings: string | number;
    high_critical_findings: string | number;
    open_findings: string | number;
    overdue_corrective_actions: string | number;
    total_financial_impact: string | number;
    total_contract_volume: string | number;
    total_checklist_stages: string | number;
    total_checklist_items: string | number;
  };
  compliance: Array<{ compliance_status: string; count: string | number }>;
  risk: Array<{ risk_level: string; count: string | number }>;
  stages: Array<{
    stage_id: number;
    stage_number: number;
    title_ne: string;
    title_en: string;
    items_count: string | number;
    findings_count: string | number;
    financial_impact: string | number;
  }>;
  provinces: Array<{
    id: number;
    name_ne: string;
    name_en: string;
    inspections_count: string | number;
    findings_count: string | number;
  }>;
  alerts: Array<{
    id: number;
    finding_code: string;
    title: string;
    risk_level: string;
    estimated_financial_impact: number;
    deadline?: string;
    procurement_title: string;
    office_name: string;
  }>;
}
