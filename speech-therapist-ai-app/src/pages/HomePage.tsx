import React from 'react';
import styles from './HomePage.module.css'; // Import CSS module
// import { FaUserFriends, FaCalendarAlt, FaFileAlt, FaBell, FaUserClock } from 'react-icons/fa'; // Example for future icons

const HomePage: React.FC = () => {
  // Placeholder for icon, replace with actual icon component if available
  const CardIcon = ({ iconName, className }: { iconName: string, className?: string }) => (
    <span className={`${styles.cardIcon} ${className || ''}`} aria-hidden="true">
      {/* Using simple text as placeholder for icons */}
      {iconName === 'patients' && '👥'}
      {iconName === 'treatments' && '📅'}
      {iconName === 'reports' && '📄'}
    </span>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainContent}>
        {/* Main Cards */}
        <div className={styles.cardsContainer}>
          <div className={styles.card} data-tooltip="צפה ונהל מטופלים פעילים">
            <div className={styles.cardHeader}>
              <CardIcon iconName="patients" />
              <h3>מטופלים</h3>
            </div>
            <p>15</p>
            <span className={styles.cardDescription}>מטופלים פעילים</span>
          </div>
          <div className={styles.card} data-tooltip="צפה בלוח הטיפולים השבועי">
            <div className={styles.cardHeader}>
              <CardIcon iconName="treatments" />
              <h3>טיפולים השבוע</h3>
            </div>
            <p>5</p>
            <span className={styles.cardDescription}>טיפולים מתוכננים</span>
          </div>
          <div className={styles.card} data-tooltip="הכן והגש דוחות ממתינים">
            <div className={styles.cardHeader}>
              <CardIcon iconName="reports" />
              <h3>דוחות בהמתנה</h3>
            </div>
            <p>2</p>
            <span className={styles.cardDescription}>דוחות להכנה</span>
          </div>
        </div>

        {/* Announcements Board */}
        <section className={styles.announcementsBoard} aria-labelledby="announcements-title">
          <h2 id="announcements-title">לוח מודעות מהיר</h2>
          <ul>
            <li>עדכון גרסה 2.1 זמין למערכת. <span data-tooltip="פרטים נוספים על עדכון הגרסה">קרא עוד...</span></li>
            <li>טיפ השבוע: הקפידו על תרגילי נשימה לפני כל טיפול.</li>
            <li>סדנת העשרה בנושא גמגום תתקיים ב-15 לחודש. <span data-tooltip="להרשמה ופרטים נוספים">פרטים</span></li>
          </ul>
        </section>
      </div>

      {/* Sidebar */}
      <aside className={styles.sidebar} aria-labelledby="quick-nav-title">
        <h2 id="quick-nav-title">ניווט מהיר למטופלים אחרונים</h2>
        <ul>
          {/* In a real app, these would be NavLinks or similar */}
          <li data-tooltip="פתח את תיק המטופל של יוסי כהן">יוסי כהן</li>
          <li data-tooltip="פתח את תיק המטופל של שרה לוי">שרה לוי</li>
          <li data-tooltip="פתח את תיק המטופל של דניאל שמש">דניאל שמש</li>
          <li data-tooltip="פתח את תיק המטופל של אביגיל רז">אביגיל רז</li>
        </ul>
      </aside>
    </div>
  );
};

export default HomePage;
