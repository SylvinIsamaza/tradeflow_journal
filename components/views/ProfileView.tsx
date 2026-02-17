
import React, { useState } from 'react';
import Modal from '../Modal.tsx';

type ActiveModal = 'edit' | 'password' | 'deactivate' | null;

const ProfileView: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [profileData, setProfileData] = useState({
    name: "Felix 'The Bull' Trader",
    location: "New York, USA",
    email: "felix@tradezella.com",
    timezone: "UTC-5 (EST)",
    bio: "Focused on intraday supply and demand zones. Trading since 2021."
  });

  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleDeactivate = () => {
    const code = otpValue.join('');
    if (code === '123456') {
      setIsAccountDeleted(true);
      setActiveModal(null);
    } else {
      alert('Invalid OTP. Hint: 123456');
    }
  };

  const closeModal = () => setActiveModal(null);

  if (isAccountDeleted) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-[32px] border border-slate-200 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Account Deactivated</h2>
        <p className="text-slate-500 font-medium">Your account and all associated data have been queued for deletion. It was a pleasure trading with you.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
       
       {/* Header Card */}
       <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
             <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
          </div>
          <div className="px-8 pb-8">
             <div className="relative -mt-16 mb-6 flex items-end gap-6 flex-wrap sm:flex-nowrap">
                <div className="w-32 h-32 rounded-[24px] border-4 border-white bg-slate-100 overflow-hidden shadow-xl shrink-0">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="pb-2 flex-1 min-w-[200px]">
                   <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profileData.name}</h2>
                   <p className="text-slate-400 font-bold text-sm">Joined June 2024 • Pro Member</p>
                </div>
                <div className="flex gap-3 pb-2 w-full sm:w-auto">
                   <button onClick={() => setActiveModal('edit')} className="bg-[#5e5ce6] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 transition-all">Edit Profile</button>
                   <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Share Journey</button>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <ProfileStat label="Total Trades" value="1,248" color="text-[#5e5ce6]" />
                <ProfileStat label="Win Rate" value="62.4%" color="text-emerald-500" />
                <ProfileStat label="Streak" value="5 Wins" color="text-orange-500" />
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Personal Information</h3>
             <div className="space-y-6">
                <ProfileField label="Full Name" value={profileData.name} />
                <ProfileField label="Email Address" value={profileData.email} />
                <ProfileField label="Location" value={profileData.location} />
                <ProfileField label="Timezone" value={profileData.timezone} />
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Security & Login</h3>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-xs font-black text-slate-800 tracking-tight">Two-Factor Authentication</p>
                      <p className="text-[10px] text-slate-400 font-medium">Secured with Google Authenticator</p>
                   </div>
                   <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Enabled</span>
                </div>
                <button onClick={() => setActiveModal('password')} className="w-full bg-slate-50 border border-slate-200 py-3 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all">Change Password</button>
                <button onClick={() => setActiveModal('deactivate')} className="w-full text-rose-500 text-xs font-black uppercase tracking-widest py-3 border border-transparent hover:border-rose-100 rounded-xl transition-all">Deactivate Account</button>
             </div>
          </div>
       </div>

       {/* Edit Profile Modal */}
       <Modal 
         isOpen={activeModal === 'edit'} 
         onClose={closeModal} 
         title="Edit Public Profile"
       >
         <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <EditField label="Full Name" value={profileData.name} onChange={(v: string) => setProfileData({...profileData, name: v})} />
               <EditField label="Email Address" value={profileData.email} onChange={(v: string) => setProfileData({...profileData, email: v})} />
               <EditField label="Location" value={profileData.location} onChange={(v: string) => setProfileData({...profileData, location: v})} />
               <EditField label="Timezone" value={profileData.timezone} onChange={(v: string) => setProfileData({...profileData, timezone: v})} />
               <div className="sm:col-span-2">
                 <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 block">Bio / Strategy Description</label>
                 <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#5e5ce6]/20 min-h-[100px]"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                 />
               </div>
            </div>
            <div className="flex gap-4">
              <button onClick={closeModal} className="flex-1 bg-[#5e5ce6] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Changes</button>
              <button onClick={closeModal} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
            </div>
         </div>
       </Modal>

       {/* Change Password Modal */}
       <Modal 
         isOpen={activeModal === 'password'} 
         onClose={closeModal} 
         title="Update Security Password"
       >
         <div className="p-8 space-y-6">
            <EditField label="Current Password" type="password" placeholder="••••••••" />
            <EditField label="New Password" type="password" placeholder="Enter new password" />
            <EditField label="Confirm New Password" type="password" placeholder="Confirm new password" />
            <div className="space-y-3 pt-4">
              <button onClick={closeModal} className="w-full bg-[#5e5ce6] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">Update Password</button>
              <button onClick={closeModal} className="w-full bg-slate-50 text-slate-400 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Keep Current Password</button>
            </div>
         </div>
       </Modal>

       {/* Deactivate Account Modal */}
       <Modal 
         isOpen={activeModal === 'deactivate'} 
         onClose={closeModal} 
         title="Confirm Deactivation"
       >
         <div className="p-8 sm:p-12 space-y-10">
            <div className="text-center space-y-4">
               <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <p className="text-slate-500 font-medium">Please enter the 6-digit OTP sent to your email to confirm deletion.</p>
            </div>
            
            <div className="flex justify-center gap-2 sm:gap-4">
              {otpValue.map((digit, idx) => (
                <input 
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  className="w-10 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-rose-600 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                />
              ))}
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleDeactivate}
                className="w-full bg-rose-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all"
              >
                Confirm Deactivation
              </button>
              <button 
                onClick={closeModal}
                className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                I changed my mind
              </button>
            </div>
         </div>
       </Modal>
    </div>
  );
};

const ProfileStat = ({ label, value, color }: any) => (
  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
  </div>
);

const ProfileField = ({ label, value }: any) => (
  <div className="group">
     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">{label}</p>
     <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);

const EditField = ({ label, value, onChange, type = "text", placeholder }: any) => (
  <div>
     <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 block">{label}</label>
     <input 
      type={type}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#5e5ce6]/20 transition-all"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
     />
  </div>
);

export default ProfileView;
