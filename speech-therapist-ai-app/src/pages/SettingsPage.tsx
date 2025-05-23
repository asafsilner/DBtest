import React, { useState } from 'react';
import styles from './SettingsPage.module.css';
// import { FaLanguage, FaCog, FaFileExport, FaFileImport, FaUserShield } from 'react-icons/fa'; // Example Icons

const SettingsPage: React.FC = () => {
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const [recordingQuality, setRecordingQuality] = useState<'standard' | 'high'>('standard');
  const [fileCompression, setFileCompression] = useState<boolean>(true);
  const [defaultParentTemplate, setDefaultParentTemplate] = useState<string>('templateA');
  const [anonymizationForReports, setAnonymizationForReports] = useState<boolean>(false);
  const [lastBackupDate] = useState<string>(new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }));
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(''), 3000); // Clear message after 3 seconds
  };

  const handleLanguageChange = (lang: 'he' | 'en') => {
    setLanguage(lang);
    showFeedback(`שפת הממשק שונתה ל: ${lang === 'he' ? 'עברית' : 'English'}`);
  };

  const handleSettingChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any, message: string) => {
    setter(value);
    showFeedback(message);
  };

  const handleExportData = () => showFeedback("ייצוא נתונים החל (הדמיה בלבד).");
  const handleImportData = () => showFeedback("טעינת קובץ לייבוא נתונים (הדמיה בלבד).");

  return (
    <div className={styles.pageContainer}>
      <h1>הגדרות ופרטיות</h1>
      {feedbackMessage && <div className={styles.feedbackMessage} role="status" aria-live="polite">{feedbackMessage}</div>}

      <section className={styles.section} aria-labelledby="system-settings-heading">
        <h2 id="system-settings-heading">הגדרות מערכת</h2>
        <div className={styles.settingItem}>
          <h3>שפת ממשק</h3>
          <div className={styles.languageToggle} role="radiogroup" aria-labelledby="language-label">
            <span id="language-label" className="visually-hidden">בחר שפת ממשק</span>
            <button
              className={language === 'he' ? styles.active : ''}
              onClick={() => handleLanguageChange('he')}
              data-tooltip="שנה שפה לעברית"
              role="radio"
              aria-checked={language === 'he'}
            >
              עברית
            </button>
            <button
              className={language === 'en' ? styles.active : ''}
              onClick={() => handleLanguageChange('en')}
              data-tooltip="Change language to English"
              role="radio"
              aria-checked={language === 'en'}
            >
              English
            </button>
          </div>
          <p className={styles.descriptionText}>בחר את שפת התצוגה של המערכת.</p>
        </div>

        <div className={styles.settingItem}>
          <h3>תצורת הקלטה (מדומה)</h3>
          <div className={styles.formGroup}>
            <label htmlFor="recordingQuality">איכות הקלטה:</label>
            <select 
              id="recordingQuality" 
              value={recordingQuality} 
              onChange={(e) => handleSettingChange(setRecordingQuality, e.target.value, `איכות הקלטה שונתה ל: ${e.target.options[e.target.selectedIndex].text}`)}
              data-tooltip="קבע את איכות השמע של ההקלטות"
            >
              <option value="standard">רגילה (קובץ קטן יותר)</option>
              <option value="high">גבוהה (איכות שמע טובה יותר)</option>
            </select>
          </div>
          <div className={`${styles.formGroup} ${styles.checkboxContainer}`}>
            <input
              type="checkbox"
              id="fileCompression"
              checked={fileCompression}
              onChange={(e) => handleSettingChange(setFileCompression, e.target.checked, `דחיסת קבצים ${e.target.checked ? 'אופשרה' : 'בוטלה'}`)}
            />
            <label htmlFor="fileCompression" className={styles.checkboxLabel} data-tooltip="דחיסת קבצי הקלטה תחסוך מקום אחסון">אפשר דחיסת קבצי הקלטה</label>
          </div>
          <p className={styles.descriptionText}>קבע את איכות ההקלטה והאם לדחוס קבצים כדי לחסוך מקום.</p>
        </div>

        <div className={styles.settingItem}>
          <h3>תבניות דוחות (מדומה)</h3>
          <div className={styles.formGroup}>
            <label htmlFor="defaultParentTemplate">תבנית דוח הורים ברירת מחדל:</label>
            <select 
              id="defaultParentTemplate" 
              value={defaultParentTemplate} 
              onChange={(e) => handleSettingChange(setDefaultParentTemplate, e.target.value, `תבנית דוח הורים שונתה ל: ${e.target.options[e.target.selectedIndex].text}`)}
              data-tooltip="בחר את התבנית שתשמש כברירת מחדל לדוחות הורים"
            >
              <option value="templateA">תבנית א' (מקיפה)</option>
              <option value="templateB">תבנית ב' (תמציתית)</option>
              <option value="templateC">תבנית ג' (גרפית)</option>
            </select>
          </div>
          <p className={styles.descriptionText}>בחר את תבנית ברירת המחדל שתשמש ליצירת דוחות עבור הורים.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="backup-restore-heading">
        <h2 id="backup-restore-heading">גיבוי ושחזור</h2>
        <div className={styles.settingItem}>
          <h3>גיבוי אוטומטי מקומי</h3>
          <p>גיבוי אוטומטי מקומי מופעל. המערכת מבצעת גיבוי של הנתונים באופן אוטומטי פעם ביום.</p>
          <p data-tooltip="תאריך ושעת הגיבוי האחרון שבוצע"><strong>גיבוי אחרון:</strong> {lastBackupDate}</p>
        </div>
        <div className={styles.settingItem}>
          <h3>יצוא/יבוא נתונים</h3>
          <div className={styles.actionButtonsContainer}>
            <button onClick={handleExportData} className={`${styles.actionButton} ${styles.primary}`} data-tooltip="ייצא את כל נתוני המערכת לקובץ גיבוי">
              {/* <FaFileExport /> */} ייצא נתונים
            </button>
            <button onClick={handleImportData} className={`${styles.actionButton} ${styles.secondary}`} data-tooltip="ייבא נתונים מקובץ גיבוי קיים (זהירות, פעולה זו עשויה לדרוס נתונים קיימים)">
              {/* <FaFileImport /> */} ייבא נתונים
            </button>
          </div>
          <p className={styles.descriptionText}>אפשרות לייצא את כל נתוני המערכת לקובץ, או לייבא נתונים מקובץ גיבוי.</p>
        </div>
        <div className={styles.settingItem}>
          <h3>הצפנת מידע (רעיוני)</h3>
          <p className={styles.descriptionText}>המידע הרגיש במערכת (כגון פרטי מטופלים והקלטות) מוצפן באופן מקומי כדי להבטיח את פרטיותו.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="privacy-settings-heading">
        <h2 id="privacy-settings-heading">הגדרות פרטיות</h2>
        <div className={styles.settingItem}>
          <h3>מדיניות שמירת נתונים</h3>
          <p className={styles.descriptionText}>נתונים נשמרים מקומית על מחשב זה בלבד. המערכת אינה מעלה נתונים לענן ללא הסכמה מפורשת. באחריות המשתמש לגבות את הנתונים באופן קבוע.</p>
        </div>
        <div className={styles.settingItem}>
          <h3>הרשאות גישה (רעיוני)</h3>
          <p className={styles.descriptionText}>כרגע אין תמיכה במשתמשים מרובים או הרשאות גישה מורכבות. כל הנתונים המאוחסנים במערכת נגישים למשתמש הנוכחי במחשב זה.</p>
        </div>
        <div className={styles.settingItem}>
          <h3>הגדרות אנונימיזציה (רעיוני)</h3>
          <div className={`${styles.formGroup} ${styles.checkboxContainer}`}>
            <input
              type="checkbox"
              id="anonymizationForReports"
              checked={anonymizationForReports}
              onChange={(e) => handleSettingChange(setAnonymizationForReports, e.target.checked, `מצב אנונימיזציה לדוחות ${e.target.checked ? 'אופשר' : 'בוטל'}`)}
            />
            <label htmlFor="anonymizationForReports" className={styles.checkboxLabel} data-tooltip="במצב זה, דוחות שיופקו לא יכללו פרטים מזהים של מטופלים">אפשר מצב אנונימיזציה לדוחות</label>
          </div>
          <p className={styles.descriptionText}>במצב זה, דוחות שיופקו לא יכללו פרטים מזהים של מטופלים, לצרכי מחקר או שיתוף.</p>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
