
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
       {/* Background Decor */}
       <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background-light dark:bg-background-dark">
        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] bg-grid"></div>
        <div className="absolute inset-0 w-full h-full blur-[16px] opacity-70 dark:opacity-40 scale-105">
          <div className="absolute inset-0 grid grid-cols-12 gap-6 p-8 -rotate-1">
            <div className="col-span-2 h-full bg-gray-200/50 dark:bg-white/5 rounded-2xl border border-white/20"></div>
            <div className="col-span-10 h-full flex flex-col gap-6">
              <div className="h-20 w-full bg-white/60 dark:bg-white/5 rounded-2xl border border-white/20"></div>
              <div className="flex-1 grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[480px] bg-white dark:bg-[#2a1b24] rounded-xl shadow-2xl overflow-hidden relative z-10 animate-fade-in">
        <div className="h-2 w-full bg-gradient-to-r from-primary/80 via-primary to-purple-500"></div>
        <div className="p-8 md:p-12 flex flex-col items-center">
          <Link to="/" className="mb-8 flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-xl">diamond</span>
            </div>
            <h1 className="text-[#181114] dark:text-white tracking-tight text-2xl font-extrabold leading-tight">LuxeLife OS</h1>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-[#181114] dark:text-white tracking-tight text-[28px] font-bold leading-tight mb-2">Start your luxury journey</h2>
            <p className="text-[#8a6075] dark:text-[#ccb0be] text-sm font-normal">Create an account to organize your life in style.</p>
          </div>

          <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <label className="flex flex-col w-full group">
              <span className="text-[#181114] dark:text-white text-sm font-semibold pb-2 group-focus-within:text-primary transition-colors">Full Name</span>
              <div className="relative">
                <input 
                  className="peer form-input w-full rounded-xl border border-[#e6dbe0] dark:border-[#4a3b44] bg-white dark:bg-[#33242d] h-12 px-4 pl-11 text-[#181114] dark:text-white placeholder-[#8a6075] dark:placeholder-[#8a7580] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                  placeholder="Jane Doe" 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6075] peer-focus:text-primary transition-colors text-[20px]">person</span>
              </div>
            </label>

            <label className="flex flex-col w-full group">
              <span className="text-[#181114] dark:text-white text-sm font-semibold pb-2 group-focus-within:text-primary transition-colors">Email Address</span>
              <div className="relative">
                <input 
                  className="peer form-input w-full rounded-xl border border-[#e6dbe0] dark:border-[#4a3b44] bg-white dark:bg-[#33242d] h-12 px-4 pl-11 text-[#181114] dark:text-white placeholder-[#8a6075] dark:placeholder-[#8a7580] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                  placeholder="jane@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6075] peer-focus:text-primary transition-colors text-[20px]">mail</span>
              </div>
            </label>

            <label className="flex flex-col w-full group">
              <span className="text-[#181114] dark:text-white text-sm font-semibold pb-2 group-focus-within:text-primary transition-colors">Create Password</span>
              <div className="relative flex w-full items-stretch">
                <input 
                  className="peer form-input w-full rounded-xl border border-[#e6dbe0] dark:border-[#4a3b44] bg-white dark:bg-[#33242d] h-12 px-4 pl-11 pr-12 text-[#181114] dark:text-white placeholder-[#8a6075] dark:placeholder-[#8a7580] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6075] peer-focus:text-primary transition-colors text-[20px]">lock</span>
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a6075] hover:text-[#181114] dark:hover:text-white transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <div className="mt-2 flex gap-1 items-center">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strength >= i ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-600'}`}
                  ></div>
                ))}
                <span className="text-xs text-[#8a6075] ml-2 font-medium">
                  {strength === 0 ? 'Too short' : strength === 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 mt-1 cursor-pointer group">
              <input className="mt-1 w-4 h-4 text-primary bg-white dark:bg-[#33242d] border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-offset-0" type="checkbox" required />
              <span className="text-sm text-[#8a6075] leading-snug select-none group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                I agree to the <a className="text-primary hover:underline font-bold" href="#">Terms of Service</a> and <a className="text-primary hover:underline font-bold" href="#">Privacy Policy</a>
              </span>
            </label>

            <button 
              disabled={loading}
              className="w-full bg-primary hover:bg-pink-600 text-white font-bold h-12 rounded-xl mt-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>

          <div className="relative w-full my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Or continue with</span>
            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <div className="flex gap-4 w-full">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex-1 h-12 border border-[#e6dbe0] dark:border-[#4a3b44] rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#33242d] transition-colors gap-3 bg-white dark:bg-[#2a1b24] text-[#181114] dark:text-white font-medium text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img alt="Google Logo" className="w-5 h-5 group-hover:scale-110 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv9TIKT5SSfV_SyMov__vtSNXIvQZZN1tayIg2_zbYnXD6aiI9I2Rz1LbKXm8t23zQb51c4Rk74X_wAvRRvSSmrxHImPBUlnDdOMvgUi-AR-MlU0eI5dHoREnzBY6eje0D_dS_bgdnS7uus0seqgXlnSX3MJfTJ9Hau6jQd8Qk3zrkFHrZFxpIDTXrN9pzdqRw7U_r5sA-0r1t1Ztnqolt6YFG63kE07Aen4WgAeVuqdUl4muFE8WBnXWqW8d7aWexIKgYyLwt4Hg" />
              Google
            </button>
            <button 
              type="button"
              disabled={loading}
              className="flex-1 h-12 border border-[#e6dbe0] dark:border-[#4a3b44] rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#33242d] transition-colors gap-3 bg-white dark:bg-[#2a1b24] text-[#181114] dark:text-white font-medium text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-black dark:text-white text-[22px] group-hover:scale-110 transition-transform">ios</span>
              Apple
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#8a6075]">
              Already a member?
              <Link className="text-primary font-bold hover:underline transition-all ml-1" to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
