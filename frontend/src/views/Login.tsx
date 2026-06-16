import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 font-sans selection:bg-pink-300 selection:text-pink-900">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="relative w-full max-w-md space-y-8 rounded-3xl bg-white/10 p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl border border-white/20 transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.5)]">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-indigo-100">
            Sign in to access your collaborative workspaces.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-5">
            <div className="relative group">
              <label className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-1 block transition-colors group-focus-within:text-pink-300">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-pink-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 shadow-inner sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative group">
              <label className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-1 block transition-colors group-focus-within:text-pink-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-pink-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 shadow-inner sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative flex w-full justify-center items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-600 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-pink-100 to-indigo-100 transition-transform duration-500 group-hover:translate-x-0"></div>
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
