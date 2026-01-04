
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05] bg-grid"></div>
        <div className="absolute inset-0 filter blur-[60px] opacity-50 dark:opacity-30 transform scale-105">
          <div className="absolute left-[5%] top-[5%] bottom-[5%] w-[18%] bg-gray-200 dark:bg-white/10 rounded-3xl border border-gray-300/50"></div>
          <div className="absolute left-[25%] top-[5%] right-[5%] h-[12%] bg-gray-200 dark:bg-white/10 rounded-3xl border border-gray-300/50"></div>
          <div className="absolute left-[25%] top-[20%] w-[25%] h-[25%] bg-primary/10 rounded-3xl border border-primary/20"></div>
          <div className="absolute left-[52%] top-[20%] right-[5%] h-[35%] bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-300/30"></div>
        </div>
        <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px]"></div>
      </div>

      <main className="w-full max-w-[440px] z-10 relative animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-14 h-14 bg-white dark:bg-[#2f1b25] shadow-sm rounded-2xl flex items-center justify-center mb-4 text-primary transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <span className="material-symbols-outlined text-[32px]">diamond</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#181114] dark:text-white">LuxeLife OS</h1>
        </div>

        <div className="bg-white dark:bg-[#2f1b25] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-white/5 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 to-primary"></div>
          <div className="p-8 pt-10">
            <div className="text-center mb-8">
              <h2 className="text-[#181114] dark:text-white text-[26px] font-bold leading-tight mb-2">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Log in to your luxury dashboard</p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-2">
                  {error}
                </div>
              )}

              <label className="flex flex-col gap-2">
                <span className="text-[#181114] dark:text-gray-200 text-sm font-semibold pl-1">Email Address</span>
                <input 
                  className="form-input w-full h-14 px-5 rounded-lg text-[#181114] dark:text-white bg-[#fcfcfc] dark:bg-[#3a222e] border border-[#e6dbe0] dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#8a6075]/70 dark:placeholder:text-white/30 text-base" 
                  placeholder="name@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[#181114] dark:text-gray-200 text-sm font-semibold">Password</span>
                </div>
                <div className="relative w-full">
                  <input 
                    className="form-input w-full h-14 pl-5 pr-12 rounded-lg text-[#181114] dark:text-white bg-[#fcfcfc] dark:bg-[#3a222e] border border-[#e6dbe0] dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#8a6075]/70 dark:placeholder:text-white/30 text-base" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-[#8a6075] dark:text-gray-400 hover:text-primary transition-colors focus:outline-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <a className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a>
                </div>
              </label>

              <button 
                disabled={loading}
                className="w-full h-14 mt-2 bg-primary hover:bg-pink-600 active:scale-[0.98] text-white text-base font-bold rounded-lg shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-100 dark:border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Or continue with</span>
                <div className="flex-grow border-t border-gray-100 dark:border-white/10"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="h-12 flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img className="w-5 h-5 group-hover:scale-110 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9TfOkeTUVLu_q3_xtIeWnNzwQmuKX0cC3496SHajUsDpBq2Nibt9lyiB23xpLVH94Y6M7277-pBYluwEA_MxVrfdWrQmVNX4jOjv3BopPhvakeygnLuVn0QrB8MiA0Ui-xzkgeVhIPG4Ex2yzr8n3mGYycDQyEXXmcnj0MRqtbtStGsldtsuZUb6gqvP5PZeHRTL2QddyMp1xtGovdahGEfEoyUyndE7O-GuPwdOtIBDQc01G167cwM1QPZIuxGOH13ybHrtFaeQ" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Google</span>
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  className="h-12 flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[22px] text-gray-900 dark:text-white group-hover:scale-110 transition-transform">ios</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Apple</span>
                </button>
              </div>
            </form>
          </div>
          <div className="bg-gray-50 dark:bg-black/20 p-4 text-center border-t border-gray-100 dark:border-white/5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              New to LuxeLife? 
              <Link className="font-bold text-primary hover:text-primary/80 transition-colors ml-1" to="/signup">Create an Account</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-400 font-medium">
          <a className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors" href="#">Privacy Policy</a>
          <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
          <a className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors" href="#">Terms of Service</a>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
