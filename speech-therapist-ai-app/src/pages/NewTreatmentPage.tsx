import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById } from '../services/patientService';
import { Patient } from '../types/patient.types';
import styles from './NewTreatmentPage.module.css';
// import { FaPlayCircle, FaStopCircle, FaMicrophoneAlt, FaRegSave, FaTimesCircle, FaFileAlt } from 'react-icons/fa'; // Example icons

interface TranscriptLine {
  id: string;
  speaker: 'קלינאית' | 'מטופל';
  text: string;
  timestamp: string;
}

interface Goal {
  id: string;
  text: string;
  achieved: boolean;
}

const MOCK_INITIAL_GOALS: Goal[] = [
  { id: 'goal1', text: 'שיפור הבעה מילולית במשפטים של 3-4 מילים', achieved: false },
  { id: 'goal2', text: 'הפקת צליל /ש/ באופן עקבי במילים בודדות', achieved: false },
  { id: 'goal3', text: 'מענה על שאלות "מי", "מה", "איפה" בהקשר לסיפור קצר', achieved: false },
  { id: 'goal4', text: 'שיפור יכולת המתנה בתור במשחק קבוצתי', achieved: true },
  { id: 'goal5', text: 'הרחבת אוצר מילים בנושא כלי תחבורה', achieved: false },
];

const NewTreatmentPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(''); // For user feedback

  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0); // 0-100
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const mockTranscriptTextsPatient = ["כן.", "אני רוצה כדור.", "אדום.", "לא יודע.", "זה גדול.", "תודה."];
  const mockTranscriptTextsTherapist = ["שלום, מה שלומך היום?", "איזה צבע הכדור הזה?", "יפה מאוד!", "בוא ננסה עוד משהו.", "מה אתה רואה בתמונה?", "כל הכבוד!"];
  let transcriptCounter = 0;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoadingPatient(true);
      try {
        const idToFetch = patientId || '1'; // Default to patient '1'
        const fetchedPatient = await getPatientById(idToFetch);
        if (fetchedPatient) {
          setPatient(fetchedPatient);
          // Set patient-specific goals or default if none
          // For now, using MOCK_INITIAL_GOALS for any patient
          setGoals(MOCK_INITIAL_GOALS); 
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (transcriptTimerRef.current) clearInterval(transcriptTimerRef.current);
    };
  }, [patientId, navigate]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setElapsedTime(0);
    setRecordingProgress(0);
    setTranscripts([]);
    transcriptCounter = 0;
    setFeedbackMessage('ההקלטה החלה...');

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setRecordingProgress(prev => Math.min(prev + (100 / 120), 100)); // Simulate 2 min max
    }, 1000);

    transcriptTimerRef.current = setInterval(() => {
      const speaker: 'קלינאית' | 'מטופל' = transcriptCounter % 2 === 0 ? 'קלינאית' : 'מטופל';
      const textPool = speaker === 'קלינאית' ? mockTranscriptTextsTherapist : mockTranscriptTextsPatient;
      const randomText = textPool[Math.floor(Math.random() * textPool.length)];
      setTranscripts(prev => [
        { id: `t-${Date.now()}-${prev.length}`, speaker, text: randomText, timestamp: `[${formatTime(elapsedTime)}]` },
        ...prev, // Add new transcripts to the top for column-reverse display
      ]);
      transcriptCounter++;
    }, 4000); // Slower mock transcription
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (transcriptTimerRef.current) clearInterval(transcriptTimerRef.current);
    setFeedbackMessage('ההקלטה הסתיימה. מתמלל...');
    setTimeout(() => setFeedbackMessage('התמלול הושלם (מדומה).'), 1500);
  };

  const handleGoalToggle = (goalId: string) => {
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, achieved: !goal.achieved } : goal
      )
    );
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim() === '') return;
    const newGoal: Goal = { id: `goal-${Date.now()}`, text: newGoalText.trim(), achieved: false };
    setGoals(prevGoals => [...prevGoals, newGoal]);
    setNewGoalText('');
  };

  const handleCreateSummary = () => {
    setFeedbackMessage('יוצר סיכום טיפול...');
    console.log("Create Treatment Summary: Patient:", patient, "Transcripts:", transcripts, "Goals:", goals);
    // In a real app, navigate to summary page with state or save and then navigate
    setTimeout(() => {
        setFeedbackMessage('סיכום הטיפול נוצר (מדומה).');
        navigate(`/treatment/summary/${patient?.id || '1'}`); // Navigate to summary page
    }, 1500);
  };

  const handleSaveNoSummary = () => {
    setFeedbackMessage('שומר טיפול ללא סיכום...');
    console.log("Save Without Summary: Patient:", patient, "Transcripts:", transcripts, "Goals:", goals);
    setTimeout(() => {
        setFeedbackMessage('הטיפול נשמר בהצלחה (ללא סיכום).');
        navigate('/patients');
    }, 1500);
  };

  const handleCancelTreatment = () => {
    if (window.confirm('האם אתה בטוח שברצונך לבטל את הטיפול? שינויים לא יישמרו.')) {
      setFeedbackMessage('הטיפול בוטל.');
      navigate(-1);
    }
  };

  if (loadingPatient) {
    return <div className={styles.pageContainer}><p className={styles.transcriptPlaceholder}>טוען נתוני מטופל...</p></div>;
  }
  if (!patient) {
    return <div className={styles.pageContainer}><p className={styles.errorMessage || styles.transcriptPlaceholder}>{feedbackMessage || 'שגיאה: לא נטען מטופל.'}</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {feedbackMessage && <div className={styles.feedbackMessage} aria-live="polite">{feedbackMessage}</div>} {/* Simple feedback display */}
      <header className={styles.patientHeader}>
        <h1>טיפול עם: {patient.name}</h1>
        <p data-tooltip={`גיל: ${patient.age}, אבחנה: ${patient.diagnosis}`}>
            גיל: {patient.age} | אבחנה: {patient.diagnosis}
        </p>
      </header>

      <div className={styles.mainLayout}>
        <section className={styles.centerContent} aria-labelledby="treatment-main-area">
          <h2 id="treatment-main-area" className="visually-hidden">אזור הקלטה ותמלול</h2>
          <div className={styles.recordingArea} aria-labelledby="recording-title">
            <h2 id="recording-title">הקלטת טיפול</h2>
            <div className={styles.timeIndicator} aria-label="זמן הקלטה">{formatTime(elapsedTime)}</div>
            <div className={styles.progressBarContainer} role="progressbar" aria-valuenow={recordingProgress} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progressBar} style={{ width: `${recordingProgress}%` }}></div>
            </div>
            <div className={styles.recordButtonContainer}>
              {!isRecording ? (
                <button onClick={handleStartRecording} className={`${styles.recordButton} ${styles.startRecording}`} data-tooltip="התחל הקלטה חדשה">
                  {/* <FaPlayCircle />  */}
                  התחל הקלטה
                </button>
              ) : (
                <button onClick={handleStopRecording} className={`${styles.recordButton} ${styles.stopRecording}`} data-tooltip="עצור את ההקלטה הנוכחית">
                  {/* <FaStopCircle /> */}
                   עצור הקלטה
                </button>
              )}
              {isRecording && (
                <button disabled className={`${styles.recordButton} ${styles.startRecording} ${styles.recording}`} aria-live="polite">
                  {/* <FaMicrophoneAlt />  */}
                  מקליט...
                </button>
              )}
            </div>
          </div>

          <div className={styles.transcriptionArea} aria-labelledby="transcription-title">
            <h2 id="transcription-title">תמלול בזמן אמת (מדומה)</h2>
            {transcripts.length === 0 ? (
                <p className={styles.transcriptPlaceholder}>
                    {isRecording ? 'ממתין לתמלול...' : 'התמלול יופיע כאן לאחר תחילת ההקלטה.'}
                </p>
            ) : (
                <ul className={styles.transcriptionList}>
                {transcripts.map((line) => (
                    <li key={line.id} className={styles.transcriptItem}>
                    <span className={line.speaker === 'מטופל' ? styles.transcriptSpeakerPatient : styles.transcriptSpeakerTherapist}>
                        {line.speaker}:
                    </span>
                    <span className={styles.transcriptText}> {line.text}</span>
                    <span className={styles.transcriptTimestamp}>{line.timestamp}</span>
                    </li>
                ))}
                </ul>
            )}
          </div>
        </section>

        <aside className={styles.sidebar} aria-labelledby="goals-title">
          <h2 id="goals-title">מטרות הטיפול הנוכחיות</h2>
          <ul className={styles.goalsList}>
            {goals.map((goal) => (
              <li key={goal.id} className={styles.goalItem}>
                <input
                  type="checkbox"
                  id={`goal-${goal.id}`}
                  checked={goal.achieved}
                  onChange={() => handleGoalToggle(goal.id)}
                  aria-labelledby={`goal-label-${goal.id}`}
                />
                <label htmlFor={`goal-${goal.id}`} id={`goal-label-${goal.id}`} className={goal.achieved ? styles.achieved : ''} data-tooltip={goal.achieved ? 'סמן כמטרה שלא הושגה' : 'סמן כמטרה שהושגה'}>
                  {goal.text}
                </label>
              </li>
            ))}
             {goals.length === 0 && <li>לא הוגדרו מטרות עדיין.</li>}
          </ul>
          <form onSubmit={handleAddGoal} className={styles.addGoalContainer}>
            <label htmlFor="newGoalText" className="visually-hidden">הוסף מטרה חדשה</label>
            <input
              type="text"
              id="newGoalText"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="הקלד מטרה חדשה..."
              aria-label="הוסף מטרה חדשה"
            />
            <button type="submit" data-tooltip="הוסף מטרה לרשימה">הוסף</button>
          </form>
        </aside>
      </div>

      <footer className={styles.bottomActions}>
        <button onClick={handleCreateSummary} className={`${styles.actionButton} ${styles.createSummary}`} data-tooltip="עבור לדף סיכום הטיפול (כולל תמלול ומטרות)">
          {/* <FaFileAlt />  */}
          צור סיכום טיפול
        </button>
        <button onClick={handleSaveNoSummary} className={`${styles.actionButton} ${styles.saveNoSummary}`} data-tooltip="שמור את נתוני הטיפול ללא יצירת סיכום מפורט">
          {/* <FaRegSave />  */}
          שמור ללא סיכום
        </button>
        <button onClick={handleCancelTreatment} className={`${styles.actionButton} ${styles.cancelTreatment}`} data-tooltip="בטל את הטיפול הנוכחי, שינויים לא יישמרו">
          {/* <FaTimesCircle />  */}
          בטל טיפול
        </button>
      </footer>
    </div>
  );
};

export default NewTreatmentPage;
