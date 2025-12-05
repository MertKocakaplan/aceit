import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const DashboardHeader = ({ user, onLogout }) => {
  return (
    <header className="relative z-20 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md shadow-sm">
      {/* Decorative gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-400/30 dark:via-primary-600/30 to-transparent" />

      {/* Subtle shadow gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-neutral-100/20 dark:to-neutral-950/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-600 dark:to-primary-800 rounded-2xl flex items-center justify-center shadow-elegant-lg group-hover:shadow-elegant-xl transition-all duration-300 group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-normal text-primary-700 dark:text-primary-400 font-display tracking-wide">
              AceIt
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-700"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors font-sans"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
