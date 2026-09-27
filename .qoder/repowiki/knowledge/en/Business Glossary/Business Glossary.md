---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### 34-Stage Procurement Cycle
- Definition：The full public procurement lifecycle defined in Nepal's Public Procurement Act 2063 and Public Procurement Regulations 2064, comprising 34 stages and 142 statutory checklist items. This is the canonical reference model the app enforces via its master checklist, replacing the earlier 12-stage / 55-item version.
- Aliases：Act 2063 / Regulations 2064 cycle、Statutory 142 Items、34 चरणीय प्रक्रिया

### Master Checklist
- Definition：The authoritative, stage-grouped list of 142 statutory checklist items (बुँदा) that every procurement must satisfy. It is loaded from schema/migrations and consumed by Inspections, Findings, Reports, and the Dashboard views.
- Aliases：master checklist、statutory checklist、चेकलिस्ट

### Inspection
- Definition：A procurement evaluation record that maps one or more Master Checklist items to completion status, risk level, and remarks. Each inspection aggregates stage-wise counts (done/pending/issue) and drives dashboard KPIs.
- Aliases：procurement inspection、evaluation

### Finding
- Definition：A non-conformity or violation linked to a specific Master Checklist item within an Inspection, carrying legal references (नियम <number>) and remarks. Findings drive corrective actions and report summaries.
- Aliases：non-conformity、violation finding

### Corrective Action
- Definition：A remediation task created in response to a Finding, tracked until closure. Part of the post-inspection compliance workflow.
- Aliases：remediation action、corrective action

### Evidence
- Definition：Uploaded supporting documents (files stored under `uploads/`) attached to Inspections, Findings, or Corrective Actions to substantiate claims during procurement monitoring.
- Aliases：supporting document、attachment

### Audit Log
- Definition：Immutable records of user actions (create/update/delete) across all entities, used for accountability and traceability in the procurement process.
- Aliases：audit trail、audit log

### Report Print Modal
- Definition：The printable summary view of a completed inspection, showing checklist coverage, findings, and legal references — rendered via a dedicated modal component and styled for print output.
- Aliases：print report、inspection report

### Dashboard Summary
- Definition：Aggregated KPIs (total inspections, findings, corrective actions, stage-wise counts) exposed via `/api/dashboard/summary` and displayed in the main dashboard view.
- Aliases：KPI dashboard、dashboard stats

### Toast
- Definition：A transient notification component (success/error/info) wrapping user feedback for save failures, navigation actions, and bulk operations, replacing raw `alert()` calls throughout the UI.
- Aliases：notification toast、toast message
