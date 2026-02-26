import { useState, useEffect } from 'react';
import { LayoutGrid, ClipboardList, Calendar, Search, MoreHorizontal, Clock, Play, Pause, Square } from 'lucide-react';
import { COLUMNS } from '../constants';
import { Task, Project, TaskStatus, User } from '@taskmanager/shared';

interface DashboardProps {
  currentUser: User;
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateTask: (taskId: string, data: Partial<Task>) => void;
}

export function Dashboard({ currentUser, tasks, projects, searchQuery, onSearchChange, onUpdateTask }: DashboardProps) {
  const [view, setView] = useState<'BOARD' | 'LIST'>('BOARD');
  
  // Force a re-render every second so elapsed time updates correctly
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlay = (task: Task) => {
    const payload: Partial<Task> = {
      status: TaskStatus.IN_SVILUPPO,
      currentSessionStartedAt: new Date()
    };
    if (!task.startedAt) payload.startedAt = new Date();
    onUpdateTask(task.id, payload);
  };

  const handlePause = (task: Task) => {
    const now = new Date();
    let newEffort = task.actualEffortMinutes || 0;
    if (task.currentSessionStartedAt) {
      const diff = now.getTime() - new Date(task.currentSessionStartedAt).getTime();
      newEffort += Math.floor(diff / 60000);
    }
    onUpdateTask(task.id, {
      status: TaskStatus.IN_PAUSA,
      pausedAt: now,
      currentSessionStartedAt: null,
      actualEffortMinutes: newEffort,
    });
  };

  const handleStop = (task: Task) => {
    const now = new Date();
    let newEffort = task.actualEffortMinutes || 0;
    if (task.currentSessionStartedAt) {
      const diff = now.getTime() - new Date(task.currentSessionStartedAt).getTime();
      newEffort += Math.floor(diff / 60000);
    }
    onUpdateTask(task.id, {
      status: TaskStatus.COMPLETATO,
      completedAt: now,
      currentSessionStartedAt: null,
      actualEffortMinutes: newEffort,
    });
  };

  const formatEffort = (task: Task) => {
    let currentTotalMinutes = task.actualEffortMinutes || 0;
    let runningSeconds = 0;

    if (task.currentSessionStartedAt) {
      const diff = new Date().getTime() - new Date(task.currentSessionStartedAt).getTime();
      currentTotalMinutes += Math.floor(diff / 60000);
      runningSeconds = Math.floor((diff % 60000) / 1000);
    }

    if (currentTotalMinutes === 0 && !task.currentSessionStartedAt) return 'Non iniziato';

    const h = Math.floor(currentTotalMinutes / 60);
    const m = currentTotalMinutes % 60;

    if (task.currentSessionStartedAt) {
      if (currentTotalMinutes === 0) return `${runningSeconds}s`;
      if (h === 0) return `${m}m ${runningSeconds}s`;
      return `${h}h ${m}m ${runningSeconds}s`;
    }

    if (currentTotalMinutes < 60) return `${currentTotalMinutes}m`;
    return `${h}h ${m}m`;
  };

  const getEffortPercentage = (task: Task) => {
    if (!task.effortHours) return 0;
    
    let currentTotalMinutes = task.actualEffortMinutes || 0;
    if (task.currentSessionStartedAt) {
      const diff = new Date().getTime() - new Date(task.currentSessionStartedAt).getTime();
      currentTotalMinutes += Math.floor(diff / 60000);
    }
    
    const maxMinutes = task.effortHours * 60;
    return (currentTotalMinutes / maxMinutes) * 100;
  };

  return (
    <>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="view-toggles">
          <button 
            className={`toggle-btn ${view === 'BOARD' ? 'active' : ''}`}
            onClick={() => setView('BOARD')}
          >
            <LayoutGrid size={16} /> Board
          </button>
          <button 
            className={`toggle-btn ${view === 'LIST' ? 'active' : ''}`}
            onClick={() => setView('LIST')}
          >
            <ClipboardList size={16} /> List
          </button>
        </div>

        <div className="toolbar-actions">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {view === 'BOARD' ? (
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            if (columnTasks.length === 0) return null;
            return (
              <div className="kanban-column" key={col.id}>
                <div className="column-header">
                  <div className="column-title">
                    <div className={`dot ${col.dotClass}`}></div>
                    <h3>{col.title}</h3>
                    <span className="count">{columnTasks.length}</span>
                  </div>
                  {currentUser.role !== 'USER' && (
                    <button className="more-btn"><MoreHorizontal size={16} /></button>
                  )}
                </div>

                <div className="kanban-cards">
                  {columnTasks.map((task) => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <div className="task-card" key={task.id}>
                        <div className="card-top">
                          <span className="tag tag-discovery" style={{backgroundColor: '#e2e8f0', color: '#475569'}}>{project ? (project.name.length > 15 ? project.name.slice(0, 15) + '...' : project.name) : 'No Project'}</span>
                          <div className="assignees">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${task.assignedToUserId || task.id}`} alt="User" />
                          </div>
                        </div>
                      <h4 className="card-title">{task.title}</h4>
                      {task.description && <p className="card-desc">{task.description}</p>}
                      
                      {task.effortHours && (() => {
                        const pct = getEffortPercentage(task);
                        const width = Math.min(100, pct);
                        let barColor = 'var(--primary)';
                        if (pct >= 100) barColor = 'var(--error)';
                        else if (pct >= 80) barColor = 'var(--warning)';
                        
                        return (
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${width}%`, backgroundColor: barColor }}></div>
                          </div>
                        );
                      })()}
                      
                      <div className="card-footer">
                        <div className="date">
                          <Calendar size={12} /> {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                        {task.effortHours && (
                          <div className="time-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                            <div><Clock size={12} /> {task.effortHours}h budget</div>
                            <div style={{ color: task.currentSessionStartedAt ? 'var(--primary)' : 'inherit' }}>
                              <Clock size={12} /> {formatEffort(task)} elapsed
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="timer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                        {task.status !== TaskStatus.IN_SVILUPPO && task.status !== TaskStatus.COMPLETATO && (
                          <button onClick={() => handlePlay(task)} className="icon-btn-small" style={{ color: 'var(--success)' }} title="Play">
                            <Play size={16} />
                          </button>
                        )}
                        {task.status === TaskStatus.IN_SVILUPPO && (
                          <button onClick={() => handlePause(task)} className="icon-btn-small" style={{ color: 'var(--warning)' }} title="Pausa">
                            <Pause size={16} />
                          </button>
                        )}
                        {task.status !== TaskStatus.COMPLETATO && (
                          <button onClick={() => handleStop(task)} className="icon-btn-small" style={{ color: 'var(--error)' }} title="Termina">
                            <Square size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === 'LIST' ? (
        <div className="list-view">
          <table className="task-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Title</th>
                <th>Status</th>
                <th>Effort</th>
                <th>Assignee</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const statusCol = COLUMNS.find(c => c.id === task.status);
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <tr key={task.id}>
                    <td>
                      <div className="badge-count" style={{backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600}}>
                        {project ? project.name : '-'}
                      </div>
                    </td>
                    <td>
                      <strong>{task.title}</strong>
                      {task.description && <span className="task-excerpt">{task.description.slice(0, 40)}...</span>}
                    </td>
                    <td>
                      <div className="status-cell">
                        <div className={`dot ${statusCol?.dotClass || 'dot-todo'}`}></div>
                        <span>{statusCol?.title || task.status}</span>
                      </div>
                    </td>
                    <td>{task.effortHours ? `${task.effortHours}h` : '-'}</td>
                    <td>
                      <div className="assignee-cell">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${task.assignedToUserId || task.id}`} alt="User" />
                      </div>
                    </td>
                    <td className="date-cell">{new Date(task.createdAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
