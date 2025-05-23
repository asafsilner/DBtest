import React from 'react';
import { NavLink } from 'react-router-dom'; // Changed from Link to NavLink
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="logo">
        <NavLink to="/" data-tooltip="לדף הבית">SpeechTherapyAI</NavLink>
      </div>
      <nav className="main-nav">
        <ul>
          <li><NavLink to="/" end data-tooltip="סקירה כללית ופעולות מהירות">בית</NavLink></li>
          <li><NavLink to="/patients" data-tooltip="ניהול רשימת מטופלים והוספת מטופל חדש">מטופלים</NavLink></li>
          <li><NavLink to="/treatment/new" data-tooltip="התחל טיפול חדש עם מטופל">טיפול חדש</NavLink></li> {/* Added New Treatment link */}
          <li><NavLink to="/history" data-tooltip="צפייה ועריכה של היסטוריית טיפולים קודמים">היסטוריית טיפולים</NavLink></li>
          <li><NavLink to="/reports" data-tooltip="הפקת דוחות התקדמות וניתוח נתונים">דוחות</NavLink></li>
          <li><NavLink to="/settings" data-tooltip="הגדרות מערכת, פרטיות וגיבוי">הגדרות</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
