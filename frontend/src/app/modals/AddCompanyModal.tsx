import { X } from "lucide-react";

export default function AddCompanyModal({
  editingCompanyId,
  companyForm,
  onSetCompanyForm,
  onSubmit,
  onClose,
}: {
  editingCompanyId: string | null;
  companyForm: { name: string; type: string; openingBalance: string; color: string };
  onSetCompanyForm: (form: { name: string; type: string; openingBalance: string; color: string }) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">{editingCompanyId ? "Edit Company" : "Add New Company"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Company Name</label>
            <input
              type="text"
              value={companyForm.name}
              onChange={e => onSetCompanyForm({ ...companyForm, name: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="Enter name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Account Type</label>
              <select
                value={companyForm.type}
                onChange={e => onSetCompanyForm({ ...companyForm, type: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              >
                <option value="company">Company</option>
                <option value="overdraft">Overdraft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Opening Balance</label>
              <input
                type="number"
                value={companyForm.openingBalance}
                onChange={e => onSetCompanyForm({ ...companyForm, openingBalance: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button onClick={onSubmit} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            {editingCompanyId ? "Save Changes" : "Add Company"}
          </button>
        </div>
      </div>
    </div>
  );
}
