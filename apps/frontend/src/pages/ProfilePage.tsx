import { User, Task, TaskStatus } from '@taskmanager/shared';
import { UserCircle, CheckCircle2, Clock, PlayCircle, Archive } from 'lucide-react';
import '../App.css'; // For common styling

interface ProfilePageProps {
  currentUser: User;
  tasks: Task[];
}

export function ProfilePage({ currentUser, tasks }: ProfilePageProps) {
  const userTasks = tasks.filter(t => t.assignedToUserId === currentUser.id);
  const totalTasks = userTasks.length;
  
  const tasksByStatus = userTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completed = tasksByStatus[TaskStatus.COMPLETATO] || 0;
  const inProgress = tasksByStatus[TaskStatus.IN_SVILUPPO] || tasksByStatus[TaskStatus.IN_DEV] || 0;
  const paused = tasksByStatus[TaskStatus.IN_PAUSA] || 0;
  const todo = tasksByStatus[TaskStatus.DA_FARE] || 0;

  const getPercentage = (count: number) => {
    if (totalTasks === 0) return 0;
    return Math.round((count / totalTasks) * 100);
  };

  return (
    <div className="tasks-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="tasks-page-header">
        <div>
          <h2>Il Mio Profilo</h2>
          <p className="tasks-page-subtitle">Statistiche e riepilogo delle tue attività</p>
        </div>
      </div>

      <div className="profile-header-card" style={{
        background: 'var(--sidebar-bg)',
        padding: '30px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        border: '1px solid var(--border-color)',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <img
          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.id}&backgroundColor=ffd5dc`}
          alt={currentUser.firstName}
          style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f1f1' }}
        />
        <div>
          <h3 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{currentUser.firstName} {currentUser.lastName}</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 4px 0', fontSize: '14px' }}>{currentUser.email}</p>
          <span className={`role-badge ${currentUser.role.toLowerCase()}`} style={{ marginTop: '8px' }}>
            <UserCircle size={14} /> {currentUser.role}
          </span>
        </div>
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>KPI e Performance</h3>
      <div className="gantt-stats-widgets" style={{ marginBottom: '32px' }}>
        <div className="gantt-widget">
          <h5>Task Totali ASSEGNATI</h5>
          <div className="widget-value">
            <span className="big-num">{totalTasks}</span>
            <span className="label">tasks</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: '100%', backgroundColor: 'var(--primary)' }}></div>
          </div>
        </div>

        <div className="gantt-widget">
          <h5>Task Completati</h5>
          <div className="widget-value">
            <span className="big-num">{completed}</span>
            <span className="label">tasks</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar success" style={{ width: `${getPercentage(completed)}%`, backgroundColor: 'var(--status-text-success)' }}></div>
          </div>
        </div>

        <div className="gantt-widget">
          <h5>In Sviluppo</h5>
          <div className="widget-value">
            <span className="big-num">{inProgress}</span>
            <span className="label">tasks</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${getPercentage(inProgress)}%`, backgroundColor: 'var(--status-dev)' }}></div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--sidebar-bg)',
        padding: '30px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Distribuzione Stati Task</h3>
        
        {totalTasks === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nessun task assegnato per visualizzare i grafici.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <CheckCircle2 size={16} color="var(--status-text-success)"/> Completati
              </div>
              <div style={{ flex: 1, height: '12px', background: 'var(--main-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${getPercentage(completed)}%`, background: 'var(--status-text-success)', borderRadius: '6px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>{getPercentage(completed)}%</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <PlayCircle size={16} color="var(--status-dev)"/> In Corso
              </div>
              <div style={{ flex: 1, height: '12px', background: 'var(--main-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${getPercentage(inProgress)}%`, background: 'var(--status-dev)', borderRadius: '6px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>{getPercentage(inProgress)}%</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <Clock size={16} color="var(--text-muted)"/> Da Iniziare
              </div>
              <div style={{ flex: 1, height: '12px', background: 'var(--main-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${getPercentage(todo)}%`, background: 'var(--status-todo)', borderRadius: '6px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>{getPercentage(todo)}%</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                <Archive size={16} color="#f59e0b"/> In Pausa
              </div>
              <div style={{ flex: 1, height: '12px', background: 'var(--main-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${getPercentage(paused)}%`, background: '#f59e0b', borderRadius: '6px' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>{getPercentage(paused)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
