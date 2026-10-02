export type Language = 'ne' | 'en';

export interface ProcurementStage {
  id: number;
  stageNumber: string;
  title: string;
  titleEn: string;
  shortDesc: string;
  shortDescEn: string;
  legalBasis: string;
  timeLimit: string;
  procedureSteps: string[];
  keyResponsibilities: string[];
  mandatoryDocuments: string[];
  checkpoints: string[];
  risksAndMitigation: string;
  officialAdvice: string;
}

export interface ProcurementMethod {
  id: string;
  name: string;
  nameEn: string;
  thresholdLimit: string;
  category: 'works' | 'goods' | 'consulting' | 'other';
  description: string;
  legalRef: string;
  noticePeriod: string;
  approvingAuthority?: string;
  requiredDocuments?: string[];
  evaluationProcess?: string[];
  steps: string[];
  specialConditions: string[];
}

export interface ChecklistItem {
  id: string;
  stageId: number;
  question: string;
  questionEn: string;
  legalRef: string;
  category: string;
  isMandatory: boolean;
  helpText: string;
  verified?: boolean;
  notes?: string;
}

export interface ThresholdRule {
  type: 'works' | 'goods' | 'consulting' | 'other';
  method: string;
  minAmount: number;
  maxAmount: number; // in NPR
  formattedRange: string;
  approvingAuthority: string;
  noticePeriodDays: string;
  legalSection: string;
  specialRules: string;
  methodId?: string;
  applicability?: string;
  requiredDocuments?: string[];
  thresholdBased?: boolean;
}

export interface ApprovalAuthorityBand {
  level: string;
  worksEstimate: string;
  goodsServicesEstimate: string;
  consultingAward: string;
  legalRef: string;
}

export interface CitizenCharterItem {
  id: string;
  service: string;
  responsibleOfficer: string;
  timeframe: string;
  fee: string;
  requiredDocuments: string[];
  roomNo: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  badge: string;
  isUrgent?: boolean;
  link?: string;
}
