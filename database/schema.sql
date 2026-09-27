-- ====================================================================
-- NVC Public Procurement Monitoring & Inspection System
-- राष्ट्रिय सतर्कता केन्द्र (NVC) - सार्वजनिक खरिद अनुगमन तथा निरीक्षण प्रणाली
-- PostgreSQL Database Schema
-- ====================================================================

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Provinces Table
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL
);

-- 3. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    province_id INTEGER REFERENCES provinces(id) ON DELETE RESTRICT,
    name_en VARCHAR(100) NOT NULL,
    name_ne VARCHAR(100) NOT NULL
);

-- 4. Municipalities Table
CREATE TABLE IF NOT EXISTS municipalities (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id) ON DELETE RESTRICT,
    name_en VARCHAR(150) NOT NULL,
    name_ne VARCHAR(150) NOT NULL,
    type VARCHAR(50) DEFAULT 'Municipality' -- Metropolitan, Sub-Metropolitan, Municipality, Rural Municipality
);

-- 5. Ministries Table
CREATE TABLE IF NOT EXISTS ministries (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(200) NOT NULL,
    name_ne VARCHAR(200) NOT NULL
);

-- 6. Offices Table
CREATE TABLE IF NOT EXISTS offices (
    id SERIAL PRIMARY KEY,
    ministry_id INTEGER REFERENCES ministries(id) ON DELETE SET NULL,
    province_id INTEGER REFERENCES provinces(id) ON DELETE SET NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    name VARCHAR(250) NOT NULL,
    code VARCHAR(50) UNIQUE,
    address VARCHAR(250),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fiscal Years Table
CREATE TABLE IF NOT EXISTS fiscal_years (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL, -- e.g. २०८२/८३, २०८३/८४
    is_current BOOLEAN DEFAULT FALSE
);

-- 8. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE RESTRICT,
    office_id INTEGER REFERENCES offices(id) ON DELETE SET NULL,
    phone VARCHAR(50),
    designation VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Procurements Table
CREATE TABLE IF NOT EXISTS procurements (
    id SERIAL PRIMARY KEY,
    procurement_id_code VARCHAR(100) UNIQUE NOT NULL, -- e.g. NVC-PROC-2083-001
    procurement_number VARCHAR(150) NOT NULL, -- Public Entity's bidding/contract reference number
    office_id INTEGER REFERENCES offices(id) ON DELETE RESTRICT,
    ministry_id INTEGER REFERENCES ministries(id) ON DELETE SET NULL,
    province_id INTEGER REFERENCES provinces(id) ON DELETE SET NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    municipality_id INTEGER REFERENCES municipalities(id) ON DELETE SET NULL,
    ward VARCHAR(20),
    title VARCHAR(300) NOT NULL,
    procurement_type VARCHAR(50) NOT NULL, -- Goods, Works, Consultancy Services, Other Services
    procurement_method VARCHAR(100) NOT NULL, -- Open Competitive Bidding, Sealed Quotation, Direct Procurement, etc.
    fiscal_year_id INTEGER REFERENCES fiscal_years(id) ON DELETE RESTRICT,
    budget_source VARCHAR(150),
    estimated_cost NUMERIC(15, 2) DEFAULT 0.00,
    contract_amount NUMERIC(15, 2) DEFAULT 0.00,
    contract_number VARCHAR(150),
    contract_date DATE,
    contractor_name VARCHAR(250),
    contract_start_date DATE,
    contract_completion_date DATE,
    current_status VARCHAR(50) DEFAULT 'संचालनमा', -- योजना/तयारी, बोलपत्र आह्वान, मूल्याङ्कन, सम्झौता, संचालनमा, सम्पन्न, रद्द
    inspection_date DATE,
    inspection_team TEXT,
    lead_inspector VARCHAR(150),
    remarks TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Checklist Stages Table
CREATE TABLE IF NOT EXISTS checklist_stages (
    id SERIAL PRIMARY KEY,
    stage_number INTEGER UNIQUE NOT NULL,
    title_ne VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL
);

-- 11. Checklist Items (Master Checklist) Table
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. PROC-001
    stage_id INTEGER REFERENCES checklist_stages(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    inspection_area VARCHAR(150) NOT NULL,
    legal_reference VARCHAR(250) NOT NULL,
    required_documents TEXT,
    inspection_question TEXT NOT NULL,
    possible_irregularity TEXT,
    default_risk_level VARCHAR(50) DEFAULT 'मध्यम', -- न्यून, मध्यम, उच्च, अत्यन्त उच्च
    applicable_procurement_methods TEXT, -- Comma-separated or ALL
    sort_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id SERIAL PRIMARY KEY,
    inspection_code VARCHAR(100) UNIQUE NOT NULL, -- e.g. INSP-2083-001
    procurement_id INTEGER REFERENCES procurements(id) ON DELETE CASCADE,
    inspection_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, In Progress, Submitted, Under Review, Returned for Correction, Verified, Closed
    lead_inspector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    inspection_team TEXT,
    summary_notes TEXT,
    risk_score NUMERIC(5, 2) DEFAULT 0.00,
    completion_percentage NUMERIC(5, 2) DEFAULT 0.00,
    verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Inspection Checklist Results Table
CREATE TABLE IF NOT EXISTS inspection_checklist_results (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_item_id INTEGER REFERENCES checklist_items(id) ON DELETE RESTRICT,
    compliance_status VARCHAR(50) DEFAULT 'जाँच बाँकी', -- जाँच बाँकी, परिपालन, आंशिक परिपालन, परिपालन नभएको, लागू नहुने, प्रमाण अपुग
    risk_level VARCHAR(50) DEFAULT 'मध्यम', -- न्यून, मध्यम, उच्च, अत्यन्त उच्च
    evidence_reference TEXT,
    observation TEXT,
    financial_impact NUMERIC(15, 2) DEFAULT 0.00,
    inspector_comment TEXT,
    completed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_inspection_checklist UNIQUE (inspection_id, checklist_item_id)
);

-- 14. Evidence Files Table
CREATE TABLE IF NOT EXISTS evidence_files (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_item_id INTEGER REFERENCES checklist_items(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    document_number VARCHAR(100),
    document_date DATE,
    page_number VARCHAR(50),
    description TEXT,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Findings Table
CREATE TABLE IF NOT EXISTS findings (
    id SERIAL PRIMARY KEY,
    finding_code VARCHAR(100) UNIQUE NOT NULL, -- e.g. FND-2083-001
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    procurement_id INTEGER REFERENCES procurements(id) ON DELETE CASCADE,
    checklist_item_id INTEGER REFERENCES checklist_items(id) ON DELETE SET NULL,
    checklist_result_id INTEGER REFERENCES inspection_checklist_results(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    legal_reference VARCHAR(250),
    evidence_summary TEXT,
    possible_irregularity TEXT,
    risk_level VARCHAR(50) DEFAULT 'उच्च', -- न्यून, मध्यम, उच्च, अत्यन्त उच्च
    estimated_financial_impact NUMERIC(15, 2) DEFAULT 0.00,
    responsible_office VARCHAR(250),
    responsible_officer VARCHAR(150),
    recommended_corrective_action TEXT,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'Open', -- Open, Under Review, Corrective Action Required, Resolved, Closed, Referred
    inspector_remarks TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Corrective Actions Table
CREATE TABLE IF NOT EXISTS corrective_actions (
    id SERIAL PRIMARY KEY,
    finding_id INTEGER REFERENCES findings(id) ON DELETE CASCADE,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    corrective_action_text TEXT NOT NULL,
    responsible_office VARCHAR(250),
    responsible_officer VARCHAR(150),
    deadline DATE,
    progress_notes TEXT,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'बाँकी', -- बाँकी, प्रक्रियामा, सम्पन्न, प्रमाणित, समयसीमा नाघेको
    verification_status VARCHAR(50) DEFAULT 'Unverified', -- Unverified, Verified, Rejected
    verification_remarks TEXT,
    verification_officer VARCHAR(150),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Procurement Documents Checklist Table (File completeness)
CREATE TABLE IF NOT EXISTS procurement_documents (
    id SERIAL PRIMARY KEY,
    procurement_id INTEGER REFERENCES procurements(id) ON DELETE CASCADE,
    document_title VARCHAR(250) NOT NULL,
    document_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'उपलब्ध छैन', -- उपलब्ध छ, उपलब्ध छैन, अपूर्ण, लागू हुँदैन
    file_path VARCHAR(500),
    remarks TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_procurements_office ON procurements(office_id);
CREATE INDEX IF NOT EXISTS idx_procurements_status ON procurements(current_status);
CREATE INDEX IF NOT EXISTS idx_inspections_procurement ON inspections(procurement_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_checklist_items_stage ON checklist_items(stage_id);
CREATE INDEX IF NOT EXISTS idx_checklist_results_insp ON inspection_checklist_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_findings_inspection ON findings(inspection_id);
CREATE INDEX IF NOT EXISTS idx_findings_risk ON findings(risk_level);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_finding ON corrective_actions(finding_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
