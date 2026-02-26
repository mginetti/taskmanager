import { LayoutGrid, ClipboardList, Calendar, Settings, FolderKanban } from 'lucide-react';

import { User, UserRole } from '@taskmanager/shared';

interface SidebarProps {
  activePage: 'BOARD_VIEW' | 'TASKS' | 'GANTT' | 'PROJECTS' | 'SETTINGS';
  setActivePage: (page: 'BOARD_VIEW' | 'TASKS' | 'GANTT' | 'PROJECTS' | 'SETTINGS') => void;
  currentUser: User;
}

export function Sidebar({ activePage, setActivePage, currentUser }: SidebarProps) {
  return (
    <aside className="left-sidebar">
      <div className="logo">
        <div className="logo-icon">
          <LayoutGrid size={20} color="white" />
        </div>
        <h2>TaskManager</h2>
      </div>

      <nav className="nav-menu">
        <ul>
          <li className={activePage === 'BOARD_VIEW' ? 'active' : ''} onClick={() => setActivePage('BOARD_VIEW')}>
            <LayoutGrid size={18} />
            <span>Board View</span>
          </li>
          <li className={activePage === 'TASKS' ? 'active' : ''} onClick={() => setActivePage('TASKS')}>
            <ClipboardList size={18} />
            <span>Tasks</span>
          </li>
          <li className={activePage === 'GANTT' ? 'active' : ''} onClick={() => setActivePage('GANTT')}>
            <Calendar size={18} />
            <span>Gantt Chart</span>
          </li>
          {currentUser.role !== UserRole.USER && (
            <>
              <li className={activePage === 'PROJECTS' ? 'active' : ''} onClick={() => setActivePage('PROJECTS')}>
                <FolderKanban size={18} />
                <span>Projects</span>
              </li>
              <li className={activePage === 'SETTINGS' ? 'active' : ''} style={{ marginTop: '20px' }} onClick={() => setActivePage('SETTINGS')}>
                <Settings size={18} />
                <span>Settings</span>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
