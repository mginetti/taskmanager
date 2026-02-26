import { Bell, LogOut } from 'lucide-react';
import type { User } from '@taskmanager/shared';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  return (
    <header className="top-header">
      <div className="header-left">
        <h1>Project Dashboard</h1>
        <span className="badge-on-track">ON TRACK</span>
      </div>
      <div className="header-right">
        <button className="icon-btn bell-btn">
          <Bell size={20} />
          <div className="dot-red"></div>
        </button>
        <div className="divider-v"></div>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.id}&backgroundColor=ffd5dc`}
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
