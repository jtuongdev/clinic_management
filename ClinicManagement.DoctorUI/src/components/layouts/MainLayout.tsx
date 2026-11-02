import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/Header';
import ContextBar from '../../shared/components/ContextBar';

const MainLayout: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <ContextBar />
      <main className="workspace">
        <div className="workspace-grid">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;