import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, User, Eye, EyeOff, Lock, Mail, Phone, UserCheck, LogOut, CheckCircle2, Shield } from 'lucide-react';

export const AuthDrawer = () => {
  const { drawers, toggleDrawer, user, loginUser, registerUser, logoutUser, showToast } = useShop();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!drawers.auth) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('Mohon isi email dan kata sandi Anda.', 'error');
      return;
    }
    setLoading(true);
    const success = await loginUser(loginEmail, loginPassword);
    setLoading(false);
    
    if (success) {
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('Mohon lengkapi semua kolom pendaftaran.', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Kata sandi dan konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }
    if (!agreedTerms) {
      showToast('Anda harus menyetujui Syarat & Ketentuan Layanan.', 'error');
      return;
    }
    
    setLoading(true);
    const success = await registerUser(regName, regEmail, regPhone, regPassword);
    setLoading(false);

    if (success) {
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Masukkan alamat email Anda terlebih dahulu.', 'info');
      return;
    }
    showToast(`Tautan instruksi reset kata sandi telah dikirim ke ${loginEmail}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => toggleDrawer('auth', false)}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform flex flex-col animate-slide-left border-l border-neutral-200">
        
        {/* Pengepala Panel Hitam (Black Header Panel) */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-black text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider font-display">AKUN PENGGUNA</h3>
              <p className="text-[10px] text-neutral-400 font-medium">
                {user ? 'Profil & Status Member Active' : 'Masuk atau Daftar Member Baru'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleDrawer('auth', false)}
            aria-label="Tutup Panel"
            className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-800">
          
          {/* STATE AKAUN AKTIF (PENGGUNA SUDAH LOG MASUK) */}
          {user ? (
            <div className="space-y-6 animate-fade-in">
              {/* Profile Card Summary */}
              <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-white text-black font-black text-xl flex items-center justify-center border-2 border-emerald-400 shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-black tracking-tight">{user.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono">{user.email}</p>
                    <span className="inline-flex items-center space-x-1 mt-1.5 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                      <Shield className="w-3 h-3" />
                      <span>{user.memberStatus}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 grid grid-cols-2 gap-3 text-[11px] text-neutral-400">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Nomor Telepon</span>
                    <span className="font-semibold text-white">{user.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-500">Bergabung</span>
                    <span className="font-semibold text-white">{user.joinedDate || '2026'}</span>
                  </div>
                </div>
              </div>

              {/* Member Privileges Box */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-black flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Keuntungan Member GETRAW®</span>
                </h5>
                <ul className="space-y-1.5 text-neutral-600 text-[11px] font-medium list-disc list-inside">
                  <li>Gratis Ongkir se-Jabodetabek otomatis saat checkout</li>
                  <li>Akses eksklusif rilis artikel New Drop terbatas</li>
                  <li>Kupon diskon khusus member hingga 50%</li>
                  <li>Riwayat pesanan & cetak struk instan tanpa batas</li>
                </ul>
              </div>

              {/* Logout Action Button */}
              <div className="pt-4">
                <button
                  onClick={logoutUser}
                  className="w-full py-3.5 bg-black hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>KELUAR AKUN (LOGOUT)</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE BELUM LOG MASUK (FORM TAB LOG IN & REGISTER) */
            <div className="space-y-6 animate-fade-in">
              
              {/* Navigasi Dua Tab (MASUK & DAFTAR AKUN) */}
              <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-black uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`py-2.5 rounded-lg transition-all ${
                    activeTab === 'login'
                      ? 'bg-black text-white shadow-md'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  MASUK
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`py-2.5 rounded-lg transition-all ${
                    activeTab === 'register'
                      ? 'bg-black text-white shadow-md'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  DAFTAR AKUN
                </button>
              </div>

              {/* BORANG TAB 1: MASUK (LOGIN) */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Alamat Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-xs uppercase tracking-wider text-neutral-700">
                        Kata Sandi
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] font-bold text-neutral-500 hover:text-black underline"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-10 py-3 text-xs font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 text-neutral-400 hover:text-black p-1"
                        aria-label="Tampilkan Kata Sandi"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>MASUK SEKARANG</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* BORANG TAB 2: DAFTAR AKUN (REGISTER) */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Nama Lengkap
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Alamat Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Nomor WhatsApp
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="081289341029"
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Kata Sandi
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Buat kata sandi baru"
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 text-neutral-400 hover:text-black p-1"
                        aria-label="Tampilkan Kata Sandi"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi"
                        className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3.5 text-neutral-400 hover:text-black p-1"
                        aria-label="Tampilkan Konfirmasi Kata Sandi"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Persetujuan Syarat & Ketentuan */}
                  <label className="flex items-start space-x-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-black accent-black cursor-pointer"
                    />
                    <span className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                      Saya menyetujui <span className="font-bold text-black underline">Syarat & Ketentuan</span> serta Kebijakan Privasi GETRAW®.
                    </span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>BUAT AKUN BARU</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

      </aside>
    </>
  );
};
