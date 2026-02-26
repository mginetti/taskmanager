import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import './App.css';
import { User, Project, Task, UserRole } from '@taskmanager/shared';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { UserModal } from './components/UserModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { GanttPage } from './pages/GanttPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activePage, setActivePage] = useState<'BOARD_VIEW' | 'TASKS' | 'GANTT' | 'PROJECTS' | 'SETTINGS'>('BOARD_VIEW');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    projectId: '',
    title: '',
    description: '',
    assignedToUserId: '',
    effortHours: 0,
  });
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
  });
  const [newUser, setNewUser] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.USER,
  });
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    fetch('/api/projects').then((res) => res.json()).then((data: Project[]) => {
      setProjects(data);
      if (data.length > 0) setNewTask((prev) => ({ ...prev, projectId: data[0].id }));
    }).catch(console.error);
    fetch('/api/users').then((res) => res.json()).then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const url = searchQuery ? `/api/tasks?search=${encodeURIComponent(searchQuery)}` : '/api/tasks';
      fetch(url).then((res) => res.json()).then(setTasks).catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!newTask.id;
      const url = isEditing ? `/api/tasks/${newTask.id}` : '/api/tasks';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        const savedTask = await res.json();
        
        if (isEditing) {
          setTasks((prev) => prev.map((t) => (t.id === newTask.id ? savedTask : t)));
        } else {
          setTasks((prev) => [...prev, savedTask]);
        }
        
        setIsModalOpen(false);
        setNewTask({ 
          projectId: projects.length > 0 ? projects[0].id : '', 
          title: '', 
          description: '', 
          assignedToUserId: '', 
          effortHours: 0 
        });
        showNotification(isEditing ? 'Task aggiornato con successo!' : 'Task creato con successo!', 'success');
      } else {
        showNotification(isEditing ? "Errore nell'aggiornamento del task." : "Errore nella creazione del task.", 'error');
      }
    } catch (err) {
      console.error('Failed to save task:', err);
      showNotification('Errore di connessione al server.', 'error');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const createdProject = await res.json();
        setProjects((prev) => [...prev, createdProject]);
        setIsProjectModalOpen(false);
        setNewProject({ name: '', description: '' });
        showNotification('Progetto creato con successo!', 'success');
      } else {
        showNotification('Errore nella creazione del progetto.', 'error');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      showNotification('Errore di connessione al server.', 'error');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!newUser.id;
      const url = isEditing ? `/api/users/${newUser.id}` : '/api/users';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        const savedUser = await res.json();
        
        if (isEditing) {
          setUsers((prev) => prev.map((u) => (u.id === newUser.id ? savedUser : u)));
        } else {
          setUsers((prev) => [...prev, savedUser]);
        }
        
        setIsUserModalOpen(false);
        setNewUser({ firstName: '', lastName: '', email: '', role: UserRole.USER });
        showNotification(isEditing ? 'Utente aggiornato con successo!' : 'Utente creato con successo!', 'success');
      } else {
        showNotification(isEditing ? "Errore nell'aggiornamento dell'utente." : "Errore nella creazione dell'utente.", 'error');
      }
    } catch (err) {
      console.error('Failed to save user:', err);
      showNotification('Errore di connessione al server.', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setIsModalOpen(false);
        showNotification('Task eliminato con successo!', 'success');
      } else {
        showNotification("Errore nell'eliminazione del task.", 'error');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      showNotification('Errore di connessione al server.', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setIsUserModalOpen(false);
        showNotification('Utente eliminato con successo!', 'success');
      } else {
        showNotification("Errore nell'eliminazione dell'utente.", 'error');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      showNotification('Errore di connessione al server.', 'error');
    }
  };

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      } else {
        showNotification("Errore nell\\'aggiornamento del task.", 'error');
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      showNotification('Errore di connessione al server.', 'error');
    }
  };

  const handleLogin = (jwt: string, user: User) => {
    setCurrentUser(user);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} currentUser={currentUser} />

      <div className="main-wrapper">
        <Header currentUser={currentUser} onLogout={handleLogout} />

        <div className="content-layout">
          <main className="main-content">
            {activePage === 'BOARD_VIEW' ? (
              <Dashboard 
                currentUser={currentUser}
                tasks={tasks} 
                projects={projects}
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
                onUpdateTask={handleUpdateTask}
              />
            ) : activePage === 'TASKS' ? (
              <Tasks 
                currentUser={currentUser}
                tasks={tasks} 
                projects={projects} 
                onOpenModal={() => {
                  setNewTask({ 
                    projectId: projects.length > 0 ? projects[0].id : '', 
                    title: '', 
                    description: '', 
                    assignedToUserId: '', 
                    effortHours: 0 
                  });
                  setIsModalOpen(true);
                }}
                onEditTask={(task) => {
                  setNewTask(task);
                  setIsModalOpen(true);
                }}
              />
            ) : activePage === 'GANTT' ? (
              <GanttPage 
                currentUser={currentUser}
                tasks={tasks} 
                projects={projects} 
                users={users}
                onOpenModal={() => setIsModalOpen(true)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            ) : activePage === 'PROJECTS' ? (
              currentUser.role === UserRole.USER ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h2>Accesso Negato</h2>
                  <p>Non hai i permessi per visualizzare i progetti.</p>
                </div>
              ) : (
                <ProjectsPage 
                  currentUser={currentUser}
                  projects={projects} 
                  tasks={tasks} 
                  onOpenModal={() => setIsProjectModalOpen(true)} 
                />
              )
            ) : (
              currentUser.role === UserRole.USER ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h2>Accesso Negato</h2>
                  <p>Non hai i permessi per visualizzare le impostazioni.</p>
                </div>
              ) : (
                <SettingsPage 
                  currentUser={currentUser}
                  users={users} 
                  onOpenUserModal={() => {
                    setNewUser({ firstName: '', lastName: '', email: '', role: UserRole.USER });
                    setIsUserModalOpen(true);
                  }} 
                  onEditUser={(user) => {
                    setNewUser(user);
                    setIsUserModalOpen(true);
                  }}
                />
              )
            )}
          </main>

          {activePage === 'BOARD_VIEW' && <RightSidebar tasks={tasks} users={users} />}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        newTask={newTask}
        setNewTask={setNewTask}
        projects={projects}
        users={users}
        tasks={tasks}
        onDelete={newTask.id ? () => handleDeleteTask(newTask.id as string) : undefined}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        newProject={newProject}
        setNewProject={setNewProject}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleSaveUser}
        newUser={newUser}
        setNewUser={setNewUser}
        onDelete={newUser.id ? () => handleDeleteUser(newUser.id as string) : undefined}
      />

      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
