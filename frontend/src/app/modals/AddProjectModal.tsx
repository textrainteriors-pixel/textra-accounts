import { X } from "lucide-react";
import type { Account } from "../types";

export default function AddProjectModal({
  accounts,
  projectForm,
  onSetProjectForm,
  onSubmit,
  onClose,
}: {
  accounts: Account[];
  projectForm: { name: string; companyId: string };
  onSetProjectForm: (form: { name: string; companyId: string }) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">Add New Project</h3>
          <button onClick={onClose} className="text-muted-foreground hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Project Name</label>
            <input
              type="text"
              value={projectForm.name}
              onChange={e => onSetProjectForm({ ...projectForm, name: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Select Company</label>
            <select
              value={projectForm.companyId}
              onChange={e => onSetProjectForm({ ...projectForm, companyId: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">Select Company</option>
              {accounts.filter(a => a.type === "company").map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!projectForm.name.trim() || !projectForm.companyId}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
}
