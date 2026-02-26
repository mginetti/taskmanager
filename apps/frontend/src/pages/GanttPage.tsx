import { useState } from 'react';
import { COLUMNS } from '../constants';
import { Task, Project, User, TaskStatus, UserRole } from '@taskmanager/shared';
import { ChevronDown, Search } from 'lucide-react';

interface GanttPageProps {
  currentUser: User;
  tasks: Task[];
  projects: Project[];
  users: User[];
  onOpenModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function GanttPage({ currentUser, tasks, projects, users, onOpenModal, searchQuery, onSearchChange }: GanttPageProps) {  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const getWorkingHoursForDay = (date: Date) => {
    const day = date.getDay();
    if (day >= 1 && day <= 4) return 7.5; // Mon-Thu
    if (day === 5) return 6.5; // Fri
    return 0; // Sat-Sun
  };

  const getEndCalendarDate = (startDate: Date, hours: number) => {
    if (hours <= 0) return new Date(startDate);
    let remaining = hours;
    const currentDay = new Date(startDate);
    
    while (remaining > 0) {
      const dailyCap = getWorkingHoursForDay(currentDay);
      if (dailyCap > 0) {
        if (remaining <= dailyCap) {
          remaining = 0;
          break;
        } else {
          remaining -= dailyCap;
        }
      }
      if (remaining > 0) {
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }
    return currentDay;
  };

  const calculateGanttMetrics = (task: Task) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const plannedStart = new Date(task.createdAt);
    plannedStart.setHours(0, 0, 0, 0);

    const ganttStart = plannedStart;

    let effortStartDay = new Date(ganttStart);
    if (!task.startedAt && ganttStart < now) {
      effortStartDay = new Date(now);
    }

    const plannedEffortHours = task.effortHours || 0;
    
    let currentSessionMinutes = 0;
    if (task.currentSessionStartedAt) {
      currentSessionMinutes = Math.floor((new Date().getTime() - new Date(task.currentSessionStartedAt).getTime()) / 60000);
    }
    const totalActualEffortHours = ((task.actualEffortMinutes || 0) + currentSessionMinutes) / 60;

    const plannedEndDay = getEndCalendarDate(effortStartDay, plannedEffortHours);
    const actualEndDay = getEndCalendarDate(effortStartDay, Math.max(plannedEffortHours, totalActualEffortHours));

    const plannedSpanDays = Math.round((plannedEndDay.getTime() - ganttStart.getTime()) / 86400000) + 1;
    let overtimeSpanDays = 0;
    let overtimeStartOffsetDays = 0;

    if (actualEndDay.getTime() > plannedEndDay.getTime()) {
      overtimeStartOffsetDays = plannedSpanDays;
      overtimeSpanDays = Math.round((actualEndDay.getTime() - plannedEndDay.getTime()) / 86400000);
    }

    const spanDays = plannedSpanDays + overtimeSpanDays;

    return { ganttStart, plannedSpanDays, overtimeStartOffsetDays, overtimeSpanDays, spanDays };
  };

  const tasksWithMetrics = tasks.map(task => ({
    task,
    ...calculateGanttMetrics(task)
  }));

  const isProjectView = selectedProjectId === '';

  type DisplayItem = {
    id: string;
    title: string;
    ganttStart: Date;
    plannedSpanDays: number;
    overtimeSpanDays: number;
    overtimeStartOffsetDays: number;
    spanDays: number;
    dotClass: string;
    bgColor: string;
    textColor: string;
    label: string;
    metaText: string;
  };

  const displayItems: DisplayItem[] = isProjectView 
    ? (projects.map(p => {
        const pTasks = tasksWithMetrics.filter(t => t.task.projectId === p.id);
        if (pTasks.length === 0) return null;
        const earliestStart = Math.min(...pTasks.map(t => t.ganttStart.getTime()));
        const latestEnd = Math.max(...pTasks.map(t => t.ganttStart.getTime() + (t.spanDays * 86400000)));
        const spanDays = Math.max(1, Math.round((latestEnd - earliestStart) / 86400000));
        return {
          id: p.id,
          title: p.name,
          ganttStart: new Date(earliestStart),
          plannedSpanDays: spanDays,
          overtimeSpanDays: 0,
          overtimeStartOffsetDays: 0,
          spanDays,
          dotClass: 'dot-prod',
          bgColor: 'dot-prod-bg',
          textColor: 'dot-prod-text',
          label: 'Project',
          metaText: `${pTasks.length} tasks`
        };
      }).filter(Boolean) as DisplayItem[])
    : tasksWithMetrics.filter(t => t.task.projectId === selectedProjectId).map(t => {
        const statusCol = COLUMNS.find(c => c.id === t.task.status);
        return {
          id: t.task.id,
          title: t.task.title,
          ganttStart: t.ganttStart,
          plannedSpanDays: t.plannedSpanDays,
          overtimeSpanDays: t.overtimeSpanDays,
          overtimeStartOffsetDays: t.overtimeStartOffsetDays,
          spanDays: t.spanDays,
          dotClass: statusCol?.dotClass || 'dot-todo',
          bgColor: `${statusCol?.dotClass || 'dot-todo'}-bg`,
          textColor: `${statusCol?.dotClass || 'dot-todo'}-text`,
          label: statusCol?.title || t.task.status,
          metaText: t.task.effortHours ? `${t.task.effortHours}h Est.` : '-'
        };
      });

  // Prepare dynamic dates for GANTT VIEW
  let timelineStart = new Date();
  timelineStart.setDate(timelineStart.getDate() - 3);
  timelineStart.setHours(0, 0, 0, 0);
  
  let maxSpan = 14;

  if (displayItems.length > 0) {
    const earliestStart = Math.min(...displayItems.map(m => m.ganttStart.getTime()));
    if (earliestStart < timelineStart.getTime()) {
      timelineStart = new Date(earliestStart);
    }
    const latestEnd = Math.max(...displayItems.map(m => {
      const d = new Date(m.ganttStart);
      d.setDate(d.getDate() + m.spanDays);
      return d.getTime();
    }));
    
    const diffDays = Math.ceil((latestEnd - timelineStart.getTime()) / (1000 * 3600 * 24));
    maxSpan = Math.max(14, diffDays + 3); // padding
  }

  const ganttColumns = Array.from({ length: maxSpan }, (_, i) => {
    const d = new Date(timelineStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const filteredTasks = selectedProjectId ? tasks.filter(t => t.projectId === selectedProjectId) : tasks;
  const completedTasksCount = filteredTasks.filter(t => t.status === 'IN_PROD').length;
  const totalTasks = filteredTasks.length;
  const activeWorkloadHours = filteredTasks
    .filter(t => t.status === TaskStatus.IN_SVILUPPO || t.status === TaskStatus.IN_PAUSA)
    .reduce((sum, t) => sum + (t.effortHours || 0), 0);
  const pendingReviewCount = filteredTasks.filter(t => [TaskStatus.COMPLETATO, TaskStatus.IN_TEST, TaskStatus.IN_DEV].includes(t.status)).length;

  return (
    <div className="gantt-page">
      <div className="gantt-page-header">
        <h2>Project Timeline GANTT View</h2>
        <div className="gantt-header-actions">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {currentUser.role !== UserRole.USER && (
            <button className="primary-btn" onClick={onOpenModal}>+ New Task</button>
          )}
        </div>
      </div>

      <div className="gantt-active-project-bar">
        <div className="active-project-selector">
          <span className="label">ACTIVE PROJECT:</span>
          <div className="gantt-project-select-wrapper">
            <select 
              value={selectedProjectId} 
              onChange={e => setSelectedProjectId(e.target.value)}
              className="gantt-project-select"
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
        </div>
        <div className="gantt-status-legend">
          <span className="legend-item"><div className="dot dot-success"></div> Completed</span>
          <span className="legend-item"><div className="dot dot-prod"></div> In Prod</span>
          <span className="legend-item"><div className="dot dot-test"></div> In Test</span>
          <span className="legend-item"><div className="dot dot-dev"></div> In Dev</span>
          <span className="legend-item"><div className="dot dot-paused"></div> On Hold</span>
        </div>
      </div>

      <div className="gantt-view standalone">
        <div className="gantt-header">
          <div className="gantt-title-col">TASK DETAILS & STATUS</div>
          <div className="gantt-timeline-header">
            {ganttColumns.map(d => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div className={`gantt-day ${isToday ? 'today' : ''}`} key={d.toISOString()}>
                  <span>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  {isToday && <strong>TODAY</strong>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="gantt-body">
          {displayItems.map((item) => {
            const startMs = item.ganttStart.getTime() - timelineStart.getTime();
            const leftDays = startMs / (1000 * 3600 * 24);
            
            return (
              <div className="gantt-row" key={item.id}>
                <div className="gantt-task-info">
                  <div className={`dot ${item.dotClass}`}></div>
                  <div>
                    <h4 className="gantt-task-title">{item.title}</h4>
                    <span className="gantt-task-meta">
                      {item.ganttStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()} 
                      <span className={`gantt-task-effort ${item.textColor}`}>
                        {item.metaText}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="gantt-timeline-row">
                  {ganttColumns.map(d => (
                    <div className={`gantt-grid-cell ${d.getDay() === 0 || d.getDay() === 6 ? 'weekend' : ''}`} key={d.toISOString()}></div>
                  ))}
                  
                  <div 
                    className={`gantt-bar ${item.bgColor}`}
                    style={{ 
                      left: `${leftDays * 100}px`, 
                      width: `${item.plannedSpanDays * 100}px` 
                    }}
                  >
                    {item.label}
                  </div>
                  {item.overtimeSpanDays > 0 && (
                    <div 
                      className="gantt-bar"
                      style={{ 
                        left: `${(leftDays + item.overtimeStartOffsetDays) * 100}px`, 
                        width: `${item.overtimeSpanDays * 100}px`,
                        backgroundColor: '#ef4444',
                        color: 'white',
                        paddingLeft: '10px'
                      }}
                    >
                      OVERTIME
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="gantt-stats-widgets">
        <div className="gantt-widget">
          <h5>COMPLETION RATE</h5>
          <div className="widget-value">
            <span className="big-num">{totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0}%</span>
            <span className="label">IN PROD</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar success" style={{width: `${totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0}%`}}></div></div>
        </div>
        <div className="gantt-widget">
          <h5>ACTIVE WORKLOAD</h5>
          <div className="widget-value">
            <span className="big-num">{activeWorkloadHours}</span>
            <span className="label">Total Hours</span>
          </div>
        </div>
        <div className="gantt-widget">
          <h5>PENDING REVIEW</h5>
          <div className="widget-value">
            <span className="big-num">{pendingReviewCount.toString().padStart(2, '0')}</span>
            <span className="label">Test Tickets</span>
          </div>
        </div>
        <div className="gantt-widget">
          <h5>ALLOCATED TEAM</h5>
          <div className="team-avatars">
            {users.slice(0, 3).map((u, i) => (
              <img key={u.id} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`} alt="Team Member" style={{ zIndex: 10 - i }} />
            ))}
            {users.length > 3 && (
              <span className="more-team">+{users.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
