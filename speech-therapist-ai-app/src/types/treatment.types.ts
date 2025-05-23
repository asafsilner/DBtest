import { Patient } from './patient.types'; // Assuming Patient type is here or can be imported

export interface TreatmentSession {
  id: string;
  patientId: string; // Links to Patient.id
  patientName?: string; // Denormalized for easier display, can be fetched if needed
  date: string; // ISO date string, e.g., "2023-10-26"
  time: string; // e.g., "10:00"
  duration: string; // e.g., "45 דקות"
  summaryShort: string; // Brief summary or title
  status: 'הושלם' | 'טיוטה' | 'בוטל'; // Completed / Draft / Cancelled
  fullTranscript?: string;
  aiSummary?: string;
  goalsAchieved?: { id: string; text: string; achieved: boolean }[]; // Goals from the session
}

// Example of how you might link it to a patient in a real app
export interface PatientWithTreatments extends Patient {
  treatments: TreatmentSession[];
}
