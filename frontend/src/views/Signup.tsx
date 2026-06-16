import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Register
      await api.post('/auth/register', { name, email, password });
      // Instantly login
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="w-full max-w-md p-8 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Join the Team</h2>
          <p className="text-slate-500 mt-2 font-medium">Create an account to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
              placeholder="Steve Jobs"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transform transition-all hover:-translate-y-0.5"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
