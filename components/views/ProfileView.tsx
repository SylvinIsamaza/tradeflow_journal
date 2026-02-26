 import React, { useState, useEffect } from "react";
 import Modal from "../Modal";
 import { useCurrentUser, useChangePassword } from "@/lib/hooks";
 import { authApi } from "@/lib/api/auth";
 
 type ActiveModal =
   | "edit"
   | "password"
   | "deactivate"
   | "timezone"
   | "auth"
   | null;
 
 const ProfileView: React.FC = () => {
   const { data: user, isLoading, refetch } = useCurrentUser();
   const changePasswordMutation = useChangePassword();
   
   const [activeModal, setActiveModal] = useState<ActiveModal>(null);
   const [profileData, setProfileData] = useState({
     name: "",
     location: "",
     email: "",
     timezone: "",
     bio: "",
   });
   const [passwordData, setPasswordData] = useState({
     current: "",
     new: "",
     confirm: "",
   });
 
   const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
   const [isAccountDeleted, setIsAccountDeleted] = useState(false);
   const [is2FAEnabled, setIs2FAEnabled] = useState(false);
   const [is2FASetupMode, setIs2FASetupMode] = useState(false);
   const [tempAuthSecret, setTempAuthSecret] = useState("");
   const [tempQrUrl, setTempQrUrl] = useState("");
   const [backupCodes, setBackupCodes] = useState<string[]>([]);
   const [showBackupCodes, setShowBackupCodes] = useState(false);
   const [disablePassword, setDisablePassword] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   useEffect(() => {
     if (user) {
       setProfileData({
         name: user.name || "",
         location: user.location || "",
         email: user.email || "",
         timezone: user.timezone || "America/New_York",
         bio: user.bio || "",
       });
       setIs2FAEnabled(user.is_two_factor_enabled || false);
     }
   }, [user]);
 
   const handleUpdateProfile = async () => {
     try {
       // Use privateClient to update profile via PUT /users/me
       const { privateClient } = await import('@/lib/api/axios');
       await privateClient.put('/users/me', {
         name: profileData.name,
         location: profileData.location,
         timezone: profileData.timezone,
         bio: profileData.bio,
       });
       await refetch();
       closeModal();
     } catch (error) {
       alert('Failed to update profile');
     }
   };
 
   const handleChangePassword = async () => {
     if (passwordData.new !== passwordData.confirm) {
       alert('Passwords do not match');
       return;
     }
     setIsSubmitting(true);
     try {
       const result = await authApi.changePassword(passwordData.current, passwordData.new);
       if (result.success) {
         setPasswordData({ current: "", new: "", confirm: "" });
         closeModal();
         alert('Password changed successfully');
       } else {
         alert(result.error || 'Failed to change password');
       }
     } catch (error) {
       alert('Failed to change password');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const timezones = [
     // North America
     "America/New_York",
     "America/Chicago",
     "America/Denver",
     "America/Los_Angeles",
     "America/Phoenix",
     "America/Anchorage",
     "America/Toronto",
     "America/Vancouver",
     "America/Mexico_City",
     // Europe
     "Europe/London",
     "Europe/Paris",
     "Europe/Berlin",
     "Europe/Madrid",
     "Europe/Rome",
     "Europe/Amsterdam",
     "Europe/Brussels",
     "Europe/Vienna",
     "Europe/Zurich",
     "Europe/Stockholm",
     "Europe/Oslo",
     "Europe/Warsaw",
     "Europe/Prague",
     "Europe/Athens",
     "Europe/Helsinki",
     "Europe/Dublin",
     "Europe/Lisbon",
     // Asia
     "Asia/Tokyo",
     "Asia/Shanghai",
     "Asia/Hong_Kong",
     "Asia/Singapore",
     "Asia/Seoul",
     "Asia/Mumbai",
     "Asia/Dubai",
     "Asia/Bangkok",
     "Asia/Jakarta",
     "Asia/Manila",
     "Asia/Kuala_Lumpur",
     "Asia/Taipei",
     "Asia/Ho_Chi_Minh",
     "Asia/Kolkata",
     // Australia/Pacific
     "Australia/Sydney",
     "Australia/Melbourne",
     "Australia/Brisbane",
     "Australia/Perth",
     "Australia/Adelaide",
     "Pacific/Auckland",
     "Pacific/Honolulu",
     "Pacific/Fiji",
     // Africa
     "Africa/Cairo",
     "Africa/Johannesburg",
     "Africa/Lagos",
     "Africa/Nairobi",
     "Africa/Casablanca",
     // South America
     "America/Sao_Paulo",
     "America/Buenos_Aires",
     "America/Bogota",
     "America/Lima",
     "America/Santiago",
     // UTC
     "UTC",
   ];
 
   const getTimezoneDisplay = (tz: string) => {
     const tzMap: Record<string, string> = {
       // North America
       "America/New_York": "UTC-5 (EST)",
       "America/Chicago": "UTC-6 (CST)",
       "America/Denver": "UTC-7 (MST)",
       "America/Los_Angeles": "UTC-8 (PST)",
       "America/Phoenix": "UTC-7 (MST)",
       "America/Anchorage": "UTC-9 (AKST)",
       "America/Toronto": "UTC-5 (EST)",
       "America/Vancouver": "UTC-8 (PST)",
       "America/Mexico_City": "UTC-6 (CST)",
       // Europe
       "Europe/London": "UTC+0 (GMT)",
       "Europe/Paris": "UTC+1 (CET)",
       "Europe/Berlin": "UTC+1 (CET)",
       "Europe/Madrid": "UTC+1 (CET)",
       "Europe/Rome": "UTC+1 (CET)",
       "Europe/Amsterdam": "UTC+1 (CET)",
       "Europe/Brussels": "UTC+1 (CET)",
       "Europe/Vienna": "UTC+1 (CET)",
       "Europe/Zurich": "UTC+1 (CET)",
       "Europe/Stockholm": "UTC+1 (CET)",
       "Europe/Oslo": "UTC+1 (CET)",
       "Europe/Warsaw": "UTC+1 (CET)",
       "Europe/Prague": "UTC+1 (CET)",
       "Europe/Athens": "UTC+2 (EET)",
       "Europe/Helsinki": "UTC+2 (EET)",
       "Europe/Dublin": "UTC+0 (GMT)",
       "Europe/Lisbon": "UTC+0 (WET)",
       // Asia
       "Asia/Tokyo": "UTC+9 (JST)",
       "Asia/Shanghai": "UTC+8 (CST)",
       "Asia/Hong_Kong": "UTC+8 (HKT)",
       "Asia/Singapore": "UTC+8 (SGT)",
       "Asia/Seoul": "UTC+9 (KST)",
       "Asia/Mumbai": "UTC+5:30 (IST)",
       "Asia/Dubai": "UTC+4 (GST)",
       "Asia/Bangkok": "UTC+7 (ICT)",
       "Asia/Jakarta": "UTC+7 (WIB)",
       "Asia/Manila": "UTC+8 (PHT)",
       "Asia/Kuala_Lumpur": "UTC+8 (MYT)",
       "Asia/Taipei": "UTC+8 (TST)",
       "Asia/Ho_Chi_Minh": "UTC+7 (ICT)",
       "Asia/Kolkata": "UTC+5:30 (IST)",
       // Australia/Pacific
       "Australia/Sydney": "UTC+10 (AEDT)",
       "Australia/Melbourne": "UTC+10 (AEDT)",
       "Australia/Brisbane": "UTC+10 (AEST)",
       "Australia/Perth": "UTC+8 (AWST)",
       "Australia/Adelaide": "UTC+9:30 (ACDT)",
       "Pacific/Auckland": "UTC+12 (NZDT)",
       "Pacific/Honolulu": "UTC-10 (HST)",
       "Pacific/Fiji": "UTC+12 (FJT)",
       // Africa
       "Africa/Cairo": "UTC+2 (EET)",
       "Africa/Johannesburg": "UTC+2 (SAST)",
       "Africa/Lagos": "UTC+1 (WAT)",
       "Africa/Nairobi": "UTC+3 (EAT)",
       "Africa/Casablanca": "UTC+1 (WET)",
       // South America
       "America/Sao_Paulo": "UTC-3 (BRT)",
       "America/Buenos_Aires": "UTC-3 (ART)",
       "America/Bogota": "UTC-5 (COT)",
       "America/Lima": "UTC-5 (PET)",
       "America/Santiago": "UTC-3 (CLT)",
       // UTC
       "UTC": "UTC+0",
     };
     return tzMap[tz] || tz;
   };
 
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
 
   const handleSetup2FA = async () => {
     setIsSubmitting(true);
     setShowBackupCodes(false);
     setIs2FASetupMode(true);
     try {
       const result = await authApi.setup2FA();
       if (result.success && result.secret && result.qr_code_url) {
         setTempAuthSecret(result.secret);
         setTempQrUrl(result.qr_code_url);
         setBackupCodes(result.backup_codes || []);
         setActiveModal("auth");
       } else {
         alert(result.error || 'Failed to setup 2FA');
         setIs2FASetupMode(false);
       }
     } catch (error) {
       alert('Failed to setup 2FA');
       setIs2FASetupMode(false);
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleEnable2FA = async () => {
     const code = otpValue.join("");
     if (!code) {
       alert('Please enter the verification code');
       return;
     }
     setIsSubmitting(true);
     try {
       const result = await authApi.enable2FA(code);
       if (result.success) {
         // Show backup codes instead of closing immediately
         if (result.backup_codes && result.backup_codes.length > 0) {
           setBackupCodes(result.backup_codes);
           setShowBackupCodes(true);
           setIs2FAEnabled(true);
           setIs2FASetupMode(false);
         } else {
           setIs2FAEnabled(true);
           setIs2FASetupMode(false);
           setOtpValue(["", "", "", "", "", ""]);
           setTempAuthSecret("");
           setTempQrUrl("");
           closeModal();
           alert('2FA enabled successfully');
         }
         refetch();
       } else {
         alert(result.error || 'Failed to enable 2FA');
       }
     } catch (error) {
       alert('Failed to enable 2FA');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleDisable2FA = async () => {
     if (!disablePassword) {
       alert('Please enter your password');
       return;
     }
     setIsSubmitting(true);
     try {
       const result = await authApi.disable2FA(disablePassword);
       if (result.success) {
         setIs2FAEnabled(false);
         setDisablePassword("");
         closeModal();
         alert('2FA disabled successfully');
         refetch();
       } else {
         alert(result.error || 'Failed to disable 2FA');
       }
     } catch (error) {
       alert('Failed to disable 2FA');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleDeactivate = async () => {
     setIsSubmitting(true);
     try {
       const result = await authApi.deactivateAccount();
       if (result.success) {
         setIsAccountDeleted(true);
         setActiveModal(null);
       } else {
         alert(result.error || 'Failed to deactivate account');
       }
     } catch (error) {
       alert('Failed to deactivate account');
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const closeModal = () => {
     setActiveModal(null);
     setOtpValue(["", "", "", "", "", ""]);
     setTempAuthSecret("");
     setTempQrUrl("");
     setBackupCodes([]);
     setShowBackupCodes(false);
     setDisablePassword("");
     setIs2FASetupMode(false);
   };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAccountDeleted) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-[32px] border border-slate-200 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Account Deactivated
        </h2>
        <p className="text-slate-500 font-medium">
          Your account and all associated data have been queued for deletion. It
          was a pleasure trading with you.
        </p>
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex items-end gap-6 flex-wrap sm:flex-nowrap">
            <div className="w-32 h-32 rounded-[24px] border-4 border-white bg-slate-100 overflow-hidden shadow-xl shrink-0">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pb-2 flex-1 min-w-[200px]">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {profileData.name}
              </h2>
              <p className="text-slate-400 font-bold text-sm">
                Joined June 2024 • Pro Member
              </p>
            </div>
            <div className="flex gap-3 pb-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveModal("edit")}
                className="bg-[#5e5ce6] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 transition-all"
              >
                Edit Profile
              </button>
              <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                Share Journey
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <ProfileStat
              label="Total Trades"
              value="1,248"
              color="text-[#5e5ce6]"
            />
            <ProfileStat
              label="Win Rate"
              value="62.4%"
              color="text-emerald-500"
            />
            <ProfileStat
              label="Streak"
              value="5 Wins"
              color="text-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">
            Personal Information
          </h3>
          <div className="space-y-6">
            <ProfileField label="Full Name" value={profileData.name} />
            <ProfileField label="Email Address" value={profileData.email} />
            <ProfileField label="Location" value={profileData.location} />
            <ProfileField
              label="Timezone"
              value={getTimezoneDisplay(profileData.timezone)}
            />
            <button
              onClick={() => setActiveModal("timezone")}
              className="text-[10px] font-black text-[#5e5ce6] hover:underline mt-2"
            >
              Change Timezone →
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">
            Security & Login
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-800 tracking-tight">
                  Two-Factor Authentication
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {is2FAEnabled
                    ? "Secured with Google Authenticator"
                    : "Not configured"}
                </p>
              </div>
              <span
                className={`${is2FAEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"} px-3 py-1 rounded-full text-[9px] font-black uppercase`}
              >
                {is2FAEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <button
              onClick={() => {
                if (!is2FAEnabled) {
                  handleSetup2FA();
                } else {
                  setIs2FASetupMode(false);
                  setActiveModal("auth");
                }
              }}
              className={`w-full ${is2FAEnabled ? "text-rose-500 border-rose-100 hover:border-rose-200" : "bg-slate-50 border-slate-200"} border py-3 rounded-xl text-xs font-black ${is2FAEnabled ? "text-slate-600" : ""} uppercase tracking-widest hover:bg-slate-100 transition-all`}
            >
              {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
            </button>
            <button
              onClick={() => setActiveModal("password")}
              className="w-full bg-slate-50 border border-slate-200 py-3 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveModal("deactivate")}
              className="w-full text-rose-500 text-xs font-black uppercase tracking-widest py-3 border border-transparent hover:border-rose-100 rounded-xl transition-all"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {/* Timezone Selection Modal */}
      <Modal
        isOpen={activeModal === "timezone"}
        onClose={closeModal}
        title="Select Timezone"
      >
        <div className="p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {timezones.map((tz) => (
              <button
                key={tz}
                onClick={async () => {
                  setProfileData({ ...profileData, timezone: tz });
                  try {
                    const { privateClient } = await import('@/lib/api/axios');
                    await privateClient.put('/users/me', {
                      timezone: tz,
                    });
                    await refetch();
                  } catch (error) {
                    console.error('Failed to update timezone:', error);
                  }
                  closeModal();
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all font-bold text-sm ${
                  profileData.timezone === tz
                    ? "bg-[#5e5ce6] text-white border-[#5e5ce6]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {tz}
                <div
                  className={`text-xs ${profileData.timezone === tz ? "text-indigo-100" : "text-slate-500"}`}
                >
                  {getTimezoneDisplay(tz)}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={closeModal}
            className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-4"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* 2FA Setup/Disable Modal */}
      <Modal
        isOpen={activeModal === "auth"}
        onClose={closeModal}
        title={
          is2FAEnabled && !is2FASetupMode && !showBackupCodes
            ? "Disable Two-Factor Authentication"
            : "Enable Two-Factor Authentication"
        }
      >
        <div className="p-8 space-y-8">
          {is2FASetupMode || showBackupCodes ? (
            <>
              {showBackupCodes ? (
                // Show backup codes after successful enable
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <p className="text-sm text-emerald-800 font-bold mb-2">
                      ✅ 2FA Enabled Successfully!
                    </p>
                    <p className="text-xs text-emerald-700">
                      Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Backup Codes
                      </label>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(backupCodes.join('\n'));
                          alert('Backup codes copied to clipboard!');
                        }}
                        className="text-[10px] font-black text-[#5e5ce6] hover:underline"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, idx) => (
                        <code key={idx} className="font-mono text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 text-center">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIs2FAEnabled(true);
                        setOtpValue(["", "", "", "", "", ""]);
                        setTempAuthSecret("");
                        setTempQrUrl("");
                        setBackupCodes([]);
                        setShowBackupCodes(false);
                        closeModal();
                      }}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      I've Saved My Backup Codes
                    </button>
                  </div>
                </div>
              ) : (
                // 2FA Setup flow
                <>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-sm text-blue-800 font-bold mb-2">
                        How it works:
                      </p>
                      <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Download Google Authenticator or Authy</li>
                        <li>Scan the QR code below or enter the secret key</li>
                        <li>Enter the 6-digit code to confirm setup</li>
                      </ol>
                    </div>

                    <div className="bg-slate-100 p-8 rounded-2xl flex items-center justify-center">
                      <div className="bg-white p-4 rounded-xl border-4 border-slate-300">
                        {/* QR Code - rendered from URL if available */}
                        {tempQrUrl ? (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(tempQrUrl)}`}
                            alt="2FA QR Code"
                            className="w-40 h-40"
                          />
                        ) : (
                          <div className="w-40 h-40 bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold text-center">
                            QR Code
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Manual Entry Key (if QR won't scan)
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                        <code className="font-mono text-sm font-black text-slate-700">
                          {tempAuthSecret}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tempAuthSecret);
                            alert('Secret key copied!');
                          }}
                          className="text-[#5e5ce6] hover:text-[#4d4acb] transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <EditField
                      label="Enter 6-Digit Code"
                      placeholder="000000"
                      type="text"
                      maxLength="6"
                      value={otpValue.join("")}
                      onChange={(v: string) => {
                        const newOtp = v.slice(0, 6).split("").concat(Array(6).fill("")).slice(0, 6);
                        setOtpValue(newOtp);
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleEnable2FA}
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm & Enable 2FA'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="w-full bg-slate-50 text-slate-400 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <p className="text-sm text-rose-800 font-bold mb-2">Warning</p>
                <p className="text-xs text-rose-700">
                  Disabling 2FA will make your account less secure. You'll only
                  need your password to log in.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDisable2FA}
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Disable 2FA'}
                </button>
                <button
                  onClick={closeModal}
                  className="w-full bg-slate-50 text-slate-400 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Keep 2FA Enabled
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={activeModal === "edit"}
        onClose={closeModal}
        title="Edit Public Profile"
      >
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <EditField
              label="Full Name"
              value={profileData.name}
              onChange={(v: string) =>
                setProfileData({ ...profileData, name: v })
              }
            />
            <EditField
              label="Email Address"
              value={profileData.email}
              onChange={(v: string) =>
                setProfileData({ ...profileData, email: v })
              }
            />
            <EditField
              label="Location"
              value={profileData.location}
              onChange={(v: string) =>
                setProfileData({ ...profileData, location: v })
              }
            />
            <EditField
              label="Timezone"
              value={profileData.timezone}
              onChange={(v: string) =>
                setProfileData({ ...profileData, timezone: v })
              }
            />
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 block">
                Bio / Strategy Description
              </label>
              <textarea
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#5e5ce6]/20 min-h-[100px]"
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleUpdateProfile}
              className="flex-1 bg-[#5e5ce6] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Save Changes
            </button>
            <button
              onClick={closeModal}
              className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={activeModal === "password"}
        onClose={closeModal}
        title="Update Security Password"
      >
        <div className="p-8 space-y-6">
          <EditField
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={passwordData.current}
            onChange={(v: string) => setPasswordData({ ...passwordData, current: v })}
          />
          <EditField
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={passwordData.new}
            onChange={(v: string) => setPasswordData({ ...passwordData, new: v })}
          />
          <EditField
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={passwordData.confirm}
            onChange={(v: string) => setPasswordData({ ...passwordData, confirm: v })}
          />
          <div className="space-y-3 pt-4">
            <button
              onClick={handleChangePassword}
              className="w-full bg-[#5e5ce6] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
            >
              Update Password
            </button>
            <button
              onClick={closeModal}
              className="w-full bg-slate-50 text-slate-400 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Keep Current Password
            </button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Account Modal */}
      <Modal
        isOpen={activeModal === "deactivate"}
        onClose={closeModal}
        title="Confirm Deactivation"
      >
        <div className="p-8 sm:p-12 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">
              Please enter the 6-digit OTP sent to your email to confirm
              deletion.
            </p>
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
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
  </div>
);

const ProfileField = ({ label, value }: any) => (
  <div className="group">
    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">
      {label}
    </p>
    <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);

const EditField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 block">
      {label}
    </label>
    <input
      type={type}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#5e5ce6]/20 transition-all"
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

export default ProfileView;
