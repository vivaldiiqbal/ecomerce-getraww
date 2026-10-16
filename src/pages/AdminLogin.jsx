import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff, Store } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('admin@getraw.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      const { token, user } = response.data.data;

      // Verify if user is admin
      if (user.role !== 'admin') {
        setErrorMsg('Akses Ditolak: Akun ini tidak memiliki hak akses Administrator.');
        setLoading(false);
        return;
      }

      // Save token and user details
      localStorage.setItem('thx_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to admin products manager
      window.location.href = '/admin/products';
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau kata sandi tidak cocok. Silakan periksa kembali.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-white selection:text-black">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img 
            src="/logo-transparent.png" 
            alt="GETRAW Logo" 
            className="h-10 sm:h-12 w-auto object-contain filter invert opacity-90 mb-5" 
          />
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-white">
            ADMIN PORTAL
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase mt-2">
            GETRAW® STUDIO
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/80 border border-red-800/80 rounded-xl flex items-start gap-3 text-red-200 text-xs sm:text-sm animate-shake">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-red-300">Gagal Masuk</p>
              <p className="mt-0.5 text-zinc-300">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
              Email Admin
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@getraw.com"
                className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-white rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-white rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                MASUK PORTAL ADMIN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Back to Shop Link */}
        <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            <Store className="w-3.5 h-3.5" />
            Kembali ke Toko Utama
          </a>
        </div>
      </div>
    </div>
  );
};
