import { useState, useEffect } from "react";
import { useAccountsController } from "../controllers/useAccountsController";
import { authService } from "../services/authService";
import { reminderService } from "../services/api";
import { today } from "./utils";
import type { TransactionType, AttachedDoc, ConfirmModalState } from "./types";

import Login from "./Login";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import RemindersPage from "./pages/RemindersPage";
import AccountDetail from "./pages/AccountDetail";
import ReportModal from "./modals/ReportModal";
import DocumentViewerModal from "./modals/DocumentViewerModal";
import AddProjectModal from "./modals/AddProjectModal";
import AddCompanyModal from "./modals/AddCompanyModal";
import TransactionFormModal from "./modals/TransactionFormModal";
import ConfirmModal from "./modals/ConfirmModal";
import ReminderModal from "./modals/ReminderModal";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!authService.getCurrentUser());
  const { accounts, loading, addTransaction: handleAddTx, editTransaction, deleteTransaction: handleDelTx, saveOpeningBalance: handleSaveBal, addAccount: handleAddAccount, editAccount, deleteAccount, editAccountName, addProject } = useAccountsController(isAuthenticated);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [reminders, setReminders] = useState<any[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({ text: "", date: today, repeatMonthly: false });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" });
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", companyId: "" });
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [editingOpening, setEditingOpening] = useState<string | null>(null);
  const [openingInput, setOpeningInput] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [viewDoc, setViewDoc] = useState<AttachedDoc | null>(null);
  const [form, setForm] = useState({
    date: today,
    description: "",
    type: "credit" as TransactionType,
    amount: "",
    reference: "",
    document: null as AttachedDoc | null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeAccount = accounts.find(a => a.id === activeTab);
  const modalAccount = activeAccount || (editingAccountId ? accounts.find(a => a.id === editingAccountId) : null);

  // ─── Company CRUD ─────────────────────────────────────────────────────────────
  const saveCompany = async () => {
    if (!companyForm.name.trim()) return;
    const accountData = {
      name: companyForm.name,
      type: companyForm.type,
      openingBalance: parseFloat(companyForm.openingBalance) || 0,
      color: companyForm.color,
      bgColor: companyForm.type === "overdraft" ? "#ffe4e6" : "#e8edf5",
    };

    if (editingCompanyId) {
      const current = accounts.find(a => a.id === editingCompanyId);
      await editAccount(editingCompanyId, {
        ...accountData,
        color: companyForm.color || current?.color || "#1e3a5f",
        bgColor: companyForm.type === "overdraft" ? "#ffe4e6" : (current?.bgColor || "#e8edf5")
      });
      setEditingCompanyId(null);
      setCompanyForm({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" });
      setShowAddCompany(false);
    } else {
      const newId = await handleAddAccount({
        ...accountData,
        bgColor: companyForm.type === "overdraft" ? "#ffe4e6" : "#e8edf5",
        color: companyForm.type === "overdraft" ? "#9f1239" : "#1e3a5f"
      });
      setCompanyForm({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" });
      setShowAddCompany(false);
      if (newId) setActiveTab(newId);
    }
  };

  const handleEditCompanyClick = (account: any) => {
    setEditingCompanyId(account.id);
    setCompanyForm({
      name: account.name,
      type: account.type,
      openingBalance: String(account.openingBalance),
      color: account.color || "#1e3a5f",
    });
    setShowAddCompany(true);
  };

  const handleDeleteCompanyClick = (accountId: string) => {
    setConfirmModal({
      show: true,
      title: "Delete Account",
      message: "Are you sure you want to delete this account and all its transactions? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
      onConfirm: async () => {
        await deleteAccount(accountId);
        setActiveTab("dashboard");
        setConfirmModal(null);
      }
    });
  };

  // ─── Project ──────────────────────────────────────────────────────────────────
  const addProjectAction = async () => {
    if (!projectForm.name || !projectForm.companyId) return;
    await addProject(projectForm.companyId, projectForm.name);
    setProjectForm({ name: "", companyId: "" });
    setShowAddProject(false);
  };

  // ─── Transactions ─────────────────────────────────────────────────────────────
  const addTransaction = async () => {
    if (!form.description || !form.amount) return;
    const tx = {
      date: form.date,
      description: form.description,
      type: form.type,
      amount: parseFloat(form.amount),
      reference: form.reference || undefined,
      document: form.document || undefined,
    };
    try {
      if (editingTxId && editingAccountId) {
        await editTransaction(editingAccountId, editingTxId, tx);
      } else {
        await handleAddTx(activeTab, tx);
      }
      setForm({ date: today, description: "", type: "credit", amount: "", reference: "", document: null });
      setEditingTxId(null);
      setEditingAccountId(null);
      setShowForm(false);
    } catch (err) {
      // Error alerted in controller
    }
  };

  const handleEditClick = (tx: any, accountId?: string) => {
    setEditingTxId(tx.id);
    setEditingAccountId(accountId || activeTab);
    setForm({
      date: tx.date,
      description: tx.description,
      type: tx.type,
      amount: String(tx.amount),
      reference: tx.reference || "",
      document: tx.document || null,
    });
    setShowForm(true);
  };

  const deleteTransaction = (txId: string, accountId?: string) => {
    const targetAccountId = accountId || activeTab;
    setConfirmModal({
      show: true,
      title: "Delete Entry",
      message: "Are you sure you want to delete this transaction entry? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
      onConfirm: () => {
        handleDelTx(targetAccountId, txId);
        setConfirmModal(null);
      }
    });
  };

  const saveOpeningBalance = (accountId: string) => {
    const val = parseFloat(openingInput);
    if (isNaN(val)) return;
    handleSaveBal(accountId, val);
    setEditingOpening(null);
  };

  // ─── Reminders ────────────────────────────────────────────────────────────────
  const fetchReminders = async () => {
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReminders();
    } else {
      setReminders([]);
    }
  }, [isAuthenticated]);

  const saveReminder = async () => {
    if (!reminderForm.text.trim() || !reminderForm.date) return;
    try {
      const newReminder = await reminderService.createReminder({
        text: reminderForm.text.trim(),
        date: reminderForm.date,
        repeatMonthly: reminderForm.repeatMonthly
      });
      setReminders(prev => [...prev, newReminder]);
      setShowReminderModal(false);
      setReminderForm({ text: "", date: today, repeatMonthly: false });
    } catch (err) {
      console.error("Failed to save reminder", err);
    }
  };

  const dismissReminder = async (id: string) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete reminder", err);
    }
  };

  const toggleReminderComplete = async (id: string, completed: boolean) => {
    try {
      await reminderService.updateReminder(id, { completed });
      await fetchReminders();
    } catch (err) {
      console.error("Failed to update reminder status", err);
    }
  };

  const toggleReminderRepeatMonthly = async (id: string, currentRepeat: boolean) => {
    try {
      await reminderService.updateReminder(id, { repeatMonthly: !currentRepeat });
      await fetchReminders();
    } catch (err) {
      console.error("Failed to update reminder repeat status", err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  // ─── Reset helpers ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ date: today, description: "", type: "credit", amount: "", reference: "", document: null });
    setEditingTxId(null);
    setEditingAccountId(null);
    setShowForm(false);
  };

  const resetCompanyForm = () => {
    setShowAddCompany(false);
    setEditingCompanyId(null);
    setCompanyForm({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" });
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header
        reminders={reminders}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onAddProject={() => { setProjectForm({ name: "", companyId: "" }); setShowAddProject(true); }}
        onOpenReminders={() => { setActiveTab("reminders"); setMobileMenuOpen(false); }}
        onOpenReport={() => setShowReport(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <Sidebar
          accounts={accounts}
          activeTab={activeTab}
          reminders={reminders}
          mobileMenuOpen={mobileMenuOpen}
          onSetActiveTab={setActiveTab}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onAddCompany={() => { setCompanyForm({ name: "", type: "company", openingBalance: "", color: "#1e3a5f" }); setShowAddCompany(true); }}
          onAddOverdraft={() => { setCompanyForm({ name: "", type: "overdraft", openingBalance: "", color: "#9f1239" }); setShowAddCompany(true); }}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" ? (
            <Dashboard
              accounts={accounts}
              reminders={reminders}
              onDeleteReminder={dismissReminder}
              onToggleCompleteReminder={toggleReminderComplete}
              onNavigate={setActiveTab}
              onEditTransaction={handleEditClick}
              onDeleteTransaction={deleteTransaction}
            />
          ) : activeTab === "reminders" ? (
            <RemindersPage
              reminders={reminders}
              onAdd={() => {
                setReminderForm({ text: "", date: today, repeatMonthly: false });
                setShowReminderModal(true);
              }}
              onDelete={dismissReminder}
              onToggleComplete={toggleReminderComplete}
              onToggleRepeatMonthly={toggleReminderRepeatMonthly}
            />
          ) : activeAccount ? (
            <AccountDetail
              activeAccount={activeAccount}
              editingName={editingName}
              nameInput={nameInput}
              editingOpening={editingOpening}
              openingInput={openingInput}
              onSetEditingName={setEditingName}
              onSetNameInput={setNameInput}
              onSaveAccountName={(id, name) => { editAccountName(id, name); setEditingName(null); }}
              onCancelEditName={() => setEditingName(null)}
              onSetEditingOpening={setEditingOpening}
              onSetOpeningInput={setOpeningInput}
              onSaveOpeningBalance={saveOpeningBalance}
              onCancelEditOpening={() => setEditingOpening(null)}
              onEditCompany={handleEditCompanyClick}
              onDeleteCompany={handleDeleteCompanyClick}
              onAddEntry={() => setShowForm(true)}
              onEditTransaction={(tx) => handleEditClick(tx)}
              onDeleteTransaction={(txId) => deleteTransaction(txId)}
              onViewDoc={setViewDoc}
            />
          ) : null}
        </main>
      </div>

      {/* ─── Modals ─────────────────────────────────────────────────────────────── */}
      {showReport && (
        <ReportModal
          accounts={accounts}
          reportMonth={reportMonth}
          reportYear={reportYear}
          onSetMonth={setReportMonth}
          onSetYear={setReportYear}
          onClose={() => setShowReport(false)}
        />
      )}

      {viewDoc && (
        <DocumentViewerModal viewDoc={viewDoc} onClose={() => setViewDoc(null)} />
      )}

      {showAddProject && (
        <AddProjectModal
          accounts={accounts}
          projectForm={projectForm}
          onSetProjectForm={setProjectForm}
          onSubmit={addProjectAction}
          onClose={() => setShowAddProject(false)}
        />
      )}

      {showAddCompany && (
        <AddCompanyModal
          editingCompanyId={editingCompanyId}
          companyForm={companyForm}
          onSetCompanyForm={setCompanyForm}
          onSubmit={saveCompany}
          onClose={resetCompanyForm}
        />
      )}

      {showForm && modalAccount && (
        <TransactionFormModal
          modalAccount={modalAccount}
          editingTxId={editingTxId}
          form={form}
          onSetForm={setForm}
          onSubmit={addTransaction}
          onClose={resetForm}
        />
      )}

      {confirmModal && confirmModal.show && (
        <ConfirmModal modal={confirmModal} onCancel={() => setConfirmModal(null)} />
      )}

      {showReminderModal && (
        <ReminderModal
          reminderForm={reminderForm}
          onSetReminderForm={setReminderForm}
          onSubmit={saveReminder}
          onClose={() => setShowReminderModal(false)}
        />
      )}
    </div>
  );
}
