import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, ShieldCheck, Lock, Sparkles, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ease = [0.22, 1, 0.36, 1] as const;

interface FlowSignInProps {
  onLoginSuccess: (token: string, user: any, mustChangePassword?: boolean) => void;
  onForgotPassword?: () => void;
  apiBase?: string;
}

export const FlowSignIn: React.FC<FlowSignInProps> = ({
  onLoginSuccess,
  apiBase = "/api/v1",
}) => {
  const { isDark } = useTheme();

  // Form State
  const [email, setEmail] = useState("ayush@admin");
  const [password, setPassword] = useState("admin");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forced First-Login Password Change State
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [tempUser, setTempUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Invalid authentication credentials.");
      }

      // Check if user must change password (e.g. initial development administrator)
      if (data.must_change_password) {
        setTempToken(data.access_token);
        setTempUser(data);
        setShowPasswordChangeModal(true);
        setLoading(false);
        return;
      }

      onLoginSuccess(data.access_token, data, false);
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changingPassword || !tempToken) return;

    setChangeError(null);

    if (newPassword.length < 6) {
      setChangeError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("Passwords do not match.");
      return;
    }
    if (newPassword === "admin") {
      setChangeError("New password cannot be the default password 'admin'.");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch(`${apiBase}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          old_password: password,
          new_password: newPassword
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to update password.");
      }

      setShowPasswordChangeModal(false);
      onLoginSuccess(data.access_token || tempToken, tempUser, false);
    } catch (err: any) {
      setChangeError(err.message || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading || !forgotEmail) return;

    setForgotLoading(true);
    setForgotStatus(null);

    try {
      const res = await fetch(`${apiBase}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json().catch(() => ({}));
      setForgotStatus(data.message || "Password reset instructions have been generated.");
    } catch {
      setForgotStatus("Password reset instructions have been generated.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between relative overflow-hidden transition-colors ${
      isDark ? "bg-[#141514] text-[#EEE8DE]" : "bg-[#F7F7F5] text-[#202221]"
    }`}>
      {/* Ambient Brand Atmospheric Lighting (Restrained Copper & Graphite Glow) */}
      <div 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full blur-[140px] opacity-40 transition-opacity"
        style={{
          background: isDark 
            ? "radial-gradient(circle, rgba(161, 108, 80, 0.22) 0%, rgba(32, 34, 33, 0) 70%)"
            : "radial-gradient(circle, rgba(201, 180, 155, 0.35) 0%, rgba(247, 247, 245, 0) 70%)"
        }}
      />
      <div 
        className="pointer-events-none absolute -bottom-40 right-10 w-[450px] h-[450px] rounded-full blur-[120px] opacity-25"
        style={{
          background: isDark 
            ? "radial-gradient(circle, rgba(201, 180, 155, 0.15) 0%, rgba(32, 34, 33, 0) 70%)"
            : "radial-gradient(circle, rgba(161, 108, 80, 0.15) 0%, rgba(247, 247, 245, 0) 70%)"
        }}
      />

      {/* Top Header Navigation Strip */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src="/branding/p9-monogram-logo.png" 
            alt="PROMETHEUS-9 Monogram" 
            className="w-9 h-9 object-contain drop-shadow-md"
          />
          <div className="flex flex-col">
            <span className="font-editorial text-sm tracking-widest font-bold uppercase">
              PROMETHEUS<span className="text-[#A16C50]">-9</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase opacity-60 font-sans">
              Autonomous Marketing OS
            </span>
          </div>
        </div>

        {/* System Availability Status Pill */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-mono-metrics ${
          isDark 
            ? "bg-[#1C1E1C]/90 border-[#2E332E] text-[#C9B49B]" 
            : "bg-[#FFFFFF]/90 border-[#E2E1DC] text-[#686B67] shadow-xs"
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYSTEM ACTIVE &bull; v1.0.0</span>
        </div>
      </header>

      {/* Main FlowSignIn Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[430px] relative">
          
          {/* Floating Emblem Top Accent */}
          <div className="flex justify-center -mb-7 relative z-20">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center p-2.5 border shadow-xl transition-all ${
              isDark 
                ? "bg-[#202221] border-[#A16C50]/40 shadow-black/50" 
                : "bg-[#FFFFFF] border-[#E2D5C5] shadow-stone-300/40"
            }`}>
              <img 
                src="/branding/p9-monogram-logo.png" 
                alt="P9 Monogram Emblem" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* FlowSignIn Card Surface */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className={`rounded-2xl border p-7 sm:p-9 pt-12 shadow-2xl backdrop-blur-xl relative transition-all ${
              isDark 
                ? "bg-[#1A1C1A]/95 border-[#2E332E] shadow-black/60" 
                : "bg-[#FFFFFF]/98 border-[#E2E1DC] shadow-stone-200/60"
            }`}
          >
            {/* Card Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-editorial tracking-tight font-bold">
                Welcome Back
              </h1>
              <p className={`text-[12.5px] mt-1 font-sans ${isDark ? "text-[#8E8A82]" : "text-[#686B67]"}`}>
                Sign in to your autonomous marketing workforce.
              </p>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl border flex items-start gap-2.5 text-[12.5px] bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="flex-1 leading-snug">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Login ID / Email Field */}
              <div>
                <label className={`block text-[11px] font-mono-metrics uppercase tracking-wider mb-1.5 font-semibold ${
                  isDark ? "text-[#C9B49B]" : "text-[#555750]"
                }`}>
                  Login ID / Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ayush@admin"
                    required
                    disabled={loading}
                    autoComplete="username"
                    className={`w-full h-[46px] px-3.5 rounded-xl border text-[13.5px] font-sans transition-all outline-none ${
                      isDark 
                        ? "bg-[#121312] border-[#2E332E] text-[#F5F2EB] placeholder-[#666863] focus:border-[#A16C50] focus:ring-1 focus:ring-[#A16C50]" 
                        : "bg-[#F8F8F6] border-[#E2E1DC] text-[#202221] placeholder-[#898B85] focus:border-[#B99A78] focus:ring-1 focus:ring-[#B99A78]"
                    }`}
                  />
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-[11px] font-mono-metrics uppercase tracking-wider font-semibold ${
                    isDark ? "text-[#C9B49B]" : "text-[#555750]"
                  }`}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className={`text-[11.5px] hover:underline font-medium ${
                      isDark ? "text-[#C9B49B]/80 hover:text-[#C9B49B]" : "text-[#806347] hover:text-[#5E4935]"
                    }`}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className={`w-full h-[46px] px-3.5 pr-10 rounded-xl border text-[13.5px] font-sans transition-all outline-none ${
                      isDark 
                        ? "bg-[#121312] border-[#2E332E] text-[#F5F2EB] placeholder-[#666863] focus:border-[#A16C50] focus:ring-1 focus:ring-[#A16C50]" 
                        : "bg-[#F8F8F6] border-[#E2E1DC] text-[#202221] placeholder-[#898B85] focus:border-[#B99A78] focus:ring-1 focus:ring-[#B99A78]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                      isDark ? "text-[#8E8A82] hover:text-[#EEE8DE]" : "text-[#70726B] hover:text-[#202221]"
                    }`}
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => setRemember(!remember)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      remember 
                        ? (isDark ? "bg-[#A16C50] border-[#A16C50]" : "bg-[#292B29] border-[#292B29]") 
                        : (isDark ? "border-[#2E332E] bg-[#121312]" : "border-[#E2E1DC] bg-[#FFFFFF]")
                    }`}
                  >
                    {remember && <Check className="w-3 h-3 text-[#FFFFFF]" strokeWidth={3} />}
                  </button>
                  <span className={`text-[12.5px] font-sans ${isDark ? "text-[#8E8A82]" : "text-[#686B67]"}`}>
                    Remember this device for 7 days
                  </span>
                </label>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[46px] rounded-xl font-semibold text-[13.5px] cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mt-2 bg-[#202221] hover:bg-[#343735] text-[#FFFFFF] border border-[#414542] hover:border-[#A16C50]"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-[#C9B49B]" />
                  </>
                )}
              </button>
            </form>

            {/* Initial Development Credentials Hint Pill */}
            <div className={`mt-6 pt-5 border-t text-center ${isDark ? "border-[#2E332E]" : "border-[#E2E1DC]"}`}>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono-metrics ${
                isDark ? "bg-[#121312] border-[#2E332E] text-[#C9B49B]" : "bg-[#F3F2EE] border-[#E2E1DC] text-[#686B67]"
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-[#A16C50]" />
                <span>Default Initial Admin: <strong>ayush@admin</strong> / <strong>admin</strong></span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer System Status */}
      <footer className="relative z-10 w-full px-6 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono-metrics opacity-60 gap-2">
        <span>PROMETHEUS-9 &bull; AUTONOMOUS MARKETING & CREATIVE ENGINE</span>
        <div className="flex items-center gap-3">
          <span>ARGON2ID + HS256 SECURED</span>
          <span>&bull;</span>
          <span>TENANT ISOLATION ACTIVE</span>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL: FORCED FIRST-LOGIN PASSWORD CHANGE               */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showPasswordChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl border p-7 shadow-2xl relative ${
                isDark ? "bg-[#181A18] border-[#2E332E] text-[#EEE8DE]" : "bg-[#FFFFFF] border-[#E2E1DC] text-[#202221]"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#A16C50]/20 text-[#A16C50]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-editorial">Set New Secure Password</h2>
                  <p className={`text-[12px] ${isDark ? "text-[#8E8A82]" : "text-[#686B67]"}`}>
                    First-time administrator login detected. Update the default password.
                  </p>
                </div>
              </div>

              {changeError && (
                <div className="mb-4 p-3 rounded-lg border text-[12px] bg-rose-500/10 border-rose-500/30 text-rose-500">
                  {changeError}
                </div>
              )}

              <form onSubmit={handleForcePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono-metrics uppercase tracking-wider mb-1">
                    Current Default Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    readOnly
                    className={`w-full h-10 px-3 rounded-lg border text-[13px] opacity-70 ${
                      isDark ? "bg-[#121312] border-[#2E332E]" : "bg-[#F3F2EE] border-[#E2E1DC]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-metrics uppercase tracking-wider mb-1 font-semibold">
                    New Secure Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new secure password"
                    required
                    autoFocus
                    className={`w-full h-11 px-3.5 rounded-xl border text-[13.5px] outline-none transition-all ${
                      isDark 
                        ? "bg-[#121312] border-[#2E332E] focus:border-[#A16C50]" 
                        : "bg-[#F8F8F6] border-[#E2E1DC] focus:border-[#B99A78]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-metrics uppercase tracking-wider mb-1 font-semibold">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    className={`w-full h-11 px-3.5 rounded-xl border text-[13.5px] outline-none transition-all ${
                      isDark 
                        ? "bg-[#121312] border-[#2E332E] focus:border-[#A16C50]" 
                        : "bg-[#F8F8F6] border-[#E2E1DC] focus:border-[#B99A78]"
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full h-11 rounded-xl font-semibold text-[13.5px] cursor-pointer shadow-md bg-[#202221] hover:bg-[#343735] text-[#FFFFFF] border border-[#414542] flex items-center justify-center gap-2"
                  >
                    {changingPassword ? "Updating Password..." : "Update Password & Enter Platform"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: FORGOT PASSWORD                                  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl border p-7 shadow-2xl relative ${
                isDark ? "bg-[#181A18] border-[#2E332E] text-[#EEE8DE]" : "bg-[#FFFFFF] border-[#E2E1DC] text-[#202221]"
              }`}
            >
              <h2 className="text-lg font-bold font-editorial mb-1">Reset Password</h2>
              <p className={`text-[12px] mb-4 ${isDark ? "text-[#8E8A82]" : "text-[#686B67]"}`}>
                Enter your registered administrator email address to generate reset instructions.
              </p>

              {forgotStatus ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border text-[12.5px] bg-emerald-500/10 border-emerald-500/30 text-emerald-500">
                    {forgotStatus}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotStatus(null);
                    }}
                    className="w-full h-10 rounded-lg text-[13px] font-semibold bg-[#292B29] text-white"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono-metrics uppercase tracking-wider mb-1 font-semibold">
                      Account Email
                    </label>
                    <input
                      type="text"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="ayush@admin"
                      required
                      autoFocus
                      className={`w-full h-11 px-3.5 rounded-xl border text-[13.5px] outline-none ${
                        isDark ? "bg-[#121312] border-[#2E332E]" : "bg-[#F8F8F6] border-[#E2E1DC]"
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className={`px-4 py-2 rounded-lg text-[12.5px] font-medium border ${
                        isDark ? "border-[#2E332E] hover:bg-[#202221]" : "border-[#E2E1DC] hover:bg-[#F3F2EE]"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-2 rounded-lg text-[12.5px] font-semibold bg-[#202221] text-white"
                    >
                      {forgotLoading ? "Generating..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
