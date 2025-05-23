import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById } from '../services/patientService';
import { Patient } from '../types/patient.types';
import styles from './TreatmentSummaryPage.module.css';
import { PDFDownloadLink, Document, Page, Text, Font, StyleSheet as PDFStyles, View } from '@react-pdf/renderer'; // Added View
// import { FaSave, FaFilePdf, FaEdit } from 'react-icons/fa'; // Example icons

// Attempt to register a font (assuming a suitable font file is available in public/fonts)
// In a real setup, ensure 'Assistant-Regular.ttf' is in the public/fonts directory.
// For this environment, this might not work if files cannot be accessed from public.
try {
  Font.register({
    family: 'Assistant',
    fonts: [
      { src: '/fonts/Assistant-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Assistant-Bold.ttf', fontWeight: 'bold' },
    ]
  });
} catch (e) {
  console.warn("Could not register Assistant font for PDF:", e);
}

const pdfStyles = PDFStyles.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Assistant', // Use registered Hebrew font
    direction: 'rtl', 
  },
  section: {
    marginBottom: 15, // Increased margin
  },
  header: {
    fontSize: 20, // Increased size
    marginBottom: 15,
    textAlign: 'center',
    color: '#059669', // Calm Green for header
    fontWeight: 'bold',
  },
  patientInfo: {
    fontSize: 12,
    marginBottom: 5, // Reduced margin
    textAlign: 'right',
    color: '#374151', // Dark Gray
  },
  subheader: {
    fontSize: 16, // Increased size
    fontWeight: 'bold', // Bolder
    marginBottom: 8,
    color: '#2563EB', // Medical Blue
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE', // Light Medical Blue border
    paddingBottom: 3,
    textAlign: 'right',
  },
  text: {
    fontSize: 11, // Increased size
    marginBottom: 5,
    textAlign: 'right', 
    lineHeight: 1.6, // Improved line height
  },
  listItem: {
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 15, // For RTL bullet points
    textAlign: 'right',
  },
  // For transcript styling in PDF
  transcriptLine: { flexDirection: 'row', marginBottom: 3, textAlign: 'right' },
  transcriptSpeaker: { fontWeight: 'bold', fontSize: 11 },
  transcriptText: { fontSize: 11, flex: 1, textAlign: 'right' }, // flex:1 to allow wrapping
});

const mockFullTranscription = `קלינאית: שלום [שם המטופל], איך אתה מרגיש היום?
מטופל: טוב.
קלינאית: שיחקנו היום במשחק הצורות, זוכר? איזה צורה זו? (מצביעה על עיגול)
מטופל: עיגול.
קלינאית: נכון מאוד! וזו? (מצביעה על ריבוע)
מטופל: ריבוע.
קלינאית: יפה! ועכשיו בוא ננסה להגיד "כדור כחול".
מטופל: כדור כחול.
קלינאית: מצוין! הנה עוד כמה מילים לתרגול...
... (עוד טקסט מהטיפול) ...
מטופל: היה כיף.
קלינאית: אני שמחה לשמוע. נתראה בשבוע הבא!`;

const mockAISummary = {
  activities: "משחק זיהוי צורות, תרגול הגיית מילים ומשפטים קצרים, שיחה מובנית.",
  response: "הראה עניין והשתתפות פעילה ברוב הפעילויות. שיתף פעולה יפה עם המטלות.",
  progress: "שיפור קל בזיהוי צורות גיאומטריות בסיסיות. הפקת צלילים מסוימים עדיין דורשת הכוונה.",
  recommendations: "להמשיך לחזק אוצר מילים בנושא חיות וצורות. תרגול נוסף על הפקת צליל /ל/.",
};

const mockSuggestedGoals = [
  "הרחבת אוצר מילים בנושא פירות וירקות.",
  "תרגול משפטים מורכבים עם 3-4 מילים.",
  "שיפור יכולת מענה על שאלות 'מה' ו'איפה'.",
];

const TreatmentSummaryPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [treatmentDate] = useState(new Date()); 
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [editableTranscript, setEditableTranscript] = useState(mockFullTranscription);
  const [editableSummary, setEditableSummary] = useState(
    `פעילויות שבוצעו: ${mockAISummary.activities}\n\nתגובת המטופל ושיתוף פעולה: ${mockAISummary.response}\n\nהתקדמות בתחומים שונים: ${mockAISummary.progress}\n\nהמלצות לטיפול הבא: ${mockAISummary.recommendations}`
  );
  const [pdfReady, setPdfReady] = useState(false); 

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoadingPatient(true);
      try {
        const idToFetch = patientId || '1'; 
        const fetchedPatient = await getPatientById(idToFetch);
        if (fetchedPatient) {
          setPatient(fetchedPatient);
          setEditableTranscript(mockFullTranscription.replace(/\[שם המטופל\]/g, fetchedPatient.name)); // Global replace
        } else {
          setFeedbackMessage(`שגיאה: מטופל עם מזהה ${idToFetch} לא נמצא.`);
          setTimeout(() => navigate('/patients'), 2000);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setFeedbackMessage('שגיאה בטעינת נתוני המטופל.');
        setTimeout(() => navigate('/patients'), 2000);
      } finally {
        setLoadingPatient(false);
      }
    };
    fetchPatientData();
  }, [patientId, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setPdfReady(true), 500); // Reduced delay
    return () => clearTimeout(timer);
  }, []);

  const handleSaveSummary = () => {
    setFeedbackMessage('שומר סיכום...');
    console.log("Saving Summary:", { patient, treatmentDate: treatmentDate.toLocaleDateString('he-IL'), editableTranscript, editableSummary });
    setTimeout(() => setFeedbackMessage("הסיכום נשמר בהצלחה (הדמיה)."), 1000);
  };

  const handleReturnToEdit = () => {
    navigate(`/treatment/new/${patient?.id || '1'}`);
  };
  
  const MyPdfDocument = () => (
    <Document title={`סיכום טיפול - ${patient?.name || ''}`} author="SpeechTherapyAI">
      <Page size="A4" style={pdfStyles.page} orientation="portrait">
        <Text style={pdfStyles.header}>סיכום טיפול</Text>
        {patient && (
            <View style={pdfStyles.section}>
                <Text style={pdfStyles.patientInfo}>שם מטופל: {patient.name}</Text>
                <Text style={pdfStyles.patientInfo}>גיל: {patient.age}</Text>
            </View>
        )}
        <Text style={{...pdfStyles.patientInfo, marginBottom: 15}}>תאריך טיפול: {treatmentDate.toLocaleDateString('he-IL')}</Text>
        
        <View style={pdfStyles.section}>
            <Text style={pdfStyles.subheader}>תמלול מלא</Text>
            {editableTranscript.split('\n').map((line, index) => {
                const parts = line.split(':');
                const speaker = parts.length > 1 ? parts[0] : '';
                const text = parts.length > 1 ? parts.slice(1).join(':') : line;
                return (
                    <View key={index} style={pdfStyles.transcriptLine}>
                         {/* Text aligned to right by default in parent, so order matters for RTL */}
                        <Text style={pdfStyles.transcriptText}>{text.trim()}</Text>
                        {speaker && <Text style={{...pdfStyles.transcriptSpeaker, color: speaker.includes('קלינאית') ? '#2563EB' : '#059669' }}> :{speaker}</Text>}
                    </View>
                );
            })}
        </View>

        <View style={pdfStyles.section}>
            <Text style={pdfStyles.subheader}>סיכום והמלצות (מבוסס AI)</Text>
            <Text style={pdfStyles.text}>{editableSummary}</Text>
        </View>

        <View style={pdfStyles.section}>
            <Text style={pdfStyles.subheader}>הצעות למטרות חדשות (מבוסס AI)</Text>
            {mockSuggestedGoals.map((goal, index) => (
            <Text key={index} style={pdfStyles.listItem}>• {goal}</Text>
            ))}
        </View>
      </Page>
    </Document>
  );

  if (loadingPatient) {
    return <div className={styles.pageContainer}><p className={styles.feedbackMessage || styles.loadingMessage}>טוען נתוני מטופל...</p></div>;
  }
  if (!patient) {
    return <div className={styles.pageContainer}><p className={styles.errorMessage || styles.feedbackMessage}>{feedbackMessage || 'שגיאה: לא נטען מטופל.'}</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {feedbackMessage && !loadingPatient && <div className={styles.feedbackMessage} aria-live="polite">{feedbackMessage}</div>}
      <header className={styles.header}>
        <h1>סיכום טיפול</h1>
        <p data-tooltip={`מטופל: ${patient.name}, תאריך: ${treatmentDate.toLocaleDateString('he-IL')}`}>
            מטופל: {patient.name} | תאריך: {treatmentDate.toLocaleDateString('he-IL')}
        </p>
      </header>

      <div className={styles.mainLayout}>
        <section className={styles.panel} aria-labelledby="transcription-panel-title">
          <h2 id="transcription-panel-title">תמלול מלא</h2>
          <div className={styles.transcriptionDisplayContainer}>
            <label htmlFor="transcription-display">תצוגת תמלול (לקריאה בלבד):</label>
            <div id="transcription-display" className={styles.transcriptionDisplay} dangerouslySetInnerHTML={{
                __html: editableTranscript
                    .replace(/קלינאית:/g, `<strong class="${styles.speakerTherapist}">קלינאית:</strong>`)
                    .replace(/מטופל:/g, `<strong class="${styles.speakerPatient}">מטופל:</strong>`)
                    .replace(/\n/g, '<br />')
                }} 
                aria-live="polite"
            />
          </div>
          <label htmlFor="editableTranscriptArea" className="visually-hidden">ערוך תמלול</label>
          <textarea
            id="editableTranscriptArea"
            className={styles.textArea}
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            rows={10}
            aria-label="אזור עריכת תמלול"
            placeholder="התמלול המלא של הטיפול..."
          />
        </section>

        <section className={styles.panel} aria-labelledby="summary-panel-title">
          <h2 id="summary-panel-title">סיכום אוטומטי (AI) והצעות</h2>
          <div className={styles.summarySection}>
            <h3>פעילויות שבוצעו:</h3>
            <p>{mockAISummary.activities}</p>
          </div>
          <div className={styles.summarySection}>
            <h3>תגובת המטופל ושיתוף פעולה:</h3>
            <p>{mockAISummary.response}</p>
          </div>
          <div className={styles.summarySection}>
            <h3>התקדמות בתחומים שונים:</h3>
            <p>{mockAISummary.progress}</p>
          </div>
          <div className={styles.summarySection}>
            <h3>המלצות לטיפול הבא:</h3>
            <p>{mockAISummary.recommendations}</p>
          </div>
          <label htmlFor="editableSummaryArea" className="visually-hidden">ערוך סיכום</label>
          <textarea
            id="editableSummaryArea"
            className={styles.textArea}
            value={editableSummary}
            onChange={(e) => setEditableSummary(e.target.value)}
            rows={10}
            aria-label="אזור עריכת סיכום AI"
            placeholder="סיכום הטיפול והמלצות..."
          />
          <h3 style={{marginTop: '1.5rem'}}>הצעות למטרות חדשות (AI)</h3>
          <ul className={styles.suggestedGoalsList} aria-label="רשימת מטרות מוצעות">
            {mockSuggestedGoals.map((goal, index) => ( <li key={index}>{goal}</li> ))}
          </ul>
        </section>
      </div>

      <footer className={styles.bottomActions}>
        <button onClick={handleSaveSummary} className={`${styles.actionButton} ${styles.saveSummary}`} data-tooltip="שמור את הסיכום הערוך והתמלול">
          {/* <FaSave /> */} שמור סיכום
        </button>
        {pdfReady && patient ? (
          <PDFDownloadLink 
            document={<MyPdfDocument />} 
            fileName={`summary_${patient.id}_${treatmentDate.toISOString().split('T')[0]}.pdf`}
            className={`${styles.actionButton} ${styles.exportPdf}`}
            data-tooltip="הורד את הסיכום כקובץ PDF"
          >
            {({ loading }) => (loading ? 'מכין PDF...' : /* <FaFilePdf /> */  'ייצא לPDF')}
          </PDFDownloadLink>
        ) : (
          <button className={`${styles.actionButton} ${styles.exportPdf} ${styles.disabled}`} disabled data-tooltip="הכנת PDF או מטופל לא נטען">
            {/* <FaFilePdf /> */} {patient ? 'מכין PDF...' : 'ייצא לPDF (לא זמין)'}
          </button>
        )}
        <button onClick={handleReturnToEdit} className={`${styles.actionButton} ${styles.returnToEdit}`} data-tooltip="חזור למסך הטיפול לעריכה נוספת">
          {/* <FaEdit /> */} חזור לעריכה
        </button>
      </footer>
    </div>
  );
};

export default TreatmentSummaryPage;
