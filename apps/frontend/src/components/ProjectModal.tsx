import {
  FolderKanban,
  X,
  CheckCircle2,
  Bold,
  Italic,
  List as ListIcon,
  Link as LinkIcon
} from 'lucide-react';
import type { Project } from '@taskmanager/shared';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newProject: Partial<Project>;
  setNewProject: (project: Partial<Project>) => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  newProject,
  setNewProject
}: ProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-icon-bg">
              <FolderKanban size={20} className="primary-icon" />
            </div>
            <div>
              <h3>Crea Nuovo Progetto</h3>
              <p>Aggiungi i dettagli per la nuova area di lavoro</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              placeholder="Es: Riorganizzazione Database..." 
              value={newProject.name || ''}
              onChange={e => setNewProject({...newProject, name: e.target.value})}
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
                placeholder="Inserisci i dettagli del progetto..."
                value={newProject.description || ''}
                onChange={e => setNewProject({...newProject, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="text-btn" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="primary-btn btn-with-icon">
              <CheckCircle2 size={16} /> Crea Progetto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
