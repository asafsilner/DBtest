import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPatient } from '../services/patientService';
import { Patient } from '../types/patient.types';
import styles from './AddPatientPage.module.css';

const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [diagnosis, setDiagnosis] = useState<Patient['diagnosis']>('אחר');
  const [treatmentStartDate, setTreatmentStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim() || age === '' || !treatmentStartDate) {
      setError('שם, גיל ותאריך תחילת טיפול הם שדות חובה.');
      return;
    }
    if (Number(age) <= 0) {
      setError('הגיל חייב להיות מספר חיובי.');
      return;
    }

    const newPatientData: Omit<Patient, 'id'> = {
      name: name.trim(),
      age: Number(age),
      diagnosis,
      treatmentStartDate: new Date(treatmentStartDate).toISOString(),
      notes: notes.trim(),
    };

    try {
      await addPatient(newPatientData);
      setSuccessMessage(`המטופל "${newPatientData.name}" נוסף בהצלחה!`);
      setName('');
      setAge('');
      setDiagnosis('אחר');
      setTreatmentStartDate('');
      setNotes('');
      setTimeout(() => {
        setSuccessMessage(''); // Clear success message
        navigate('/patients');
      }, 2000); // Navigate after 2 seconds
    } catch (err) {
      setError('אירעה שגיאה בהוספת המטופל. אנא נסה שוב.');
      console.error(err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>הוספת מטופל חדש</h1>
      <form onSubmit={handleSubmit} className={styles.addPatientForm} aria-labelledby="form-heading">
        <h2 id="form-heading" className="visually-hidden">טופס הוספת מטופל</h2>
        
        {error && <p className={`${styles.errorMessage} ${styles.formGroupFullWidth}`}>{error}</p>}
        {successMessage && <p className={`${styles.successMessage} ${styles.formGroupFullWidth}`}>{successMessage}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="patientName">שם מלא*</label>
          <input
            type="text"
            id="patientName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-describedby="name-desc"
            placeholder="לדוגמה: ישראל ישראלי"
          />
          <small id="name-desc" className="visually-hidden">הזן את שם המטופל המלא</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="patientAge">גיל*</label>
          <input
            type="number"
            id="patientAge"
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            required
            min="0"
            placeholder="לדוגמה: 7"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="patientDiagnosis">אבחנה ראשונית*</label>
          <select
            id="patientDiagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value as Patient['diagnosis'])}
            required
          >
            <option value="הפרעה בספקטרום האוטיסטי">הפרעה בספקטרום האוטיסטי</option>
            <option value="עיכוב שפה">עיכוב שפה</option>
            <option value="הפרעת דיבור">הפרעת דיבור</option>
            <option value="גמגום">גמגום</option>
            <option value="אחר">אחר</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="treatmentStartDate">תאריך תחילת טיפול*</label>
          <input
            type="date"
            id="treatmentStartDate"
            value={treatmentStartDate}
            onChange={(e) => setTreatmentStartDate(e.target.value)}
            required
          />
        </div>

        <div className={`${styles.formGroup} ${styles.formGroupFullWidth}`}>
          <label htmlFor="patientNotes">הערות נוספות (אופציונלי)</label>
          <textarea
            id="patientNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5} /* Increased rows */
            placeholder="לדוגמה: תחומי עניין של המטופל, מידע רלוונטי מההורים..."
          />
        </div>
        
        <div className={styles.actionsContainer}>
            <button type="submit" className={styles.submitButton}>
            הוסף מטופל
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientPage;
