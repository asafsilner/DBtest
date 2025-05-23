export interface GoalProgress {
  goalId: string;
  goalName: string;
  data: WeeklyProgressPoint[]; 
}

export interface WeeklyProgressPoint {
  week: string; 
  score: number; 
  notes?: string;
}

export const mockPatientProgressData: GoalProgress[] = [
  {
    goalId: 'goalA_yossi', // Linked to a specific patient if needed, or generic
    goalName: 'הפקת צליל /ר/ בתחילת מילה',
    data: [
      { week: 'שבוע 1 (מאי)', score: 20, notes: 'קושי רב, נדרשת תמיכה מלאה בהפקת הצליל.' },
      { week: 'שבוע 2 (מאי)', score: 35, notes: 'מתחיל להבין את מיקום הלשון, אך עדיין לא עקבי.' },
      { week: 'שבוע 3 (מאי)', score: 50, notes: 'הצלחות ספונטניות בהפקה נכונה לאחר הדגמה.' },
      { week: 'שבוע 4 (מאי)', score: 65, notes: 'יציבות משתפרת בהפקת הצליל במילים מוכרות.' },
      { week: 'שבוע 1 (יוני)', score: 70, notes: 'הפקה נכונה ברוב המילים הפשוטות, קושי במילים מורכבות.' },
    ],
  },
  {
    goalId: 'goalB_yossi',
    goalName: 'בניית משפטים עם 3-4 מילים',
    data: [
      { week: 'שבוע 1 (מאי)', score: 40, notes: 'משפטים קצרים, בעיקר שמות עצם ופעלים. מבנה דקדוקי חסר.' },
      { week: 'שבוע 2 (מאי)', score: 55, notes: 'שילוב תיאורים פשוטים (צבע, גודל). עדיין ללא מילות קישור.' },
      { week: 'שבוע 3 (מאי)', score: 70, notes: 'שימוש ראשוני במילות יחס בסיסיות (ב, על, ל).' },
      { week: 'שבוע 4 (מאי)', score: 80, notes: 'משפטים מורכבים יותר, קשיים בהטיית פעלים.' },
      { week: 'שבוע 1 (יוני)', score: 85, notes: 'שטף טוב יותר בבניית משפטים, פחות היסוסים.' },
    ],
  },
  {
    goalId: 'goalC_sara', // Example for another patient
    goalName: 'מענה על שאלות "מי" ו"מה"',
    data: [
      { week: 'שבוע 1 (אוגוסט)', score: 60, notes: 'מזהה "מי" בקלות יחסית, שאלות "מה" לעיתים מבלבלות.' },
      { week: 'שבוע 2 (אוגוסט)', score: 70, notes: 'שיפור בהבנת שאלות "מה" בהקשר לסיפורים מוכרים.' },
      { week: 'שבוע 3 (אוגוסט)', score: 85, notes: 'עונה נכון על רוב השאלות לאחר הקראת סיפור קצר.' },
      { week: 'שבוע 4 (אוגוסט)', score: 90, notes: 'עקביות טובה במענה לשאלות על תמונות ואירועים.' },
      { week: 'שבוע 1 (ספטמבר)', score: 95, notes: 'שליטה טובה במטרה זו, מסוגלת לשאול שאלות דומות בעצמה.' },
    ],
  },
];

export interface PerformanceCategory {
  categoryName: string;
  lastMonthScore: number;
  currentMonthScore: number;
}

export const mockPerformanceCategories: PerformanceCategory[] = [
  { categoryName: 'הגייה ופונולוגיה', lastMonthScore: 55, currentMonthScore: 70 },
  { categoryName: 'אוצר מילים והבנה שפתית', lastMonthScore: 60, currentMonthScore: 75 },
  { categoryName: 'תחביר ומורפולוגיה (בניית משפט)', lastMonthScore: 50, currentMonthScore: 65 },
  { categoryName: 'פרגמטיקה ותקשורת חברתית', lastMonthScore: 65, currentMonthScore: 70 },
  { categoryName: 'שטף דיבור', lastMonthScore: 45, currentMonthScore: 55 },
];

export const mockStrengths = [
  "מוטיבציה גבוהה ורצון להשתתף בפעילויות הטיפוליות.",
  "יכולת טובה ללמוד מחיקוי והדגמה ישירה.",
  "מגיב היטב לחיזוקים חיוביים ומילוליים.",
  "מגלה סקרנות ועניין בחומרי למידה חדשים.",
  "שיתוף פעולה טוב עם הקלינאית וההורים.",
];

export const mockChallenges = [
  "קושי בהכללת הנלמד מהטיפול לסביבות יומיומיות (בית, גן).",
  "סף תסכול נמוך במטלות מורכבות או מאתגרות במיוחד.",
  "זקוק לתמיכה נוספת בתחום הקשב והריכוז לאורך זמן.",
  "נטייה להשתמש במחוות גוף במקום במילים כאשר מתקשה.",
  "קושי בהבנת מושגים מופשטים או דו-משמעיים.",
];

export const mockReportPatient = { // This patient should ideally exist in patientService for consistency
  id: '1', // Corresponds to יוסי כהן in patientService
  name: 'יוסי כהן',
  age: 6,
};
