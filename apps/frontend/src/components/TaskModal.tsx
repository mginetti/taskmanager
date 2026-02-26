import {
  ClipboardList,
  X,
  ChevronDown,
  Bold,
  Italic,
  List as ListIcon,
  Link as LinkIcon,
  CalendarDays,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import type { Task, Project, User } from '@taskmanager/shared';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTask: Partial<Task>;
  setNewTask: (task: Partial<Task>) => void;
  projects: Project[];
  users: User[];
  tasks: Task[];
  onDelete?: () => void;
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  newTask,
  setNewTask,
  projects,
  users,
  tasks,
  onDelete
}: TaskModalProps) {
  if (!isOpen) return null;

  const getWorkingHoursForDay = (date: Date) => {
    const day = date.getDay();
    if (day >= 1 && day <= 4) return 7.5;
    if (day === 5) return 6.5;
    return 0;
  };

  const plannedStart = newTask.createdAt ? new Date(newTask.createdAt) : new Date();
  
  // Create a 7 day timeline centered roughly around planned date
  const miniTimelineStart = new Date(plannedStart);
  miniTimelineStart.setDate(miniTimelineStart.getDate() - 2);
  miniTimelineStart.setHours(0, 0, 0, 0);
  
  const miniTimelineDays = 7;
  const miniGanttColumns = Array.from({ length: miniTimelineDays }, (_, i) => {
    const d = new Date(miniTimelineStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const renderMiniGantt = () => {
    if (!newTask.assignedToUserId) return null;
    
    const assigneeTasks = tasks.filter(t => t.assignedToUserId === newTask.assignedToUserId && t.id !== newTask.id);
    const activeTasks = assigneeTasks.map(t => {
      const tStart = new Date(t.createdAt);
      tStart.setHours(0,0,0,0);
      let remaining = t.effortHours || 0;
      let spanDays = 1;
      const curr = new Date(tStart);
      while(remaining > 0) {
        const cap = getWorkingHoursForDay(curr);
        if (cap > 0) remaining -= cap;
        if (remaining > 0) {
          curr.setDate(curr.getDate() + 1);
          spanDays++;
        }
      }
      return { task: t, start: tStart, spanDays };
    }).filter(t => {
      const tEnd = new Date(t.start);
      tEnd.setDate(tEnd.getDate() + t.spanDays);
      return tEnd >= miniTimelineStart && t.start <= new Date(miniTimelineStart.getTime() + (miniTimelineDays * 86400000));
    });

    if (activeTasks.length === 0) {
      return <div className="mini-gantt-empty">Nessun task per questo utente in questo periodo.</div>;
    }

    return (
      <div className="mini-gantt">
        <div className="mini-gantt-header">
          {miniGanttColumns.map(d => (
            <div key={d.toISOString()} className={`mini-gantt-day ${d.toDateString() === plannedStart.toDateString() ? 'highlight' : ''}`}>
              {d.toLocaleDateString('en-US', { weekday: 'short' })}<br/>
              {d.getDate()}
            </div>
          ))}
        </div>
        <div className="mini-gantt-rows">
          {activeTasks.map(at => {
            const startOffsetDays = (at.start.getTime() - miniTimelineStart.getTime()) / 86400000;
            const leftPerc = Math.max(0, startOffsetDays / miniTimelineDays * 100);
            const startInside = Math.max(0, startOffsetDays);
            const endInside = Math.min(miniTimelineDays, startOffsetDays + at.spanDays);
            const widthPerc = Math.max(0, ((endInside - startInside) / miniTimelineDays * 100));

            if (widthPerc <= 0) return null;

            return (
              <div className="mini-gantt-bar-row" key={at.task.id}>
                <div 
                  className="mini-gantt-bar-inner" 
                  style={{ left: `${leftPerc}%`, width: `${widthPerc}%` }}
                  title={`${at.task.title} (${at.task.effortHours}h)`}
                >
                  {at.task.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-icon-bg">
              <ClipboardList size={20} className="primary-icon" />
            </div>
            <div>
              <h3>{newTask.id ? 'Modifica Task' : 'Crea Nuovo Task'}</h3>
              <p>{newTask.id ? 'Modifica i dettagli del task' : 'Aggiungi i dettagli per iniziare il lavoro'}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>Progetto</label>
            <div className="select-wrapper">
              <select 
                value={newTask.projectId} 
                onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Titolo</label>
            <input 
              type="text" 
              placeholder="Es: Design nuovo header sito" 
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Descrizione</label>
            <div className="editor-container">
              <div className="editor-toolbar">
                <button type="button"><Bold size={14} /></button>
                <button type="button"><Italic size={14} /></button>
                <button type="button"><ListIcon size={14} /></button>
                <button type="button"><LinkIcon size={14} /></button>
              </div>
              <textarea 
                placeholder="Inserisci i dettagli del task..."
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="form-group assignee-group-full">
            <label>Chi svolgerà il Task?</label>
            <div className="user-selection-grid">
              {users.map(u => (
                <div 
                  key={u.id} 
                  className={`user-card-selectable ${newTask.assignedToUserId === u.id ? 'selected' : ''}`}
                  onClick={() => setNewTask({...newTask, assignedToUserId: u.id})}
                >
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`} alt="User" />
                  <span>{u.firstName}</span>
                </div>
              ))}
            </div>
            {newTask.assignedToUserId && (
              <div className="assignee-preview">
                <h5>Impegni programmati di {users.find(u => u.id === newTask.assignedToUserId)?.firstName}</h5>
                {renderMiniGantt()}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Data di pianificazione</label>
              <div className="input-with-icon">
                <input 
                  type="date" 
                  value={newTask.createdAt ? new Date(newTask.createdAt).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)}
                  onChange={e => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) {
                      setNewTask({...newTask, createdAt: d});
                    }
                  }}
                />
                <CalendarDays size={16} className="input-icon" />
              </div>
            </div>
            <div className="form-group half">
              <label>Effort in ore</label>
              <div className="input-with-suffix">
                <input 
                  type="number" 
                  min="0"
                  value={newTask.effortHours || ''}
                  onChange={e => setNewTask({...newTask, effortHours: parseInt(e.target.value) || 0})}
                />
                <span className="suffix">h</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {newTask.id && onDelete && (
              <button 
                type="button" 
                className="text-btn delete-btn" 
                onClick={onDelete}
                style={{ color: '#ef4444', marginRight: 'auto' }}
              >
                <Trash2 size={16} /> Elimina Task
              </button>
            )}
            <button type="button" className="text-btn" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="primary-btn btn-with-icon">
              <CheckCircle2 size={16} /> {newTask.id ? 'Salva Modifiche' : 'Crea Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
