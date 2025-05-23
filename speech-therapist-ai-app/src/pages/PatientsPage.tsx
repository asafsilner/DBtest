import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { getPatients } from '../services/patientService';
import { Patient } from '../types/patient.types';
import styles from './PatientsPage.module.css'; 

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // For navigation on card click

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        const fetchedPatients = await getPatients();
        setPatients(fetchedPatients);
        setError('');
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError('אירעה שגיאה בטעינת רשימת המטופלים. אנא נסה לרענן את הדף.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleSelectPatient = (patientId: string) => {
    // Navigate to a patient detail page (not yet implemented) or start new treatment
    navigate(`/treatment/new/${patientId}`);
    console.log(`Selected patient ID: ${patientId}. Navigating...`);
  };

  if (loading) {
    return <div className={styles.loadingMessage}>טוען רשימת מטופלים...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>ניהול מטופלים</h1>
        <Link to="/patients/add" className={styles.addButton} data-tooltip="הוסף מטופל חדש למערכת">
          {/* Add icon placeholder if you have one, e.g., <FaPlus /> */}
          הוסף מטופל חדש
        </Link>
      </header>

      {patients.length === 0 ? (
        <p className={styles.noPatientsMessage}>
          לא קיימים מטופלים במערכת. <Link to="/patients/add" data-tooltip="התחל בהוספת המטופל הראשון שלך">הוסף מטופל ראשון</Link>.
        </p>
      ) : (
        <div className={styles.patientsGrid} role="list" aria-label="רשימת מטופלים">
          {patients.map((patient) => (
            <article 
              key={patient.id} 
              className={styles.patientCard} 
              data-tooltip={`פרטי מטופל: ${patient.name}`}
              aria-labelledby={`patient-name-${patient.id}`}
              tabIndex={0} /* Make card focusable */
              onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectPatient(patient.id)}
              onClick={() => handleSelectPatient(patient.id)} /* Make whole card clickable */
            >
              <div className={styles.cardHeader}>
                <div className={styles.avatarPlaceholder} aria-hidden="true">
                  {patient.name.substring(0, 1)}
                </div>
                <div className={styles.patientInfo}>
                  <h2 id={`patient-name-${patient.id}`}>{patient.name}</h2>
                  <p><strong>גיל:</strong> {patient.age}</p>
                  <p><strong>אבחנה:</strong> {patient.diagnosis}</p>
                </div>
              </div>
              
              <p><strong>מספר טיפולים:</strong> 0 (יעודכן)</p>
              <p><strong>טיפול אחרון:</strong> לא נקבע</p>
              <p><strong>תאריך תחילת טיפול:</strong> {new Date(patient.treatmentStartDate).toLocaleDateString('he-IL')}</p>
              
              {patient.notes && (
                <div className={styles.notes} data-tooltip={`הערות: ${patient.notes}`}>
                  <strong>הערות:</strong> {patient.notes.length > 50 ? `${patient.notes.substring(0, 50)}...` : patient.notes}
                </div>
              )}
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleSelectPatient(patient.id); }} /* Prevent double navigation if card is also clicked */
                className={styles.selectButton} 
                data-tooltip={`התחל טיפול חדש עם ${patient.name}`}
                aria-label={`התחל טיפול חדש עם ${patient.name}`}
              >
                בחר מטופל
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
