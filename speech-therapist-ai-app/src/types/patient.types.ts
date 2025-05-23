export interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: 'הפרעה בספקטרום האוטיסטי' | 'עיכוב שפה' | 'הפרעת דיבור' | 'גמגום' | 'אחר';
  treatmentStartDate: string; // ISO date string
  notes?: string;
  // Future fields:
  // avatarUrl?: string;
  // treatmentCount?: number;
  // lastTreatmentDate?: string;
}
