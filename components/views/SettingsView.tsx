
import React, { useState } from 'react';
import Modal from '../Modal';

const SettingsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('general');

  const subTabs = [
    { id: 'general', label: 'General' },
    { id: 'accounts', label: 'Trading Accounts' },
    { id: 'journal', label: 'Journal Settings' },
  ];

  const [setups, setSetups] = useState(['BREAKOUT', 'PULLBACK', 'REVERSAL', 'MEAN REVERSION', 'VWAP BOUNCE']);
  const [generalTags, setGeneralTags] = useState(['TREND', 'COUNTER-TREND', 'HIGH VOLATILITY', 'FOMO', 'NEWS EVENT']);
  const [exitTags, setExitTags] = useState(['TARGET HIT', 'STOP HIT', 'TRAILED STOP', 'END OF SESSION', 'MANUAL CLOSE']);
  const [processTags, setProcessTags] = useState(['FOLLOWED PLAN', 'EMOTIONAL', 'EARLY EXIT', 'HESITATION', 'PERFECT EXECUTION']);

  // Modal State for adding tags
  const [tagModal, setTagModal] = useState<{ isOpen: boolean; title: string; onAdd: (name: string) => void } | null>(null);
  const [newTagName, setNewTagName] = useState('');

  const openAddTagModal = (title: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setTagModal({
      isOpen: true,
      title: `Add ${title}`,
      onAdd: (name: string) => {
        if (name && !list.includes(name.toUpperCase())) {
          setList([...list, name.toUpperCase()]);
        }
      }
    });
  };

  const handleAddTagConfirm = () => {
    if (tagModal && newTagName.trim()) {
      tagModal.onAdd(newTagName.trim());
      setNewTagName('');
      setTagModal(null);
    }
  };

  const removeTag = (tag: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(list.filter(t => t !== tag));
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
                      onAdd={() => openAddTagModal('Trading Setup', setups, setSetups)}
                      onRemove={(tag: string) => removeTag(tag, setups, setSetups)}
                      color="bg-indigo-50 text-indigo-600"
                    />

                    <TagCategory 
                      title="General Tags" 
                      description="Market conditions or environment tags." 
                      tags={generalTags} 
                      onAdd={() => openAddTagModal('General Tag', generalTags, setGeneralTags)}
                      onRemove={(tag: string) => removeTag(tag, generalTags, setGeneralTags)}
                      color="bg-slate-50 text-slate-600"
                    />

                    <TagCategory 
                      title="Exit Tags" 
                      description="Reasons for closing a trade." 
                      tags={exitTags} 
                      onAdd={() => openAddTagModal('Exit Tag', exitTags, setExitTags)}
                      onRemove={(tag: string) => removeTag(tag, exitTags, setExitTags)}
                      color="bg-rose-50 text-rose-600"
                    />

                    <TagCategory 
                      title="Process Tags" 
                      description="Behavioral or psychological assessment tags." 
                      tags={processTags} 
                      onAdd={() => openAddTagModal('Process Tag', processTags, setProcessTags)}
                      onRemove={(tag: string) => removeTag(tag, processTags, setProcessTags)}
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
                 <button className="text-[#5e5ce6] text-xs font-black uppercase tracking-widest">+ Link New Account</button>
              </div>
              <div className="space-y-4">
                 {[
                   { name: 'Demo Account', type: 'Paper', status: 'Connected', icon: 'P' },
                   { name: 'FTMO Challenge #1', type: 'Prop', status: 'Connected', icon: 'F' },
                   { name: 'Binance Personal', type: 'Live', status: 'Re-sync required', icon: 'B' },
                 ].map((acc, i) => (
                   <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:border-[#5e5ce6]/30 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-[#5e5ce6] group-hover:text-white transition-all">
                            {acc.icon}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{acc.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{acc.type} • {acc.status}</p>
                         </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-600 transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066" /></svg>
                      </button>
                   </div>
                 ))}
              </div>
           </div>
         )}
      </div>

      {/* Tag Add Modal */}
      <Modal 
        isOpen={!!tagModal} 
        onClose={() => setTagModal(null)} 
        title={tagModal?.title || 'Add Tag'}
        maxWidth="max-w-md"
      >
        <div className="p-8 space-y-6">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tag Name</label>
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
                onClick={() => setTagModal(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTagConfirm}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                Add Tag
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

const TagCategory = ({ title, description, tags, onAdd, onRemove, color }: any) => (
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
               onClick={() => onRemove(tag)}
               className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
             >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        ))}
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
