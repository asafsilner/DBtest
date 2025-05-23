import { TreatmentSession } from '../types/treatment.types';

// Patient IDs from patientService: 1 (יוסי כהן), 2 (שרה לוי), 3 (דניאל גרין), 4 (מאיה חדד), 5 (איתי ביטון), 6 (נועה מזרחי), 7 (אריאל כץ)
export const mockTreatmentSessions: TreatmentSession[] = [
  // יוסי כהן (ID: 1)
  {
    id: 'treat101', patientId: '1', patientName: 'יוסי כהן', date: '2024-05-20', time: '10:00', duration: '45 דקות',
    summaryShort: 'תרגול הפקת צלילים /ס/ ו /צ/. משחק לוטו צלילים. שיפור נצפה בצליל /ס/.', status: 'הושלם',
    fullTranscript: 'קלינאית: בוקר טוב יוסי! היום נתאמן על הצלילים סמך וצדיק. מוכן? יוסי: כן. קלינאית: יופי, בוא נתחיל עם /ס/...',
    aiSummary: 'יוסי התקשה מעט עם הצליל /צ/ אך הראה שיפור עם /ס/. שיתף פעולה יפה במשחק הלוטו והביע הנאה.',
    goalsAchieved: [ { id: 'goal1_1_1', text: 'זיהוי צליל פותח במילים נבחרות', achieved: true }, { id: 'goal1_1_2', text: 'הפקת צליל /ס/ בתחילת מילה', achieved: true } ]
  },
  {
    id: 'treat102', patientId: '1', patientName: 'יוסי כהן', date: '2024-05-13', time: '10:00', duration: '45 דקות',
    summaryShort: 'בניית משפטים פשוטים סביב תמונות וסיפור קצר בנושא חיות.', status: 'הושלם',
    aiSummary: 'הצליח לבנות משפטים של 2-3 מילים. התקשה עם שאלות "למה". גילה עניין רב בתמונות של חיות.',
  },
  {
    id: 'treat103', patientId: '1', patientName: 'יוסי כהן', date: '2024-05-27', time: '10:00', duration: '45 דקות',
    summaryShort: 'משחקי קופסה לפיתוח אוצר מילים והבנת הוראות מורכבות.', status: 'טיוטה',
  },
  // שרה לוי (ID: 2)
  {
    id: 'treat201', patientId: '2', patientName: 'שרה לוי', date: '2024-05-21', time: '14:30', duration: '50 דקות',
    summaryShort: 'עבודה על מודעות פונולוגית - זיהוי צליל פותח וסוגר במילים.', status: 'הושלם',
    fullTranscript: 'קלינאית: אהלן שרה, בואי נשחק היום במשחק הצלילים. אני אגיד מילה, ואת תגידי לי איזה צליל את שומעת בהתחלה...',
    aiSummary: 'התקדמות טובה בזיהוי צליל פותח. צליל סוגר עדיין מאתגר. נהנתה מהמשחק עם בובות.',
    goalsAchieved: [ { id: 'goal2_1_1', text: 'זיהוי צליל פותח ב-8 מתוך 10 מילים', achieved: true } ]
  },
  {
    id: 'treat202', patientId: '2', patientName: 'שרה לוי', date: '2024-05-14', time: '14:30', duration: '50 דקות',
    summaryShort: 'הרחבת אוצר מילים בנושא פירות וירקות באמצעות משחק זיכרון.', status: 'הושלם',
  },
  // דניאל גרין (ID: 3)
  {
    id: 'treat301', patientId: '3', patientName: 'דניאל גרין', date: '2024-05-22', time: '16:00', duration: '60 דקות',
    summaryShort: 'שיפור שטף דיבור באמצעות קריאה בקצב איטי ותרגילי נשימה מבוקרת.', status: 'הושלם',
    aiSummary: 'דניאל היה רגוע יותר היום והצליח לשמור על קצב דיבור איטי יותר בקריאה. תרגילי הנשימה עזרו להפחית מתח.',
    goalsAchieved: [ { id: 'goal3_1_1', text: 'שימוש בתרגילי נשימה להפחתת מתח', achieved: true }, { id: 'goal3_1_2', text: 'קריאת פסקה בקצב איטי ללא גמגום', achieved: false } ]
  },
  {
    id: 'treat302', patientId: '3', patientName: 'דניאל גרין', date: '2024-05-15', time: '16:00', duration: '60 דקות',
    summaryShort: 'תרגול טכניקות "דיבור קל" במצבי שיחה יומיומיים.', status: 'טיוטה',
  },
  // מאיה חדד (ID: 4)
  {
    id: 'treat401', patientId: '4', patientName: 'מאיה חדד', date: '2024-05-23', time: '09:00', duration: '40 דקות',
    summaryShort: "תרגול הפקת צליל ר' במילים בודדות ובמשפטים קצרים. שימוש במראה.", status: 'הושלם',
    aiSummary: "מאיה הצליחה להפיק צליל ר' תקין במספר מילים לאחר הדגמה. עדיין נדרש תרגול להכללה בדיבור ספונטני.",
  },
  // איתי ביטון (ID: 5)
  {
    id: 'treat501', patientId: '5', patientName: 'איתי ביטון', date: '2024-05-19', time: '11:30', duration: '50 דקות',
    summaryShort: 'זיהוי רגשות והבנת סיטואציות חברתיות באמצעות קלפים וסיפורים.', status: 'הושלם',
  },
  // נועה מזרחי (ID: 6)
  {
    id: 'treat601', patientId: '6', patientName: 'נועה מזרחי', date: '2024-05-24', time: '13:00', duration: '45 דקות',
    summaryShort: 'ארגון מסר בעל פה - בניית סיפור בהמשכים עם תמיכה ויזואלית.', status: 'הושלם',
  },
  {
    id: 'treat602', patientId: '6', patientName: 'נועה מזרחי', date: '2024-05-17', time: '13:00', duration: '45 דקות',
    summaryShort: 'תרגול משחקי תפקידים לשיפור כישורי שיח הדדי.', status: 'טיוטה',
  },
  // אריאל כץ (ID: 7)
  {
    id: 'treat701', patientId: '7', patientName: 'אריאל כץ', date: '2024-05-22', time: '15:00', duration: '40 דקות',
    summaryShort: 'הבנת הוראות מורכבות (2-3 שלבים) במשחקי תנועה ובנייה.', status: 'הושלם',
    goalsAchieved: [ { id: 'goal7_1_1', text: 'ביצוע הוראה דו-שלבית ב-70% מהמקרים', achieved: true } ]
  },
  {
    id: 'treat702', patientId: '7', patientName: 'אריאל כץ', date: '2024-05-15', time: '15:00', duration: '40 דקות',
    summaryShort: 'עבודה על אוצר מילים אקטיבי בנושא כלי תחבורה.', status: 'הושלם',
  },
  // Additional older sessions for pagination/variety
  {
    id: 'treat104', patientId: '1', patientName: 'יוסי כהן', date: '2024-04-29', time: '10:00', duration: '45 דקות',
    summaryShort: 'משחקי תור ופיתוח כישורי שיח הדדי עם הקלינאית.', status: 'הושלם',
  },
  {
    id: 'treat203', patientId: '2', patientName: 'שרה לוי', date: '2024-04-30', time: '14:30', duration: '50 דקות',
    summaryShort: 'תרגילי שפתיים ולשון לחיזוק אברי ההיגוי.', status: 'הושלם',
  }
];

export const getTreatmentHistory = async (): Promise<TreatmentSession[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Shorter delay
  return [...mockTreatmentSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTreatmentsByPatientId = async (patientId: string): Promise<TreatmentSession[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const patientTreatments = mockTreatmentSessions.filter(
    session => session.patientId === patientId
  );
  return patientTreatments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
