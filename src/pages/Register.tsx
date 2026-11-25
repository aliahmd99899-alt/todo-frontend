import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../server/todo.api';
import type { User } from '../types/Types';

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (err instanceof Error ? err.message : fallback);

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    try {
      const res: Partial<User> & { access_token?: string; user?: User } =
        await authAPI.register({
          name: trimmedName,
          email: trimmedEmail,
          password,
        });

      if (res.access_token) {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user_name', trimmedName);
        localStorage.setItem('user_email', res.user?.email ?? trimmedEmail);
        localStorage.setItem('user_data', JSON.stringify(res.user ?? res));
      } else {
        const loginData = await authAPI.login({
          email: trimmedEmail,
          password,
        });
        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('user_name', trimmedName);
        localStorage.setItem('user_email', loginData.user?.email ?? trimmedEmail);
        if (loginData.user) {
          localStorage.setItem('user_data', JSON.stringify(loginData.user));
        }
      }

      window.location.href = '/';
    } catch (err) {
      setError(getErrorMessage(err, 'Register failed. Please try again.'));
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0E0A22] font-sans text-white">
      <div className="pointer-events-none fixed -right-60 -top-72 h-[820px] w-[820px] rounded-full bg-[#7C3AED] opacity-40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-80 -left-48 h-[860px] w-[860px] rounded-full bg-gradient-to-tr from-[#0E7490] to-[#14B8A6] opacity-25 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          {/* Logo */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] shadow-lg shadow-purple-700/40" />
            <span className="text-lg font-bold tracking-[0.14em] text-white">LUMINA</span>
          </Link>

          {/* Title */}
          <h1 className="mb-2 text-center text-2xl font-bold tracking-[-0.01em] text-white">
            Create your{' '}
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent">
              account
            </span>
          </h1>
          <p className="mb-6 text-center text-[13.5px] text-white/40">
            Start organizing your tasks with Lumina.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-white/50">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="Alex Rivera"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-white/50">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="alex@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-white/50">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-white/50">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-pink-500/25 bg-pink-500/10 px-3 py-2 text-[12.5px] text-pink-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.02]"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-white/40">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-violet-300 transition hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}