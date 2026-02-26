
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useApp } from '@/app/AppContext';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/lib/hooks';
import { AccountType } from '@/types';

interface TagItem {
  id: string;
  name: string;
  type: string;
}

const SettingsView: React.FC = () => {
  const { selectedAccount } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('general');

  const subTabs = [
    { id: 'general', label: 'General' },
    { id: 'accounts', label: 'Trading Accounts' },
    { id: 'journal', label: 'Journal Settings' },
  ];

  // Fetch tags from API
  const { data: tagsResponse, refetch } = useTags({ account_id: selectedAccount?.id });
  const tagsData = tagsResponse?.tags || [];
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  // Fetch accounts from API
  const { data: accountsResponse, refetch: refetchAccounts } = useAccounts();
  const accountsData = accountsResponse?.accounts || [];
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  // Account modal state
  const [accountModal, setAccountModal] = useState<{
    isOpen: boolean;
    editingAccount?: {
      id: string;
      name: string;
      broker_name: string;
      base_currency: string;
    };
  } | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: '',
    broker_name: '',
    base_currency: 'USD',
    type: AccountType.DEMO,
  });

  // Group tags by type
  const [setups, setSetups] = useState<string[]>([]);
  const [generalTags, setGeneralTags] = useState<string[]>([]);
  const [exitTags, setExitTags] = useState<string[]>([]);
  const [processTags, setProcessTags] = useState<string[]>([]);

  useEffect(() => {
    if (tagsData.length > 0) {
      const setupsList = tagsData.filter((t: any) => t.type === 'SETUP').map((t: any) => t.name);
      const generalList = tagsData.filter((t: any) => t.type === 'GENERAL').map((t: any) => t.name);
      const exitList = tagsData.filter((t: any) => t.type === 'EXIT').map((t: any) => t.name);
      const processList = tagsData.filter((t: any) => t.type === 'PROCESS').map((t: any) => t.name);
      
      setSetups(setupsList);
      setGeneralTags(generalList);
      setExitTags(exitList);
      setProcessTags(processList);
    }
  }, [tagsData]);

  // Modal State for adding/editing tags
  const [tagModal, setTagModal] = useState<{
    isOpen: boolean;
    title: string;
    tagType: string;
    editingTag?: { id: string; name: string };
    onAdd: (name: string) => void;
  } | null>(null);
  const [newTagName, setNewTagName] = useState('');

  const openAddTagModal = (title: string, tagType: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setTagModal({
      isOpen: true,
      title: `Add ${title}`,
      tagType,
      onAdd: async (name: string) => {
        if (name && selectedAccount?.id) {
          try {
            await createTagMutation.mutateAsync({
              account_id: selectedAccount.id,
              name: name.toUpperCase(),
              type: tagType,
            });
            refetch();
          } catch (error) {
            console.error('Failed to create tag:', error);
          }
        }
      }
    });
  };

  const openEditTagModal = (tag: { id: string; name: string }, tagType: string) => {
    setTagModal({
      isOpen: true,
      title: 'Edit Tag',
      tagType,
      editingTag: tag,
      onAdd: async (name: string) => {
        if (name && selectedAccount?.id) {
          try {
            await updateTagMutation.mutateAsync({
              tagId: tag.id,
              data: { name: name.toUpperCase() },
            });
            refetch();
          } catch (error) {
            console.error('Failed to update tag:', error);
          }
        }
      }
    });
    setNewTagName(tag.name);
  };

  const handleAddTagConfirm = async () => {
    if (tagModal && newTagName.trim()) {
      await tagModal.onAdd(newTagName.trim());
      setNewTagName('');
      setTagModal(null);
    }
  };

  const removeTag = async (tag: string, tagType: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    // Find the tag ID from the data
    const tagItem = tagsData.find((t: any) => t.name === tag && t.type === tagType);
    if (tagItem) {
      try {
        await deleteTagMutation.mutateAsync(tagItem.id);
        setList(list.filter(t => t !== tag));
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl flex h-[calc(100vh-140px)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 shadow-sm">
      {/* Settings Navigation */}
      <div className="w-64 border-r border-slate-100 bg-slate-50/30 flex flex-col shrink-0">
        <div className="p-8">
           <h2 className="text-lg font-black text-slate-800 tracking-tight mb-8">Settings</h2>
           <nav className="space-y-1">
              {subTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === tab.id ? 'bg-white text-[#5e5ce6] shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab.label}
                </button>
              ))}
           </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
         {activeSubTab === 'general' && (
           <div className="max-w-2xl space-y-10">
              <section>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">General Preferences</h3>
                 <div className="space-y-6">
                    <ToggleField label="Dark Mode" description="Use dark interface colors for better night usage." defaultChecked={false} />
                    <ToggleField label="High Contrast" description="Make UI elements stand out more clearly." defaultChecked={true} />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Currency</label>
                       <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#5e5ce6]/20 transition-all">
                          <option>United States Dollar (USD)</option>
                          <option>Euro (EUR)</option>
                          <option>British Pound (GBP)</option>
                       </select>
                    </div>
                 </div>
              </section>

              <section className="pt-10 border-t border-slate-100">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Import & Export</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white border border-slate-200 p-6 rounded-2xl text-left hover:border-[#5e5ce6] transition-all group shadow-sm">
                       <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#5e5ce6] mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0l-4 4m4-4v12" /></svg>
                       </div>
                       <p className="text-xs font-black text-slate-800 mb-1">Export Data</p>
                       <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Download your trading history in CSV or JSON format.</p>
                    </button>
                    <button className="bg-white border border-slate-200 p-6 rounded-2xl text-left hover:border-[#5e5ce6] transition-all group shadow-sm">
                       <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#5e5ce6] mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4m0 0l4-4m-4 4V4" /></svg>
                       </div>
                       <p className="text-xs font-black text-slate-800 mb-1">Import History</p>
                       <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Sync your data from MT4, MT5, cTrader or Binance.</p>
                    </button>
                 </div>
              </section>
           </div>
         )}

         {activeSubTab === 'journal' && (
           <div className="max-w-3xl space-y-12">
              <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tag Management</h3>
                   <p className="text-[10px] text-slate-400 font-bold">Customize your logging dropdowns</p>
                 </div>

                 <div className="space-y-10">
                    <TagCategory
                      title="Trading Setups"
                      description="Specific technical or fundamental setups you trade."
                      tags={setups}
                      tagType="SETUP"
                      onAdd={() => openAddTagModal('Trading Setup', 'SETUP', setups, setSetups)}
                      onRemove={(tag: string) => removeTag(tag, 'SETUP', setups, setSetups)}
                      onEdit={(tag: { id: string; name: string }) => openEditTagModal(tag, 'SETUP')}
                      color="bg-indigo-50 text-indigo-600"
                    />

                    <TagCategory
                      title="General Tags"
                      description="Market conditions or environment tags."
                      tags={generalTags}
                      tagType="GENERAL"
                      onAdd={() => openAddTagModal('General Tag', 'GENERAL', generalTags, setGeneralTags)}
                      onRemove={(tag: string) => removeTag(tag, 'GENERAL', generalTags, setGeneralTags)}
                      onEdit={(tag: { id: string; name: string }) => openEditTagModal(tag, 'GENERAL')}
                      color="bg-slate-50 text-slate-600"
                    />

                    <TagCategory
                      title="Exit Tags"
                      description="Reasons for closing a trade."
                      tags={exitTags}
                      tagType="EXIT"
                      onAdd={() => openAddTagModal('Exit Tag', 'EXIT', exitTags, setExitTags)}
                      onRemove={(tag: string) => removeTag(tag, 'EXIT', exitTags, setExitTags)}
                      onEdit={(tag: { id: string; name: string }) => openEditTagModal(tag, 'EXIT')}
                      color="bg-rose-50 text-rose-600"
                    />

                    <TagCategory
                      title="Process Tags"
                      description="Behavioral or psychological assessment tags."
                      tags={processTags}
                      tagType="PROCESS"
                      onAdd={() => openAddTagModal('Process Tag', 'PROCESS', processTags, setProcessTags)}
                      onRemove={(tag: string) => removeTag(tag, 'PROCESS', processTags, setProcessTags)}
                      onEdit={(tag: { id: string; name: string }) => openEditTagModal(tag, 'PROCESS')}
                      color="bg-amber-50 text-amber-600"
                    />
                 </div>
              </section>

              <section className="pt-10 border-t border-slate-100">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Automated Rules</h3>
                 <div className="space-y-6">
                    <ToggleField label="Auto-calculate P&L" description="Automatically determine P&L from entry, exit, and quantity." defaultChecked={true} />
                    <ToggleField label="Require Notes" description="Prevent saving trades without commentary." defaultChecked={false} />
                 </div>
              </section>
           </div>
         )}

         {activeSubTab === 'accounts' && (
           <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Accounts</h3>
                 <button
                   onClick={() => setAccountModal({ isOpen: true })}
                   className="text-[#5e5ce6] text-xs font-black uppercase tracking-widest hover:underline"
                 >
                   + Link New Account
                 </button>
              </div>
              <div className="space-y-4">
                 {accountsData.length > 0 ? accountsData.map((acc: any) => (
                   <div key={acc.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:border-[#5e5ce6]/30 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-[#5e5ce6] group-hover:text-white transition-all">
                            {acc.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{acc.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{acc.type} • {acc.brokerName || 'No broker'}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button
                           onClick={() => {
                             setAccountForm({
                               name: acc.name,
                               broker_name: acc.brokerName || '',
                               base_currency: acc.baseCurrency || 'USD',
                               type: acc.type,
                             });
                             setAccountModal({ isOpen: true, editingAccount: acc });
                           }}
                           className="text-slate-300 hover:text-indigo-600 transition-colors p-2"
                           title="Edit account"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         </button>
                         <button
                           onClick={async () => {
                             if (confirm('Are you sure you want to delete this account?')) {
                               await deleteAccountMutation.mutateAsync(acc.id);
                               refetchAccounts();
                             }
                           }}
                           className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                           title="Delete account"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-8 text-slate-400">
                     <p className="text-sm font-bold">No accounts yet.</p>
                     <p className="text-xs mt-1">Click "+ Link New Account" to add one.</p>
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>

      {/* Tag Add/Edit Modal */}
      <Modal
        isOpen={!!tagModal}
        onClose={() => {
          setTagModal(null);
          setNewTagName('');
        }}
        title={tagModal?.title || 'Tag'}
        maxWidth="max-w-md"
      >
        <div className="p-8 space-y-6">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                {tagModal?.editingTag ? 'Edit Tag Name' : 'Tag Name'}
              </label>
              <input
                autoFocus
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTagConfirm()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                placeholder="Enter unique tag name..."
              />
           </div>
           <div className="flex gap-4">
              <button
                onClick={() => {
                  setTagModal(null);
                  setNewTagName('');
                }}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTagConfirm}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                {tagModal?.editingTag ? 'Save Changes' : 'Add Tag'}
              </button>
           </div>
        </div>
      </Modal>

      {/* Account Add/Edit Modal */}
      <Modal
        isOpen={!!accountModal}
        onClose={() => {
          setAccountModal(null);
          setAccountForm({ name: '', broker_name: '', base_currency: 'USD', type: AccountType.DEMO });
        }}
        title={accountModal?.editingAccount ? 'Edit Account' : 'Add Trading Account'}
        maxWidth="max-w-md"
      >
        <div className="p-8 space-y-6">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Account Name</label>
              <input 
                autoFocus
                type="text"
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                placeholder="e.g., My Demo Account"
              />
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Broker Name</label>
              <input 
                type="text"
                value={accountForm.broker_name}
                onChange={(e) => setAccountForm({ ...accountForm, broker_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                placeholder="e.g., Binance, FTMO, IC Markets"
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Base Currency</label>
                <select 
                  value={accountForm.base_currency}
                  onChange={(e) => setAccountForm({ ...accountForm, base_currency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Account Type</label>
                <select 
                  value={accountForm.type}
                  onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as AccountType })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                >
                  <option value={AccountType.DEMO}>Demo</option>
                  <option value={AccountType.LIVE}>Live</option>
                  <option value={AccountType.PROP}>Prop</option>
                </select>
              </div>
           </div>
           <div className="flex gap-4 pt-4">
              <button 
                onClick={() => {
                  setAccountModal(null);
                  setAccountForm({ name: '', broker_name: '', base_currency: 'USD', type: AccountType.DEMO });
                }}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!accountForm.name.trim()) {
                    alert('Please enter an account name');
                    return;
                  }
                  try {
                    if (accountModal?.editingAccount) {
                      await updateAccountMutation.mutateAsync({
                        accountId: accountModal.editingAccount.id,
                        data: {
                          name: accountForm.name,
                          broker_name: accountForm.broker_name,
                          base_currency: accountForm.base_currency,
                        },
                      });
                    } else {
                      await createAccountMutation.mutateAsync({
                        name: accountForm.name,
                        broker_name: accountForm.broker_name,
                        base_currency: accountForm.base_currency,
                        type: accountForm.type,
                      });
                    }
                    refetchAccounts();
                    setAccountModal(null);
                    setAccountForm({ name: '', broker_name: '', base_currency: 'USD', type: AccountType.DEMO });
                  } catch (error) {
                    console.error('Failed to save account:', error);
                    alert('Failed to save account. Please try again.');
                  }
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                {accountModal?.editingAccount ? 'Save Changes' : 'Add Account'}
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

const TagCategory = ({ title, description, tags, tagType, onAdd, onRemove, onEdit, color }: any) => (
  <div className="space-y-4">
     <div className="flex justify-between items-end">
        <div>
           <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{title}</p>
           <p className="text-[10px] text-slate-400 font-medium">{description}</p>
        </div>
        <button
          onClick={onAdd}
          className="text-[10px] font-black text-[#5e5ce6] uppercase tracking-widest hover:underline"
        >
          + Add New
        </button>
     </div>
     <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <div key={tag} className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-default ${color}`}>
             <span className="text-[10px] font-black tracking-widest">{tag}</span>
             <button
               onClick={() => onEdit && onEdit({ id: tag, name: tag })}
               className="text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
               title="Edit tag"
             >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </button>
             <button
               onClick={() => onRemove(tag)}
               className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
               title="Delete tag"
             >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-[10px] text-slate-300 italic">No tags yet. Click "+ Add New" to create one.</p>
        )}
     </div>
  </div>
);

const ToggleField = ({ label, description, defaultChecked }: any) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between group">
       <div className="flex-1 pr-8">
          <p className="text-sm font-black text-slate-800 mb-0.5 tracking-tight">{label}</p>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{description}</p>
       </div>
       <button 
         onClick={() => setChecked(!checked)}
         className={`w-12 h-6 rounded-full relative transition-all ${checked ? 'bg-[#5e5ce6]' : 'bg-slate-200'}`}
       >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
       </button>
    </div>
  );
};

export default SettingsView;
