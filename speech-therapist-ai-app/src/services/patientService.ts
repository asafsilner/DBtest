import localforage from 'localforage';
import { Patient } from '../types/patient.types';

const PATIENTS_KEY = 'patients';

localforage.config({
  name: 'SpeechTherapyApp',
  storeName: 'patients_store',
  description: 'Storage for speech therapy app patients',
});

const seedInitialData = async () => {
  let patients = await localforage.getItem<Patient[]>(PATIENTS_KEY);
  // For consistent testing, always re-seed if the number of patients is less than the new initial set.
  // This helps if we add more patients to the initial set later.
  const initialPatients: Patient[] = [
    {
      id: '1', // Keep existing ID for consistency if other mock data relies on it
      name: 'יוסי כהן',
      age: 6,
      diagnosis: 'הפרעה בספקטרום האוטיסטי',
      treatmentStartDate: new Date(2023, 4, 15).toISOString(), // May 15, 2023
      notes: 'יוסי מתקשה ביצירת קשר עין, מגיב טוב לחיזוקים חיוביים ולמשחקי מחשב.',
    },
    {
      id: '2', // Keep existing ID
      name: 'שרה לוי',
      age: 4,
      diagnosis: 'עיכוב שפה',
      treatmentStartDate: new Date(2023, 7, 1).toISOString(), // August 1, 2023
      notes: 'אוצר מילים מצומצם לגילה, מתקשה בבניית משפטים. אוהבת סיפורים ובעלי חיים.',
    },
    {
      id: '3',
      name: 'דניאל גרין',
      age: 8,
      diagnosis: 'גמגום',
      treatmentStartDate: new Date(2023, 0, 10).toISOString(), // January 10, 2023
      notes: 'הגמגום מחמיר במצבי לחץ ובדיבור מול קהל. מודע לקושי ומביע תסכול לעיתים.',
    },
    {
      id: '4',
      name: 'מאיה חדד',
      age: 5,
      diagnosis: 'הפרעת דיבור', // Assuming this is for "שיבושי היגוי"
      treatmentStartDate: new Date(2023, 10, 1).toISOString(), // November 1, 2023
      notes: "מתקשה בהגיית האותיות ר', ש', ו-ס'. משתפת פעולה יפה בתרגילים.",
    },
    {
      id: '5',
      name: 'איתי ביטון',
      age: 7,
      diagnosis: 'אחר',
      treatmentStartDate: new Date(2024, 0, 20).toISOString(), // January 20, 2024
      notes: 'מראה קושי בהבנת סיטואציות חברתיות ושימוש בשפה בהקשר חברתי. אוהב משחקי בנייה.',
    },
    {
      id: '6',
      name: 'נועה מזרחי',
      age: 9,
      diagnosis: 'הפרעת דיבור',
      treatmentStartDate: new Date(2022, 11, 5).toISOString(), // December 5, 2022
      notes: 'עובדת על שטף דיבור וארגון מסר. מראה התקדמות יפה בשימוש באסטרטגיות שנלמדו.',
    },
    {
      id: '7',
      name: 'אריאל כץ',
      age: 5,
      diagnosis: 'עיכוב שפה',
      treatmentStartDate: new Date(2024, 1, 12).toISOString(), // February 12, 2024
      notes: 'קושי בהבנת הוראות מורכבות. אוצר מילים פסיבי רחב יותר מאקטיבי.',
    }
  ];

  // Simplified seeding: always set to initial if it's null or if we want to "force refresh" mock data
  // For this task, we will overwrite to ensure the new data is present.
  // if (patients === null || patients.length < initialPatients.length) {
  await localforage.setItem(PATIENTS_KEY, initialPatients);
  console.log('Patient data seeded/updated with new mock data.');
  patients = initialPatients; // Ensure 'patients' variable is up-to-date for subsequent functions if called immediately
  // }
};

seedInitialData(); 

export const getPatients = async (): Promise<Patient[]> => {
  const patients = await localforage.getItem<Patient[]>(PATIENTS_KEY);
  return patients || [];
};

export const addPatient = async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
  const patients = await getPatients();
  const newPatient: Patient = {
    ...patientData,
    id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
  };
  patients.push(newPatient);
  await localforage.setItem(PATIENTS_KEY, patients);
  return newPatient;
};

export const getPatientById = async (id: string): Promise<Patient | undefined> => {
  const patients = await getPatients();
  return patients.find(patient => patient.id === id);
};
