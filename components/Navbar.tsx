
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode, isDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <span className="material-symbols-outlined text-primary text-3xl transition-transform group-hover:rotate-12 font-bold">diamond</span>
            <span className="font-display font-extrabold text-xl tracking-tight dark:text-white">LuxeLife OS</span>
          </Link>
          
          <div className="hidden md:flex ml-10 items-baseline space-x-8">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">Home</Link>
            <Link to="/features" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">Features</Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">About</Link>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link 
              to="/signup"
              className="bg-primary hover:bg-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <div className={`absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md -z-10 border-b transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'} border-slate-200 dark:border-slate-800`}></div>
    </nav>
  );
};

export default Navbar;
