import { User, UserRole } from '@taskmanager/shared';
import { Mail, Shield, User as UserIcon } from 'lucide-react';

interface SettingsPageProps {
  currentUser: User;
  users: User[];
  onOpenUserModal: () => void;
  onEditUser?: (user: User) => void;
}

export function SettingsPage({ currentUser, users, onOpenUserModal, onEditUser }: SettingsPageProps) {
  return (
    <div className="projects-page">
      <div className="projects-page-header">
        <div>
          <h2>Impostazioni e Team</h2>
          <p className="projects-page-subtitle">Gestisci gli accessi, i ruoli e i membri del Workspace</p>
        </div>
        {currentUser.role === UserRole.ADMIN && (
          <button className="primary-btn" onClick={onOpenUserModal}>
            + Crea Nuovo Utente
          </button>
        )}
      </div>

      <div className="list-view standalone">
        <table className="task-table project-table">
          <thead>
            <tr>
              <th>Utente</th>
              <th>Contatto</th>
              <th>Ruolo</th>
              <th>Stato / Creato il</th>
              {currentUser.role === UserRole.ADMIN && onEditUser && <th>Azioni</th>}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} style={{textAlign: 'center', padding: '32px', color: 'var(--text-muted)'}}>
                  Nessun utente trovato.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info-cell">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`} alt="User Avatar" className="user-avatar-large" />
                      <div>
                        <strong>{user.firstName} {user.lastName}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <Mail size={14} className="cell-icon" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role === UserRole.ADMIN && <Shield size={12} />}
                      {user.role === UserRole.MANAGER && <UserIcon size={12} />}
                      {user.role === UserRole.USER && <UserIcon size={12} />}
                      <span>{user.role}</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {currentUser.role === UserRole.ADMIN && onEditUser && (
                    <td>
                      <button className="icon-btn-small" onClick={() => onEditUser(user)} title="Modifica">
                        <span style={{fontSize: '12px', fontWeight: 600, color: 'var(--primary)'}}>Modifica</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
