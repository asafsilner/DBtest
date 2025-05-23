import React, { ReactNode } from 'react';
import Header from '../Header/Header';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      {/* Footer could be added here later if needed */}
    </div>
  );
};

export default Layout;
