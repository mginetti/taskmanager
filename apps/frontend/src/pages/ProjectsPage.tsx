import { Project, Task, User, UserRole } from '@taskmanager/shared';

interface ProjectsPageProps {
  currentUser: User;
  projects: Project[];
  tasks: Task[];
  onOpenModal: () => void;
}

export function ProjectsPage({ currentUser, projects, tasks, onOpenModal }: ProjectsPageProps) {
  return (
    <div className="projects-page">
      <div className="projects-page-header">
        <div>
          <h2>Projects Pipeline</h2>
          <p className="projects-page-subtitle">Manage workspaces and cross-view statistics</p>
        </div>
        {currentUser.role === UserRole.ADMIN && (
          <button className="primary-btn" onClick={onOpenModal}>
            + Crea Nuovo Progetto
          </button>
        )}
      </div>
      
      <div className="list-view standalone">
        <table className="task-table project-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Description</th>
              <th>Active Tasks</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} style={{textAlign: 'center', padding: '32px', color: 'var(--text-muted)'}}>
                  Nessun progetto trovato.
                </td>
              </tr>
            ) : (
              projects.map(project => {
                const projectTasksCount = tasks.filter(t => t.projectId === project.id).length;
                return (
                  <tr key={project.id}>
                    <td>
                      <div className="project-name-cell">
                        <strong>{project.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="task-excerpt">
                        {project.description ? (project.description.length > 60 ? project.description.slice(0, 60) + '...' : project.description) : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="badge-count">
                        {projectTasksCount} task{projectTasksCount !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
