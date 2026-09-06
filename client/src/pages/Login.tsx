import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo credentials — hardcoded for hackathon demo
    setTimeout(() => {
      if (
        (email === 'admin@revivex.ai' && password === 'demo1234') ||
        (email === '' && password === '')
      ) {
        localStorage.setItem('revivex_auth', 'true');
        navigate('/');
      } else {
        setError('Invalid credentials. Try admin@revivex.ai / demo1234');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#090D16] rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#090D16] flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-[#090D16] tracking-tight">REVIVE X</div>
              <div className="text-xs text-[#00D4FF] font-semibold tracking-widest uppercase">AI Revenue Recovery</div>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Sign in to access the intelligence dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h1 className="text-xl font-bold text-[#090D16] mb-6">Welcome back</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@revivex.ai"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition text-sm"
              />
            </div>

            {error && (
              <div className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#090D16] text-white font-semibold text-sm hover:bg-[#0f1629] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#00D4FF]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-[#090D16] rounded-xl text-center">
            <p className="text-xs text-slate-400 mb-1">🎯 Demo Access</p>
            <p className="text-xs font-mono text-[#00D4FF]">admin@revivex.ai / demo1234</p>
            <p className="text-xs text-slate-500 mt-1">or click Sign In with empty fields</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          REVIVE X · AI-Powered Revenue Recovery · Hackathon Demo
        </p>
      </div>
    </div>
  );
};

export default Login;
