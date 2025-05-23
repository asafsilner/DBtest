import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import { getTreatmentHistory } from '../services/mockTreatmentData';
import { getPatients } from '../services/patientService'; 
import { TreatmentSession } from '../types/treatment.types';
import { Patient } from '../types/patient.types';
import styles from './TreatmentHistoryPage.module.css';

const TreatmentHistoryPage: React.FC = () => {
  const [allTreatments, setAllTreatments] = useState<TreatmentSession[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<TreatmentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const [treatments, fetchedPatients] = await Promise.all([
          getTreatmentHistory(),
          getPatients()
        ]);
        
        const treatmentsWithNames = treatments.map(treatment => {
          const patient = fetchedPatients.find(p => p.id === treatment.patientId);
          return { ...treatment, patientName: patient ? patient.name : 'לא ידוע' };
        });

        setAllTreatments(treatmentsWithNames);
        setFilteredTreatments(treatmentsWithNames); 
        setPatients(fetchedPatients);
      } catch (err) {
        console.error("Error loading treatment history or patients:", err);
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה לרענן את הדף.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleFilterChange = () => {
    let tempFiltered = [...allTreatments];
    if (selectedPatientId) {
      tempFiltered = tempFiltered.filter(session => session.patientId === selectedPatientId);
    }
    if (keyword.trim() !== '') {
      const lowerKeyword = keyword.toLowerCase();
      tempFiltered = tempFiltered.filter(session =>
        session.summaryShort.toLowerCase().includes(lowerKeyword) ||
        (session.patientName && session.patientName.toLowerCase().includes(lowerKeyword))
      );
    }
    if (fromDate) {
      tempFiltered = tempFiltered.filter(session => new Date(session.date) >= new Date(fromDate));
    }
    if (toDate) {
      tempFiltered = tempFiltered.filter(session => new Date(session.date) <= new Date(toDate));
    }
    if (statusFilter) {
      tempFiltered = tempFiltered.filter(session => session.status === statusFilter);
    }
    setFilteredTreatments(tempFiltered);
  };
  
  useMemo(handleFilterChange, [selectedPatientId, keyword, fromDate, toDate, statusFilter, allTreatments]);

  const resetFilters = () => {
    setSelectedPatientId('');
    setKeyword('');
    setFromDate('');
    setToDate('');
    setStatusFilter('');
    // setFilteredTreatments(allTreatments); // This will be handled by useMemo
  };

  const handleExpandTreatment = (session: TreatmentSession) => { // Changed to accept session object
    console.log(`Expand treatment ID: ${session.id}`, session);
    // Navigate to TreatmentSummaryPage if session is completed or draft
    if (session.status === 'הושלם' || session.status === 'טיוטה') {
      navigate(`/treatment/summary/${session.patientId}?treatmentId=${session.id}`); // Pass treatmentId if needed by summary page
    } else {
      alert(`טיפול זה (${session.status}) אינו ניתן לצפייה מפורטת כרגע.`);
    }
  };

  if (loading) {
    return <div className={styles.pageContainer}><h1 className={styles.loadingMessage || ''}>טוען היסטוריית טיפולים...</h1></div>;
  }
  if (error) {
    return <div className={styles.pageContainer}><p className={styles.errorMessage}>{error}</p></div>;
  }

  // Determine the correct class for the status pill dynamically
  const getStatusPillClass = (status: TreatmentSession['status']) => {
    switch (status) {
      case 'הושלם': return styles.statusCompleted;
      case 'טיוטה': return styles.statusDraft;
      case 'בוטל': return styles.statusCancelled;
      default: return '';
    }
  };


  return (
    <div className={styles.pageContainer}>
      <h1>היסטוריית טיפולים</h1>
      <section className={styles.filterControls} aria-labelledby="filter-heading">
        <h2 id="filter-heading" className="visually-hidden">אפשרויות סינון</h2>
        <div className={styles.filterGroup}>
          <label htmlFor="patientFilter">סנן לפי מטופל:</label>
          <select
            id="patientFilter"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            data-tooltip="בחר מטופל להצגת הטיפולים שלו"
          >
            <option value="">כל המטופלים</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="keywordSearch">חיפוש מילת מפתח:</label>
          <input
            type="text"
            id="keywordSearch"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="לדוגמה: צלילים, משחק..."
            data-tooltip="הקלד מילת מפתח לחיפוש בתקצירי הטיפולים"
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="fromDate">מתאריך:</label>
          <input type="date" id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} data-tooltip="הצג טיפולים מתאריך זה ואילך" />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="toDate">עד תאריך:</label>
          <input type="date" id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} data-tooltip="הצג טיפולים עד תאריך זה" />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="statusFilter">סטטוס טיפול:</label>
          <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} data-tooltip="סנן לפי סטטוס הטיפול">
            <option value="">הכל</option>
            <option value="הושלם">הושלם</option>
            <option value="טיוטה">טיוטה</option>
            <option value="בוטל">בוטל</option>
          </select>
        </div>
        <button onClick={resetFilters} className={styles.resetFiltersButton} data-tooltip="נקה את כל אפשרויות הסינון">אפס פילטרים</button>
      </section>

      {filteredTreatments.length > 0 ? (
        <div className={styles.treatmentList} role="list" aria-label="רשימת טיפולים">
          {filteredTreatments.map((session) => (
            <article 
              key={session.id} 
              className={`${styles.treatmentCard} ${getStatusPillClass(session.status)}`} // Apply status class for border
              aria-labelledby={`treatment-patient-${session.id}`}
            >
              <div className={styles.cardHeader}>
                <div>
                  <h2 id={`treatment-patient-${session.id}`} className={styles.patientName}>{session.patientName || `מטופל (${session.patientId})`}</h2>
                  <p className={styles.treatmentDate} data-tooltip={`תאריך ושעת הטיפול: ${new Date(session.date).toLocaleDateString('he-IL')} ${session.time}`}>
                    {new Date(session.date).toLocaleDateString('he-IL')} - {session.time}
                  </p>
                </div>
                <span className={`${styles.statusPill} ${getStatusPillClass(session.status)}`} data-tooltip={`סטטוס: ${session.status}`}>
                  {session.status}
                </span>
              </div>
              <div className={styles.cardContent}>
                <p><strong>משך:</strong> {session.duration}</p>
                <p><strong>תקציר:</strong> {session.summaryShort}</p>
              </div>
              <div className={styles.cardFooter}>
                <button 
                  onClick={() => handleExpandTreatment(session)} 
                  className={styles.expandButton}
                  data-tooltip={`צפה בפרטי טיפול של ${session.patientName}`}
                  aria-label={`צפה בפרטי טיפול של ${session.patientName} מתאריך ${new Date(session.date).toLocaleDateString('he-IL')}`}
                >
                  הרחב
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.noResultsMessage}>לא נמצאו טיפולים התואמים את אפשרויות הסינון שנבחרו.</p>
      )}
    </div>
  );
};

export default TreatmentHistoryPage;
