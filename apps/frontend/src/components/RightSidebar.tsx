import { PenTool, CheckCircle2 } from 'lucide-react';
import { Task, User, TaskStatus } from '@taskmanager/shared';

interface RightSidebarProps {
  tasks: Task[];
  users: User[];
}

export function RightSidebar({ tasks, users }: RightSidebarProps) {
  // Get 3 most recently updated tasks
  const recentActivity = [...tasks]
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    })
    .slice(0, 3);

  const getRelativeTime = (dateStr: Date | string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return 'Unknown User';
    const user = users.find(u => u.id === userId);
    return user ? user.firstName : 'Unknown';
  };

  return (
    <aside className="right-sidebar">
      <h3 className="sidebar-title">Recent Activity</h3>
      
      <div className="activity-list">
        {recentActivity.length === 0 ? (
          <p className="no-tasks" style={{color: 'var(--text-muted)'}}>Nessuna attività recente</p>
        ) : (
          recentActivity.map(task => {
            const isCompleted = task.status === TaskStatus.COMPLETATO;
            const iconClass = isCompleted ? 'success' : 'info';
            const statusLabel = isCompleted ? 'completed' : 'updated';
            
            return (
              <div className="activity-item" key={task.id}>
                <div className={`activity-icon ${iconClass}`}>
                  {isCompleted ? <CheckCircle2 size={14} /> : <PenTool size={14} />}
                </div>
                <div className="activity-content">
                  <p><strong>{getUserName(task.updatedByUserId || task.assignedToUserId)}</strong> {statusLabel} <strong>{task.title}</strong></p>
                  <span className="time">{getRelativeTime(task.updatedAt || task.createdAt)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="progress-widget">
        <div className="widget-header">
          <h4>Task Progress</h4>
          <span className="percentage">82%</span>
        </div>
        
        <div className="chart-bar-area">
          <div className="chart-bar" style={{ height: '40%' }}></div>
          <div className="chart-bar" style={{ height: '60%' }}></div>
          <div className="chart-bar primary" style={{ height: '80%' }}></div>
          <div className="chart-bar" style={{ height: '50%' }}></div>
          <div className="chart-bar" style={{ height: '30%' }}></div>
          <div className="chart-bar" style={{ height: '70%' }}></div>
          <div className="chart-bar primary" style={{ height: '90%' }}></div>
        </div>

        <div className="widget-stats">
          <div className="stat">
            <strong>24</strong>
            <span>DONE</span>
          </div>
          <div className="stat">
            <strong>8</strong>
            <span>IN DEV</span>
          </div>
          <div className="stat">
            <strong>12</strong>
            <span>BACKLOG</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
