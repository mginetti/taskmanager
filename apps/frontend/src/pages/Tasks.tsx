import { COLUMNS } from '../constants';
import { Task, Project, User, UserRole } from '@taskmanager/shared';

interface TasksProps {
  currentUser: User;
  tasks: Task[];
  projects: Project[];
  onOpenModal: () => void;
  onEditTask?: (task: Task) => void;
}

export function Tasks({ currentUser, tasks, projects, onOpenModal, onEditTask }: TasksProps) {
  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <div>
          <h2>All Tasks</h2>
          <p className="tasks-page-subtitle">Manage all tasks grouped by project</p>
        </div>
        {currentUser.role !== UserRole.USER && (
          <button className="primary-btn" onClick={onOpenModal}>
            + Crea Nuovo Task
          </button>
        )}
      </div>
      
      {projects.map(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        return (
          <div key={project.id} className="project-group">
            <h3 className="project-group-title">{project.name}</h3>
            {projectTasks.length === 0 ? (
              <p className="no-tasks">Nessun task per questo progetto.</p>
            ) : (
              <div className="list-view">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Effort</th>
                      <th>Assignee</th>
                      <th>Created At</th>
                      {currentUser.role !== UserRole.USER && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {projectTasks.map((task) => {
                      const statusCol = COLUMNS.find(c => c.id === task.status);
                      return (
                        <tr key={task.id}>
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
                          {currentUser.role !== UserRole.USER && (
                            <td>
                              {onEditTask && (
                                <button className="icon-btn-small" onClick={() => onEditTask(task)} title="Modifica">
                                  <span style={{fontSize: '12px', fontWeight: 600, color: 'var(--primary)'}}>Modifica</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}
