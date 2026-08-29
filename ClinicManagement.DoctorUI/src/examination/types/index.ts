// Dữ liệu bệnh nhân trong hàng đợi
export interface QueuePatient {
  id: number;
  stt: string;
  name: string;
  code: string;
  avatar: string;
  gender: string;
  age: number;
  visit: string;
  department: string;
  priority: 'urgent' | 'normal';
  time: string;
  status: 'wait' | 'exam' | 'done' | 'cancel';
  alert: boolean;
}

// Dữ liệu chi tiết khám
export interface ExamDetail {
  visit: string;
  department: string;
  room: string;
  status: string;
  patient: {
    name: string;
    code: string;
    dob: string;
    gender: string;
    cccd: string;
    bhyt: string;
    phone: string;
    address: string;
  };
  examination: {
    reason: string;
    history: string;
    vitals: {
      temperature: string;
      pulse: string;
      bloodPressure: string;
      respiration: string;
      spo2: string;
    };
    clinicalExam: string;
    symptoms: string;
    initialAssessment: string;
  };
  medicalRecord: {
    personalHistory: string;
    allergies: string;
    underlyingDiseases: string;
    familyHistory: string;
    visitHistory: Array<{
      date: string;
      visit: string;
      diagnosis: string;
      doctor: string;
      status: string;
    }>;
  };
  treatment: {
    diagnosis: {
      icd: string;
      name: string;
      diagnosis: string;
      type: string;
      note: string;
      assessment: string;
    };
    diagnosisList: Array<{
      icd: string;
      name: string;
      type: string;
      note: string;
    }>;
    services: Array<{
      name: string;
      qty: number;
      status: string;
      time: string;
    }>;
    drugs: Array<{
      name: string;
      qty: number;
      unit: string;
      dose: string;
      freq: string;
      days: number;
      route: string;
    }>;
    results: Array<{
      indicator: string;
      result: string;
      unit: string;
      ref: string;
      evaluation: string;
    }>;
  };
}

// Type cho workspace
export type ExamWorkspace = 'patient' | 'examination' | 'medical-record' | 'treatment' | 'electronic-record';