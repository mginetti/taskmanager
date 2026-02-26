import {
  Users,
  X,
  CheckCircle2,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { User, UserRole } from '@taskmanager/shared';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newUser: Partial<User>;
  setNewUser: (user: Partial<User>) => void;
  onDelete?: () => void;
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  newUser,
  setNewUser,
  onDelete
}: UserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-icon-bg">
              <Users size={20} className="primary-icon" />
            </div>
            <div>
              <h3>{newUser.id ? 'Modifica Utente' : 'Crea Nuovo Utente'}</h3>
              <p>{newUser.id ? 'Modifica i dettagli del membro del team' : 'Aggiungi un nuovo membro al team'}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group half">
              <label>Nome</label>
              <input 
                type="text" 
                placeholder="Es: Mario" 
                value={newUser.firstName || ''}
                onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                required
              />
            </div>
            <div className="form-group half">
              <label>Cognome</label>
              <input 
                type="text" 
                placeholder="Es: Rossi" 
                value={newUser.lastName || ''}
                onChange={e => setNewUser({...newUser, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Email (Login)</label>
              <input 
                type="email" 
                placeholder="mario.rossi@example.com" 
                value={newUser.email || ''}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group half">
              <label>Password (Opzionale)</label>
              <input 
                type="password" 
                placeholder="Password" 
                value={newUser.password || ''}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ruolo</label>
            <div className="select-wrapper">
              <select 
                value={newUser.role || UserRole.USER} 
                onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="modal-footer">
            {newUser.id && onDelete && (
              <button 
                type="button" 
                className="text-btn delete-btn" 
                onClick={onDelete}
                style={{ color: '#ef4444', marginRight: 'auto' }}
              >
                <Trash2 size={16} /> Elimina Utente
              </button>
            )}
            <button type="button" className="text-btn" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="primary-btn btn-with-icon">
              <CheckCircle2 size={16} /> {newUser.id ? 'Salva Modifiche' : 'Crea Utente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
