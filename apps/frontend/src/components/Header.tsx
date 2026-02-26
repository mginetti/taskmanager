import { useState, useEffect } from 'react';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import type { User } from '@taskmanager/shared';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onNavigateProfile: () => void;
}

export function Header({ currentUser, onLogout, onNavigateProfile }: HeaderProps) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="top-header">
      <div className="header-left">
        <h1>Project Dashboard</h1>
        <span className="badge-on-track">ON TRACK</span>
      </div>
      <div className="header-right">
        <button 
          className="icon-btn theme-btn" 
          onClick={() => setIsDark(!isDark)} 
          title="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn bell-btn">
          <Bell size={20} />
          <div className="dot-red"></div>
        </button>
        <div className="divider-v"></div>
        <div className="user-profile" onClick={onNavigateProfile} title="Profile">
          <div className="user-info">
            <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
          <img
            src={`https://api.dicebear.com/9.x/bottts/svg?seed=${currentUser.id}&backgroundColor=ffd5dc`}
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            className="avatar"
          />
        </div>
        <button className="icon-btn logout-btn" onClick={onLogout} title="Logout" style={{ marginLeft: '12px' }}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
